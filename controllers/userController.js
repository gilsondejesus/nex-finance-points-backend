import { Transaction } from "../models/index.js";
import { Op } from "sequelize";

const userController = {
  async getStatement(req, res) {
    try {
      const { status, startDate, endDate } = req.query;
      const where = { user_id: req.user.id };

      // Filtro de status
      if (status) where.status = status;

      if (startDate || endDate) {
        where.transactionDate = {};

        if (startDate) {
          const start = new Date(startDate);
          start.setUTCHours(0, 0, 0, 0);
          where.transactionDate[Op.gte] = start;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setUTCHours(23, 59, 59, 999);
          where.transactionDate[Op.lte] = end;
        }
      }

      const transactions = await Transaction.findAll({
        where,
        attributes: [
          "id",
          "description",
          "transactionDate",
          "pointsValue",
          "moneyValue",
          "status",
        ],
        order: [["transactionDate", "DESC"]],
      });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar extrato" });
    }
  },

  async getWallet(req, res) {
    try {
      const total = await Transaction.sum("pointsValue", {
        where: {
          user_id: req.user.id,
          status: "Aprovado",
        },
      });
      res.json({ total });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar saldo" });
    }
  },
};

export default userController;
