import { Db, ObjectId } from "mongodb";

export interface ITrack {
  _id?: ObjectId;
  userId: string;
  trackId: string;
  name: string;
  artist: string;
  artistId: string | null;
  albumName: string | null;
  albumImageUrl: string | null;
  durationMs: number | null;
  popularity: number | null;
  playedAt: Date;
}

// Run these in MongoDB before you have real data:
// db.tracks.createIndex({ userId: 1, playedAt: -1 })
// db.tracks.createIndex({ userId: 1, trackId: 1, playedAt: -1 }, { unique: true })
export const getTracksCollection = (db: Db) => db.collection<ITrack>("tracks");