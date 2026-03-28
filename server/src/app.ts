import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth"; // ✅ must match path

const app = express();

app.use(cors());
app.use(express.json());

// Register auth routes
app.use("/auth", authRoutes); // To establish the base path for auth routes, e.g., /auth/spotify

// Test root route
app.get("/", (_req, res) => res.send("API is running"));

export default app;