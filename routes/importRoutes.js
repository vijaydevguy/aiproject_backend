import express from "express";
import upload from "../middleware/upload.js";
import { uploadExcel, getImports, getLeadsByImport } from "../controllers/importController.js";

const router = express.Router();

router.get("/", getImports);

router.get("/:id/leads", getLeadsByImport);

router.post("/", upload.single("file"), uploadExcel);

export default router;
