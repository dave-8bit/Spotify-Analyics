import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;
  client = new MongoClient(MONGO_URI, {
    tls: true,
    tlsAllowInvalidCertificates: false,
  });
  await client.connect();
  db = client.db("spotify-analytics");
  console.log("MongoDB connected");
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) await client.close();
};