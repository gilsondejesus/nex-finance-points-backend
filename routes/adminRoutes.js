import express from "express";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import adminController from "../controllers/adminController.js";

const router = express.Router();

router.post(
  "/upload",
  auth,
  isAdmin,
  upload.single("file"),
  adminController.uploadFile,
);
router.get("/report", auth, isAdmin, adminController.generateReport);

export default router;
