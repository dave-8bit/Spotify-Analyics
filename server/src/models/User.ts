import { Db, ObjectId } from "mongodb";

export interface ITrack {
  id: string;
  name: string;
  playCount: number; // optional, Spotify popularity or play count
}

export interface IArtist {
  id: string;
  name: string;
  playCount: number; // optional
}

export interface IUser {
  _id?: ObjectId;
  spotifyId: string;
  displayName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  topTracks?: ITrack[];
  topArtists?: IArtist[];
  createdAt: Date;
  updatedAt: Date;
}

// Collection helper
export const getUsersCollection = (db: Db) => db.collection<IUser>("users");