import "dotenv/config";
import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Configuração detalhada do CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Se estiver usando cookies/tokens
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar ao banco:", error);
  });
