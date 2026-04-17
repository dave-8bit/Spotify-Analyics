import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { TimeRange } from '../types';
import {
  getTopTracks,
  getTopArtists,
  getTopAlbums,
  getMostPlayed,
  getRecentlyPlayed,
  getPlaylists,
} from '../api';
import type { Track, Artist, Album, Playlist, RecentTrack } from '../types';

interface AnalyticsState {
  topTracks: Track[];
  topArtists: Artist[];
  topAlbums: Album[];
  mostPlayed: Track[];
  recentlyPlayed: RecentTrack[];
  playlists: Playlist[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  topTracks: [],
  topArtists: [],
  topAlbums: [],
  mostPlayed: [],
  recentlyPlayed: [],
  playlists: [],
  loading: false,
  error: null,
};

export function useAnalytics(timeRange: TimeRange, enabled = true) {
  const [state, setState] = useState<AnalyticsState>(initialState);

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
  // All that i am trying to fetch for now possible updates can come later.
    try {
      const [topTracks, topArtists, topAlbums, mostPlayed, recentlyPlayed, playlists] =
        await Promise.all([
          getTopTracks(timeRange),
          getTopArtists(timeRange),
          getTopAlbums(timeRange),
          getMostPlayed(),
          getRecentlyPlayed(),
          getPlaylists(),
        ]);

      setState({
        topTracks,
        topArtists,
        topAlbums,
        mostPlayed,
        recentlyPlayed,
        playlists,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to load data. Please try again later.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: String(message),
      }));
    }
  }, [timeRange]);

  useEffect(() => {
    if (!enabled) return;
    fetchAll();
  }, [fetchAll, enabled]);

  return { ...state, refetch: fetchAll };
}