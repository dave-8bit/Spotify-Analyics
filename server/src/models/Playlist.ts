import { Db, ObjectId } from "mongodb";

export interface IPlaylist {
  _id?: ObjectId;
  userId: string;
  playlistId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  trackCount: number;
  isPublic: boolean;
  spotifyUrl: string;
  tracks: IPlaylistTrack[];
  snapshotId: string;
  syncedAt: Date;
}

export interface IPlaylistTrack {
  trackId: string;
  name: string;
  artist: string;
  artistId: string | null;
  albumName: string | null;
  albumImageUrl: string | null;
  durationMs: number | null;
  addedAt: Date;
}

// db.playlists.createIndex({ userId: 1 })
// db.playlists.createIndex({ userId: 1, playlistId: 1 }, { unique: true })
export const getPlaylistsCollection = (db: Db) =>
  db.collection<IPlaylist>("playlists");