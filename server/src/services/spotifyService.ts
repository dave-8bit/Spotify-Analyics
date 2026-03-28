import axios, { AxiosError } from "axios";
import { connectDB } from "../config/db";
import { getUsersCollection } from "../models/User";

const SPOTIFY_API = "https://api.spotify.com/v1";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

export async function getValidAccessToken(userId: string): Promise<string> {
  const db = await connectDB();
  const users = getUsersCollection(db);
  const user = await users.findOne({ spotifyId: userId });

  if (!user) throw new Error(`User ${userId} not found in DB`);

  const now = new Date();
  const expiresAt = new Date(user.tokenExpiresAt);
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() > bufferMs) {
    return user.accessToken;
  }

  console.log(`[spotify] Refreshing token for user ${userId}`);

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: user.refreshToken,
    }),
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token, refresh_token, expires_in } = response.data;
  const newExpiresAt = new Date(Date.now() + expires_in * 1000);

  await users.updateOne(
    { spotifyId: userId },
    {
      $set: {
        accessToken: access_token,
        ...(refresh_token ? { refreshToken: refresh_token } : {}),
        tokenExpiresAt: newExpiresAt,
        updatedAt: new Date(),
      },
    }
  );

  return access_token;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function fetchRecentlyPlayed(accessToken: string, limit = 20) {
  try {
    const res = await axios.get(`${SPOTIFY_API}/me/player/recently-played`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: Math.min(limit, 50) },
    });
    return res.data.items as SpotifyPlayHistoryItem[];
  } catch (err) {
    handleSpotifyError("fetchRecentlyPlayed", err);
    throw err;
  }
}

export async function fetchTopTracks(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 50
) {
  try {
    const res = await axios.get(`${SPOTIFY_API}/me/top/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { time_range: timeRange, limit: Math.min(limit, 50) },
    });
    return res.data.items as SpotifyTrack[];
  } catch (err) {
    handleSpotifyError("fetchTopTracks", err);
    throw err;
  }
}

export async function fetchTopArtists(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 50
) {
  try {
    const res = await axios.get(`${SPOTIFY_API}/me/top/artists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { time_range: timeRange, limit: Math.min(limit, 50) },
    });
    return res.data.items as SpotifyArtist[];
  } catch (err) {
    handleSpotifyError("fetchTopArtists", err);
    throw err;
  }
}

export async function fetchArtistGenres(artistIds: string[], accessToken: string) {
  if (artistIds.length === 0) return [];

  const results: SpotifyArtist[] = [];

  for (const chunk of chunkArray(artistIds, 50)) {
    try {
      const res = await axios.get(`${SPOTIFY_API}/artists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { ids: chunk.join(",") },
      });
      results.push(...(res.data.artists as SpotifyArtist[]));
    } catch (err) {
      handleSpotifyError("fetchArtistGenres", err);
      throw err;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

function handleSpotifyError(fn: string, err: unknown): never {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const message = err.response?.data?.error?.message ?? err.message;

    if (status === 401) {
      throw new Error(`[${fn}] Access token expired or invalid`);
    }
    if (status === 429) {
      const retryAfter = err.response?.headers?.["retry-after"] ?? "?";
      throw new Error(`[${fn}] Rate limited. Retry after ${retryAfter}s`);
    }
    throw new Error(`[${fn}] Spotify API error ${status}: ${message}`);
  }
  throw err;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string }>;
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface SpotifyPlayHistoryItem {
  track: SpotifyTrack;
  played_at: string;
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}