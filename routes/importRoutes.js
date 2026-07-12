import express from "express";
import upload from "../middleware/upload.js";
import { uploadExcel } from "../controllers/importController.js";

const router = express.Router();

router.post("/", upload.single("file"), uploadExcel);

export default router;