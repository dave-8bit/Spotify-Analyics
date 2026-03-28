import { Router, Request, Response } from "express";
import querystring from "querystring";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;

// Step 1: Redirect user to Spotify login
router.get("/spotify", (_req: Request, res: Response) => {
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played"
  ].join(" ");

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// Step 2: Spotify callback to get tokens
router.get("/spotify/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("No code provided");

  const body = querystring.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      body,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // For now, just return the tokens as JSON
    res.json({ access_token, refresh_token, expires_in });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Spotify token exchange failed");
  }
});

export default router;