import { Router, Request, Response, NextFunction } from "express";
import {
  getTop5MostPlayed,
  getTop5Tracks,
  getTop5Artists,
  getRecentlyPlayed,
  syncAndGetPlaylists,
  getPlaylistWithTracks,
} from "../services/analyticsService";
import { SpotifyAPIError } from "../services/spotifyService";

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

function handleAnalyticsError(
  res: Response,
  err: unknown,
  defaultMessage: string,
  routeName: string
) {
  if (err instanceof Error) {
    console.error(`[analytics/${routeName}]`, err.stack ?? err.message);
  } else {
    console.error(`[analytics/${routeName}]`, err);
  }

  if (err instanceof SpotifyAPIError && err.status) {
    res.status(err.status).json({ error: defaultMessage });
    return;
  }

  res.status(500).json({ error: defaultMessage });
}

// ---------------------------------------------------------------------------
// GET /analytics/top-tracks
// ---------------------------------------------------------------------------
router.get("/top-tracks", async (req: Request, res: Response) => {
  try {
    const timeRange = validateTimeRange(req.query.time_range);
    const data = await getTop5Tracks(getSession(req).userId!, timeRange);
    res.json({ data });
  } catch (err) {
    handleAnalyticsError(res, err, "Failed to fetch top tracks", "top-tracks");
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
    handleAnalyticsError(res, err, "Failed to fetch top artists", "top-artists");
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
    handleAnalyticsError(res, err, "Failed to fetch most played tracks", "most-played");
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
    handleAnalyticsError(res, err, "Failed to fetch recently played", "recently-played");
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
    handleAnalyticsError(res, err, "Failed to fetch playlists", "playlists");
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
    handleAnalyticsError(res, err, "Failed to fetch playlist", "playlists/:id");
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