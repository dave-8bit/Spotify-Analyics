import { Router, Request, Response } from "express";
import {
  getTop5MostPlayed,
  getTop5Tracks,
  getTop5Artists,
  getRecentlyPlayed,
  syncAndGetPlaylists,
  getPlaylistWithTracks,
} from "../services/analyticsService";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    oauthState?: string;
  }
}

const router = Router();

// Auth guard — applied to all analytics routes
router.use((req: Request, res: Response, next) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
});

// ---------------------------------------------------------------------------
// GET /analytics/top-tracks
// ---------------------------------------------------------------------------
router.get("/top-tracks", async (req: Request, res: Response) => {
  try {
    const timeRange = validateTimeRange(req.query.time_range);
    const data = await getTop5Tracks(req.session.userId!, timeRange);
    res.json({ data });
  } catch (err) {
    console.error("[analytics/top-tracks]", err);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

// ---------------------------------------------------------------------------
// GET /analytics/top-artists
// ---------------------------------------------------------------------------
router.get("/top-artists", async (req: Request, res: Response) => {
  try {
    const timeRange = validateTimeRange(req.query.time_range);
    const data = await getTop5Artists(req.session.userId!, timeRange);
    res.json({ data });
  } catch (err) {
    console.error("[analytics/top-artists]", err);
    res.status(500).json({ error: "Failed to fetch top artists" });
  }
});

// ---------------------------------------------------------------------------
// GET /analytics/most-played
// ---------------------------------------------------------------------------
router.get("/most-played", async (req: Request, res: Response) => {
  try {
    const data = await getTop5MostPlayed(req.session.userId!);
    res.json({ data });
  } catch (err) {
    console.error("[analytics/most-played]", err);
    res.status(500).json({ error: "Failed to fetch most played tracks" });
  }
});

// ---------------------------------------------------------------------------
// GET /analytics/recently-played
// ---------------------------------------------------------------------------
router.get("/recently-played", async (req: Request, res: Response) => {
  try {
    const data = await getRecentlyPlayed(req.session.userId!);
    res.json({ data });
  } catch (err) {
    console.error("[analytics/recently-played]", err);
    res.status(500).json({ error: "Failed to fetch recently played" });
  }
});

// ---------------------------------------------------------------------------
// GET /analytics/playlists
// ---------------------------------------------------------------------------
router.get("/playlists", async (req: Request, res: Response) => {
  try {
    const data = await syncAndGetPlaylists(req.session.userId!);
    res.json({ data });
  } catch (err) {
    console.error("[analytics/playlists]", err);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// ---------------------------------------------------------------------------
// GET /analytics/playlists/:playlistId
// ---------------------------------------------------------------------------
router.get("/playlists/:playlistId", async (req: Request, res: Response) => {
  try {
    const data = await getPlaylistWithTracks(
      req.session.userId!,
      req.params.playlistId
    );
    res.json({ data });
  } catch (err) {
    console.error("[analytics/playlists/:id]", err);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

export default router;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateTimeRange(
  value: unknown
): "short_term" | "medium_term" | "long_term" {
  const valid = ["short_term", "medium_term", "long_term"];
  return valid.includes(value as string)
    ? (value as "short_term" | "medium_term" | "long_term")
    : "medium_term";
}