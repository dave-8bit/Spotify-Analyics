import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth";
import analyticsRoutes from "./routes/analytics";
import dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const session = require("express-session");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.resolve(__dirname, "../..", "client", "dist");
  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    if (
      req.path.startsWith("/auth") ||
      req.path.startsWith("/api/auth") ||
      req.path.startsWith("/analytics") ||
      req.path.startsWith("/api/analytics")
    ) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.get("/", (_req, res) => res.send("API is running"));

export default app;