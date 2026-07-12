import mongoose from "mongoose";

const importSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    totalRows: {
      type: Number,
      default: 0,
    },

    importedRows: {
      type: Number,
      default: 0,
    },

    skippedRows: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "PROCESSING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Import", importSchema);