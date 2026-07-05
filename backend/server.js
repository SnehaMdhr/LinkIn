import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Basic middleware (functionality only, no security hardening yet)
app.use(cors());
app.use(express.json());

// Test route to confirm server is alive
app.get("/", (req, res) => {
  res.send("LinkIn API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});