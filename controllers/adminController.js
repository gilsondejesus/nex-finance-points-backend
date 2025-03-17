import ExcelJS from "exceljs";
import { Op } from "sequelize";
import { User, Transaction } from "../models/index.js";

// Validação e formatação do CPF
const validateAndFormatCPF = (cpf) => {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) {
    throw new Error(`CPF inválido: ${cpf}`);
  }

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const parseExcelDate = (dateString) => {
  const [day, month, year] = dateString.split("/");
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return utcDate.toISOString().split("T")[0];
};

// Upload de arquivo
export const uploadFile = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    const data = [];

    // Validação do cabeçalho
    const headerRow = worksheet.getRow(1);
    const expectedHeaders = [
      "CPF",
      "Descrição da transação",
      "Data da transação",
      "Valor em pontos",
      "Valor em dinheiro",
      "Status",
    ];

    headerRow.eachCell((cell, colNumber) => {
      if (cell.value !== expectedHeaders[colNumber - 1]) {
        throw new Error(`Cabeçalho inválido na coluna ${colNumber}`);
      }
    });

    // Processamento das linhas
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      data.push({
        cpf: row.getCell(1).text,
        descricao: row.getCell(2).text,
        dataTransacao: row.getCell(3).text,
        pontos: row.getCell(4).text,
        dinheiro: row.getCell(5).text,
        status: row.getCell(6).text,
      });
    });

    let successCount = 0;
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        // Validação do CPF
        const cpfFormatado = validateAndFormatCPF(row.cpf);

        // Validação da Data (DD/MM/YYYY)
        const dataTransacao = parseExcelDate(row.dataTransacao);

        // Validação dos Pontos
        const pontos = parseFloat(row.pontos.toString().replace(",", "."));
        if (isNaN(pontos)) {
          throw new Error("Formato de pontos inválido");
        }

        // Validação do Dinheiro
        const dinheiroStr = row.dinheiro.replace(/\./g, "");
        const dinheiro = parseFloat(dinheiroStr.replace(",", "."));

        if (isNaN(dinheiro)) {
          throw new Error("Formato monetário inválido");
        }

        if (dinheiroStr.includes(",")) {
          const partes = dinheiroStr.split(",");
          if (partes[1].length !== 2) {
            throw new Error("Centavos devem ter 2 dígitos");
          }
        }

        // Validação do Status
        const statusValidos = ["Aprovado", "Reprovado", "Em avaliação"];
        if (!statusValidos.includes(row.status)) {
          throw new Error("Status inválido");
        }

        // Buscar usuário
        const user = await User.findOne({ where: { cpf: cpfFormatado } });
        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        // Criar transação
        await Transaction.create({
          user_id: user.id,
          description: row.descricao,
          transactionDate: dataTransacao,
          pointsValue: pontos,
          moneyValue: dinheiro,
          status: row.status,
        });

        successCount++;
      } catch (error) {
        errors.push({
          linha: index + 2,
          erro: error.message,
          dados: row,
        });
      }
    }

    res.status(200).json({
      message: `Processamento concluído: ${successCount} sucesso(s), ${errors.length} erro(s)`,
      successCount,
      errors,
    });
  } catch (err) {
    res.status(400).json({
      error: "Erro no processamento do arquivo",
      details: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
};

// Gerar relatório com filtros
export const generateReport = async (req, res) => {
  try {
    const {
      cpf,
      startDate,
      endDate,
      minPoints,
      maxPoints,
      minMoney,
      maxMoney,
      status,
    } = req.query;

    const where = {};
    const userWhere = {};

    // Filtro de CPF
    if (cpf) {
      try {
        userWhere.cpf = validateAndFormatCPF(cpf);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    // Filtro de data corrigido
    if (startDate || endDate) {
      where.transactionDate = {};

      if (startDate) {
        const [year, month, day] = startDate.split("-");
        where.transactionDate[Op.gte] = new Date(year, month - 1, day);
      }

      if (endDate) {
        const [year, month, day] = endDate.split("-");
        const endOfDay = new Date(year, month - 1, day);
        endOfDay.setHours(23, 59, 59, 999);
        where.transactionDate[Op.lte] = endOfDay;
      }
    }

    // Filtro de pontos
    if (minPoints || maxPoints) {
      where.pointsValue = {};
      if (minPoints) where.pointsValue[Op.gte] = parseFloat(minPoints);
      if (maxPoints) where.pointsValue[Op.lte] = parseFloat(maxPoints);
    }

    // Filtro de dinheiro
    if (minMoney || maxMoney) {
      where.moneyValue = {};
      if (minMoney) where.moneyValue[Op.gte] = parseFloat(minMoney);
      if (maxMoney) where.moneyValue[Op.lte] = parseFloat(maxMoney);
    }

    // Filtro de status
    if (status) {
      where.status = status;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "cpf"],
          where: userWhere,
          required: true,
        },
      ],
      order: [["transactionDate", "DESC"]],
    });

    // Formatação melhorada
    const formatted = transactions.map((trans) => {
      const transactionDate =
        trans.transactionDate instanceof Date
          ? trans.transactionDate
          : new Date(trans.transactionDate);

      return {
        CPF: trans.user?.cpf || "N/A",
        Descrição: trans.description,
        Data: transactionDate.toLocaleDateString("pt-BR"),
        Pontos: Number(trans.pointsValue).toLocaleString("pt-BR", {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }),
        Dinheiro: Number(trans.moneyValue).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        Status: trans.status,
      };
    });

    res.status(200).json({
      total: formatted.length,
      periodo:
        startDate || endDate
          ? `${startDate || "Início"} à ${endDate || "Atual"}`
          : "Todos os registros",
      transacoes: formatted,
    });
  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({
      error: "Erro ao gerar relatório",
      details: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};
