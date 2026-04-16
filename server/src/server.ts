import app from "./app";
import { connectDB, closeDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

validateRequiredEnv([
  "MONGO_URI",
  "SESSION_SECRET",
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SPOTIFY_REDIRECT_URI",
]);

const PORT = process.env.PORT || 5000;

function validateRequiredEnv(requiredVars: string[]) {
  const missing = requiredVars.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

process.on("SIGTERM", async () => {
  await closeDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});