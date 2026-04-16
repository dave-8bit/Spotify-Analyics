import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import TopTracks from '../components/TopTracks';
import TopArtists from '../components/TopArtists';
import Playlists from '../components/Playlists';
import TimeRangeSelector from '../components/TimeRangeSelector';
import type { TimeRange } from '../types';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const {
    topTracks,
    topArtists,
    mostPlayed,
    playlists,
    loading,
    error,
    refetch,
  } = useAnalytics(timeRange);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/api/auth/spotify';
    }
  }, [authLoading, user]);

  if (!authLoading && !user) return null;

  if (authLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo">Spotify Analytics</span>
        </div>
        <div className="header-right">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt={user.displayName} className="avatar" />
          )}
          <span className="username">{user?.displayName}</span>
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="dashboard-controls">
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        <button className="refresh-btn" onClick={refetch} disabled={loading}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={refetch}>Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="loading-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      )}

      {/* Dashboard grid */}
      {!loading && !error && (
        <div className="dashboard-grid">
          <TopTracks tracks={topTracks} title="Top 5 Tracks" />
          <TopArtists artists={topArtists} />
          <TopTracks tracks={mostPlayed} title="Most Played" />
          <Playlists playlists={playlists} />
        </div>
      )}
    </div>
  );
}
