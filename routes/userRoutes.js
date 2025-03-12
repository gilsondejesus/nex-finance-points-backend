import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/transactions", auth, userController.getStatement);
router.get("/wallet", auth, userController.getWallet);

export default router;
