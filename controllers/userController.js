import { Transaction } from '../models/index.js';

export const userController = {
  async getStatement(req, res) {
    try {
      const transactions = await Transaction.findAll({
        where: { user_id: req.user.id },
        order: [['transactionDate', 'DESC']]
      });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar extrato' });
    }
  },

  async getWallet(req, res) {
    try {
      const total = await Transaction.sum('pointsValue', {
        where: { 
          user_id: req.user.id,
          status: 'Aprovado'
        }
      });
      res.json({ total });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar saldo' });
    }
  }
};