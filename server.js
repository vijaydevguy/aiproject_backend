import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import "./config/env.js";
import importRoutes from "./routes/importRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/import", importRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
