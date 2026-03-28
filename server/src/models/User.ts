import { Db, ObjectId } from "mongodb";

export interface IUser {
  _id?: ObjectId;
  spotifyId: string;
  displayName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getUsersCollection = (db: Db) => db.collection<IUser>("users");