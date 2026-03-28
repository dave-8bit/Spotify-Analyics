import { Db, ObjectId } from "mongodb";

export interface ITrack {
  _id?: ObjectId;
  userId: string;
  trackId: string;
  name: string;
  artist: string;
  playedAt: Date;
}

export const getTracksCollection = (db: Db) => db.collection<ITrack>("tracks");