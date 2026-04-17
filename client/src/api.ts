import axios from 'axios';
import type { Track, Artist, Album, Playlist, PlaylistDetail, RecentTrack, TimeRange, User } from './types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // required for session cookie
});

// ---------------------------------------------------------------------------
// Auth, This shit has to be the hardest part of it all.
// ---------------------------------------------------------------------------

export const getMe = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  return res.data.user;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

  //Fetch Top Tracks
export const getTopTracks = async (timeRange: TimeRange = 'medium_term'): Promise<Track[]> => {
  const res = await api.get('/analytics/top-tracks', { params: { time_range: timeRange } });
  return res.data.data;
};

 //Fetch Top Artists
export const getTopArtists = async (timeRange: TimeRange = 'medium_term'): Promise<Artist[]> => {
  const res = await api.get('/analytics/top-artists', { params: { time_range: timeRange } });
  return res.data.data;
};

 //Fetch Most Played Tracks
export const getMostPlayed = async (): Promise<Track[]> => {
  const res = await api.get('/analytics/most-played');
  return res.data.data;
};

 // Fetch Recently Played Tracks
export const getRecentlyPlayed = async (): Promise<RecentTrack[]> => {
  const res = await api.get('/analytics/recently-played');
  return res.data.data;
};

 //Fetch Top Albums
export const getTopAlbums = async (timeRange: TimeRange = 'medium_term'): Promise<Album[]> => {
  const res = await api.get('/analytics/top-albums', { params: { time_range: timeRange } });
  return res.data.data;
};

 //Fetch Playlists
export const getPlaylists = async (): Promise<Playlist[]> => {
  const res = await api.get('/analytics/playlists');
  return res.data.data;
};

export const getPlaylistDetail = async (playlistId: string): Promise<PlaylistDetail> => {
  const res = await api.get(`/analytics/playlists/${playlistId}`);
  return res.data.data;
};