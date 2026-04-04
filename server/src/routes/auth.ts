import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import querystring from "querystring";
import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { getUsersCollection, IUser } from "../models/User";
import { getTracksCollection } from "../models/Track";
import { fetchRecentlyPlayed } from "../services/spotifyService";

dotenv.config();

const router = Router();
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

// ---------------------------------------------------------------------------
// Session helper
// ---------------------------------------------------------------------------

type AppSession = {
  userId?: string;
  oauthState?: string;
  destroy: (cb: () => void) => void;
};

function getSession(req: Request): AppSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req as any).session as AppSession;
}

// --- GET /auth/spotify ---
router.get("/spotify", (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  getSession(req).oauthState = state;

  const scope = [
    "user-read-private",
    "user-read-email",
    "user-read-recently-played",
    "user-top-read",
  ].join(" ");

  res.redirect(
    `https://accounts.spotify.com/authorize?` +
      querystring.stringify({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope,
        state,
        show_dialog: "false",
      })
  );
});

// --- GET /auth/spotify/callback ---
router.get("/spotify/callback", async (req: Request, res: Response) => {
  const { code, state, error } = req.query;
  const session = getSession(req);

  if (error) {
    return res.redirect(`${FRONTEND_URL}/error?reason=spotify_denied`);
  }

  if (!state || state !== session.oauthState) {
    return res.redirect(`${FRONTEND_URL}/error?reason=invalid_state`);
  }
  delete session.oauthState;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No authorization code provided" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = profileResponse.data;

    const db = await connectDB();
    const users = getUsersCollection(db);
    const tracks = getTracksCollection(db);

    const newUser: Omit<IUser, "_id"> = {
      spotifyId: profile.id,
      displayName: profile.display_name,
      email: profile.email,
      imageUrl: profile.images?.[0]?.url ?? null,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await users.updateOne(
      { spotifyId: profile.id },
      {
        $set: {
          displayName: newUser.displayName,
          email: newUser.email,
          imageUrl: newUser.imageUrl,
          accessToken: newUser.accessToken,
          refreshToken: newUser.refreshToken,
          tokenExpiresAt: newUser.tokenExpiresAt,
          updatedAt: newUser.updatedAt,
        },
        $setOnInsert: {
          spotifyId: newUser.spotifyId,
          createdAt: newUser.createdAt,
        },
      },
      { upsert: true }
    );

    getSession(req).userId = profile.id;

    syncRecentTracks(profile.id, access_token, tracks).catch((err) =>
      console.error("[sync] Background track sync failed:", err)
    );

    return res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("[auth/callback] Error:", err);
    return res.redirect(`${FRONTEND_URL}/error?reason=auth_failed`);
  }
});

// --- GET /auth/me ---
router.get("/me", async (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const db = await connectDB();
    const users = getUsersCollection(db);
    const user = await users.findOne(
      { spotifyId: session.userId },
      { projection: { accessToken: 0, refreshToken: 0, tokenExpiresAt: 0 } }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("[auth/me] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- POST /auth/logout ---
router.post("/logout", (req: Request, res: Response) => {
  getSession(req).destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function syncRecentTracks(
  userId: string,
  accessToken: string,
  tracks: ReturnType<typeof getTracksCollection>
) {
  const recentTracks = await fetchRecentlyPlayed(accessToken, 50);

  const ops = recentTracks.map((item) => ({
    updateOne: {
      filter: {
        userId,
        trackId: item.track.id,
        playedAt: new Date(item.played_at),
      },
      update: {
        $set: {
          userId,
          trackId: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name ?? "Unknown",
          artistId: item.track.artists[0]?.id ?? null,
          albumName: item.track.album?.name ?? null,
          albumImageUrl: item.track.album?.images?.[0]?.url ?? null,
          durationMs: item.track.duration_ms ?? null,
          popularity: item.track.popularity ?? null,
          playedAt: new Date(item.played_at),
        },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await tracks.bulkWrite(ops, { ordered: false });
  }
}

export default router;