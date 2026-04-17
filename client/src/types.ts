export interface Track {
  rank?: number;
  trackId: string;
  name: string;
  artist: string;
  artistId?: string | null;
  albumName?: string | null;
  albumImageUrl?: string | null;
  popularity?: number;
  previewUrl?: string | null;
  spotifyUrl?: string;
  playCount?: number;
  lastPlayed?: string;
}

export interface Artist {
  rank: number;
  artistId: string;
  name: string;
  genres: string[];
  imageUrl: string | null;
  popularity: number;
  followers: number;
  spotifyUrl: string;
}

export interface Playlist {
  playlistId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  trackCount: number;
  isPublic: boolean;
  spotifyUrl: string;
  syncedAt: string;
}

export interface PlaylistTrack {
  trackId: string;
  name: string;
  artist: string;
  albumName: string | null;
  albumImageUrl: string | null;
  durationMs: number | null;
  addedAt: string;
}

export interface PlaylistDetail extends Playlist {
  tracks: PlaylistTrack[];
}

export interface Album {
  rank: number;
  albumId: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string | null;
  totalTracks: number;
  popularity: number;
  spotifyUrl: string;
}

export interface RecentTrack {
  trackId: string;
  name: string;
  artist: string;
  albumName: string;
  albumImageUrl: string | null;
  playedAt: string;
}

export type TimeRange = 'one_week' | 'short_term' | 'medium_term' | 'long_term';

export interface User {
  spotifyId: string;
  displayName: string;
  email: string;
  imageUrl: string | null;
}