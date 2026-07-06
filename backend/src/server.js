import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Basic middleware (functionality only, no security hardening yet)
app.use(cors());
app.use(express.json());

// Test route to confirm server is alive
app.get("/", (req, res) => {
  res.send("LinkIn API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/user", publicRoutes);
app.use("/api/admin", adminRoutes); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});