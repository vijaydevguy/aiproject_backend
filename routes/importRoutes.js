import express from "express";
import upload from "../middleware/upload.js";
import { uploadExcel, getImports } from "../controllers/importController.js";

const router = express.Router();

router.get("/", getImports);

router.post("/", upload.single("file"), uploadExcel);

export default router;
