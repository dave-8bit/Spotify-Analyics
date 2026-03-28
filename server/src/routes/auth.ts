// server/src/routes/auth.ts
import { Router, Request, Response } from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { getUsersCollection, IUser } from "../models/User";

dotenv.config();
const router = Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;

router.get("/spotify/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("No code provided");

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user profile from Spotify
    const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const profile = profileResponse.data;

    // Store user in MongoDB
    const db = await connectDB();
    const users = getUsersCollection(db);

    const existingUser = await users.findOne({ spotifyId: profile.id });
    if (existingUser) {
      await users.updateOne(
        { spotifyId: profile.id },
        {
          $set: {
            displayName: profile.display_name,
            email: profile.email,
            accessToken: access_token,
            refreshToken: refresh_token,
            updatedAt: new Date()
          }
        }
      );
    } else {
      const newUser: IUser = {
        spotifyId: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        accessToken: access_token,
        refreshToken: refresh_token,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await users.insertOne(newUser);
    }

    // Redirect to frontend dashboard
    res.redirect("http://localhost:3000/dashboard"); // Adjust frontend URL
  } catch (err) {
    console.error(err);
    res.status(500).send("Spotify auth error");
  }
});

export default router;