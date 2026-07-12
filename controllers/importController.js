import Import from "../models/Import.js";
import Lead from "../models/Lead.js";
import { readExcel } from "../services/excelService.js";
import { processBatch } from "../services/geminiService.js";

export const uploadExcel = async (req, res) => {
  let importHistory;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const rows = readExcel(req.file.buffer);

    importHistory = await Import.create({
      fileName: req.file.originalname,
      totalRows: rows.length,
      status: "PROCESSING",
    });

    const processedRows = [];

    const BATCH_SIZE = 20;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      const result = await processBatch(batch);

      const documents = result.map((row) => ({
        importId: importHistory._id,
        ...row,
      }));

      await Lead.insertMany(documents);

      processedRows.push(...result);
    }

    // const processedRows = await processBatch(rows);

    // const documents = rows.map((row) => ({
    //   importId: importHistory._id,
    //   rawData: row,
    // }));

    // importHistory.importedRows = rows.length;
    importHistory.importedRows = processedRows.length;
    importHistory.skippedRows = rows.length - processedRows.length;
    importHistory.status = "COMPLETED";

    await importHistory.save();

    return res.status(201).json({
      success: true,
      importId: importHistory._id,
      totalRows: rows.length,
      message: "Excel imported successfully",
    });
  } catch (error) {
    if (importHistory) {
      importHistory.status = "FAILED";
      await importHistory.save();
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
