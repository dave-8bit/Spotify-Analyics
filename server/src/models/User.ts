import { Db, ObjectId } from "mongodb";

export interface IUser {
  _id?: ObjectId;
  spotifyId: string;
  displayName: string;
  email: string;
  imageUrl: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const getUsersCollection = (db: Db) => db.collection<IUser>("users");