import { Transaction } from "../models/index.js";
import { Op } from "sequelize";

const userController = {
  async getStatement(req, res) {
    try {
      const { status, startDate, endDate } = req.query;
      const where = { user_id: req.user.id };

      // Filtro de status
      if (status) where.status = status;

      // Filtro de data
      if (startDate || endDate) {
        where.transactionDate = {};
        if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
        if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
      }

      const transactions = await Transaction.findAll({
        where,
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
