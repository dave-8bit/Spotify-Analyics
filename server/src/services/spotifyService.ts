import axios from "axios";

export const getSpotifyTopTracks = async (accessToken: string) => {
  const response = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.items.map((t: any) => ({
    id: t.id,
    name: t.name,
    playCount: t.popularity,
  }));
};

export const getSpotifyTopArtists = async (accessToken: string) => {
  const response = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=10", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.items.map((a: any) => ({
    id: a.id,
    name: a.name,
    playCount: a.popularity,
  }));
};