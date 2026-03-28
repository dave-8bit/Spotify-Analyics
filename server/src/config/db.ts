import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db("spotify-analytics");
  console.log("MongoDB connected");
  return db;
};