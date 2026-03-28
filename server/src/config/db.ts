import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("MongoDB Atlas connected");
    return client.db("spotify-analytics"); // My DB instance
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};