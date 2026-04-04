import { Router, Request, Response, NextFunction } from "express";
import {
  getTop5MostPlayed,
  getTop5Tracks,
  getTop5Artists,
  getRecentlyPlayed,
  syncAndGetPlaylists,
  getPlaylistWithTracks,
} from "../services/analyticsService";

// ---------------------------------------------------------------------------
// Session helper
// ---------------------------------------------------------------------------

type AppSession = {
  userId?: string;
};

function getSession(req: Request): AppSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req as any).session as AppSession;
}

const router = Router();

// Auth guard
router.use((req: Request, res: Response, next: NextFunction) => {
  if (!getSession(req).userId) {
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
    const data = await getTop5Tracks(getSession(req).userId!, timeRange);
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
    const data = await getTop5Artists(getSession(req).userId!, timeRange);
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
    const data = await getTop5MostPlayed(getSession(req).userId!);
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
    const data = await getRecentlyPlayed(getSession(req).userId!);
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
    const data = await syncAndGetPlaylists(getSession(req).userId!);
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
    const playlistId = String(req.params.playlistId);
    const data = await getPlaylistWithTracks(
      getSession(req).userId!,
      playlistId
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