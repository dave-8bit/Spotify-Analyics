import { useState, useCallback, useEffect } from 'react';
import type { TimeRange } from '../types';
import {
  getTopTracks,
  getTopArtists,
  getMostPlayed,
  getRecentlyPlayed,
  getPlaylists,
} from '../api';
import type { Track, Artist, Playlist, RecentTrack } from '../types';

interface AnalyticsState {
  topTracks: Track[];
  topArtists: Artist[];
  mostPlayed: Track[];
  recentlyPlayed: RecentTrack[];
  playlists: Playlist[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  topTracks: [],
  topArtists: [],
  mostPlayed: [],
  recentlyPlayed: [],
  playlists: [],
  loading: false,
  error: null,
};

export function useAnalytics(timeRange: TimeRange) {
  const [state, setState] = useState<AnalyticsState>(initialState);

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
  // All that i am trying to fetch for now possible updates can come later.
    try {
      const [topTracks, topArtists, mostPlayed, recentlyPlayed, playlists] =
        await Promise.all([
          getTopTracks(timeRange),
          getTopArtists(timeRange),
          getMostPlayed(),
          getRecentlyPlayed(),
          getPlaylists(),
        ]);

      setState({
        topTracks,
        topArtists,
        mostPlayed,
        recentlyPlayed,
        playlists,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load data. Please try again later.',
      }));
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}