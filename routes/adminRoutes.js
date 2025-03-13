import express from "express";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadFile, generateReport } from "../controllers/adminController.js";

const router = express.Router();

router.post(
  "/upload",
  auth,
  isAdmin,
  upload.single("file"),
  uploadFile
);

router.get("/report", auth, isAdmin, generateReport);

export default router;