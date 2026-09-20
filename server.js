import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import "./config/env.js";
import importRoutes from "./routes/importRoutes.js";
import cron from "node-cron";

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

// Light-weight API to keep the project and database alive
app.get("/api/keep-alive", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Ping the database
      await mongoose.connection.db.admin().ping();
      res.status(200).json({ message: "Project and DB kept alive successfully" });
    } else {
      res.status(500).json({ message: "Database not connected" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error keeping DB alive", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Schedule the cron job to run every 2 days at midnight (0 0 */2 * *)
cron.schedule("0 0 */2 * *", async () => {
  console.log("Running scheduled keep-alive cron job...");
  try {
    const response = await fetch(`
https://aiproject-backend-835b.onrender.com/api/keep-alive`);
    const data = await response.json();
    console.log("Keep-alive response:", data);
  } catch (error) {
    console.error("Keep-alive cron job failed:", error.message);
  }
});
