import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const authController = {
  async register(req, res) {
    try {
      // Validação de CPF
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(req.body.cpf)) {
        return res.status(400).json({ error: "Formato de CPF inválido" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await User.create({
        ...req.body,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.status(201).json({ token });
    } catch (error) {
      console.error("Detalhes do erro:", error.errors);
      res.status(400).json({ error: "Erro no registro: " + error.message });
    }
  },

  async login(req, res) {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });

      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.json({
        token,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro no login" });
    }
  },
};

export default authController;
