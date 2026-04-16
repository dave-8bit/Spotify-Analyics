import { connectDB } from "../config/db";
import { getTracksCollection } from "../models/Track";
import { getPlaylistsCollection } from "../models/Playlist";
import {
  getValidAccessToken,
  SpotifyAPIError,
  fetchTopTracks,
  fetchTopArtists,
  fetchRecentlyPlayed,
  fetchUserPlaylists,
  fetchPlaylistTracks,
} from "./spotifyService";

async function withSpotifyRetry<T>(
  userId: string,
  fn: (accessToken: string) => Promise<T>
): Promise<T> {
  const accessToken = await getValidAccessToken(userId);
  try {
    return await fn(accessToken);
  } catch (err) {
    if (err instanceof SpotifyAPIError && err.status === 401) {
      const refreshedToken = await getValidAccessToken(userId, true);
      return await fn(refreshedToken);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Top 5 most played songs from listening history in DB
// ---------------------------------------------------------------------------

export async function getTop5MostPlayed(userId: string) {
  const db = await connectDB();
  const tracks = getTracksCollection(db);

  const results = await tracks
    .aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$trackId",
          name: { $first: "$name" },
          artist: { $first: "$artist" },
          albumName: { $first: "$albumName" },
          albumImageUrl: { $first: "$albumImageUrl" },
          playCount: { $sum: 1 },
          lastPlayed: { $max: "$playedAt" },
        },
      },
      { $sort: { playCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          trackId: "$_id",
          name: 1,
          artist: 1,
          albumName: 1,
          albumImageUrl: 1,
          playCount: 1,
          lastPlayed: 1,
        },
      },
    ])
    .toArray();

  return results;
}

// ---------------------------------------------------------------------------
// Top 5 tracks from Spotify API (what Spotify thinks your top tracks are)
// ---------------------------------------------------------------------------

export async function getTop5Tracks(
  userId: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
) {
  const tracks = await withSpotifyRetry(userId, (accessToken) =>
    fetchTopTracks(accessToken, timeRange, 5)
  );

  return tracks.map((track, index) => ({
    rank: index + 1,
    trackId: track.id,
    name: track.name,
    artist: track.artists[0]?.name ?? "Unknown",
    artistId: track.artists[0]?.id ?? null,
    albumName: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? null,
    popularity: track.popularity,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls.spotify,
  }));
}

// ---------------------------------------------------------------------------
// Top 5 artists from Spotify API
// ---------------------------------------------------------------------------

export async function getTop5Artists(
  userId: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
) {
  const artists = await withSpotifyRetry(userId, (accessToken) =>
    fetchTopArtists(accessToken, timeRange, 5)
  );

  return artists.map((artist, index) => ({
    rank: index + 1,
    artistId: artist.id,
    name: artist.name,
    genres: artist.genres.slice(0, 3),
    imageUrl: artist.images[0]?.url ?? null,
    popularity: artist.popularity,
    followers: artist.followers.total,
    spotifyUrl: artist.external_urls.spotify,
  }));
}

// ---------------------------------------------------------------------------
// Recently played — last 20 tracks
// ---------------------------------------------------------------------------

export async function getRecentlyPlayed(userId: string) {
  const items = await withSpotifyRetry(userId, (accessToken) =>
    fetchRecentlyPlayed(accessToken, 20)
  );

  return items.map((item) => ({
    trackId: item.track.id,
    name: item.track.name,
    artist: item.track.artists[0]?.name ?? "Unknown",
    albumName: item.track.album.name,
    albumImageUrl: item.track.album.images[0]?.url ?? null,
    playedAt: item.played_at,
  }));
}

// ---------------------------------------------------------------------------
// User playlists — synced and stored in DB
// ---------------------------------------------------------------------------

export async function syncAndGetPlaylists(userId: string) {
  const db = await connectDB();
  const playlists = getPlaylistsCollection(db);

  const spotifyPlaylists = await withSpotifyRetry(userId, (accessToken) =>
    fetchUserPlaylists(accessToken)
  );

  for (const pl of spotifyPlaylists) {
    const tracks = await withSpotifyRetry(userId, (accessToken) =>
      fetchPlaylistTracks(accessToken, pl.id)
    );

    const playlistTracks = tracks
      .filter((item) => item.track) // filter null tracks (deleted songs)
      .map((item) => ({
        trackId: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0]?.name ?? "Unknown",
        artistId: item.track.artists[0]?.id ?? null,
        albumName: item.track.album?.name ?? null,
        albumImageUrl: item.track.album?.images?.[0]?.url ?? null,
        durationMs: item.track.duration_ms ?? null,
        addedAt: new Date(item.added_at),
      }));

    await playlists.updateOne(
      { userId, playlistId: pl.id },
      {
        $set: {
          userId,
          playlistId: pl.id,
          name: pl.name,
          description: pl.description,
          imageUrl: pl.images?.[0]?.url ?? null,
          trackCount: pl.tracks.total,
          isPublic: pl.public ?? false,
          spotifyUrl: pl.external_urls.spotify,
          snapshotId: pl.snapshot_id,
          tracks: playlistTracks,
          syncedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  // Return playlists without the full track list for the summary view
  return playlists
    .find({ userId }, { projection: { tracks: 0 } })
    .sort({ syncedAt: -1 })
    .toArray();
}

// ---------------------------------------------------------------------------
// Get a single playlist with its tracks
// ---------------------------------------------------------------------------

export async function getPlaylistWithTracks(
  userId: string,
  playlistId: string
) {
  const db = await connectDB();
  const playlists = getPlaylistsCollection(db);

  const playlist = await playlists.findOne({ userId, playlistId });
  if (!playlist) {
    throw new Error(`Playlist ${playlistId} not found for user ${userId}`);
  }

  return playlist;
}