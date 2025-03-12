import ExcelJS from "exceljs";
import { User, Transaction } from "../models/index.js";

export const uploadFile = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    const data = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      data.push({
        CPF: row.getCell(1).text,
        Descrição: row.getCell(2).text,
        Data: row.getCell(3).text,
        Pontos: row.getCell(4).text,
        Dinheiro: row.getCell(5).text,
        Status: row.getCell(6).text,
      });
    });

    for (const row of data) {
      let cpf = row.CPF.replace(/\D/g, "");
      if (cpf.length !== 11) throw new Error(`CPF inválido: ${row.CPF}`);
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

      const user = await User.findOne({ where: { cpf } });
      if (!user) continue;

      const transactionDate = new Date(row.Data.split("-").reverse().join("-"));
      const pointsValue = parseFloat(row.Pontos.replace(",", "."));
      const moneyValue = parseFloat(
        row.Dinheiro.replace(/\./g, "").replace(",", "."),
      );

      await Transaction.create({
        user_id: user.id,
        description: row.Descrição,
        transactionDate,
        pointsValue,
        moneyValue,
        status: row.Status,
      });
    }

    res.status(200).json({
      message: `${data.length} transações processadas com sucesso!`,
      importedCount: data.length,
    });
  } catch (err) {
    res.status(400).json({
      error: "Erro no processamento do arquivo",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
