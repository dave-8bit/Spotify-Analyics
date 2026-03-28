import app from "./app";
import { connectDB, closeDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

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