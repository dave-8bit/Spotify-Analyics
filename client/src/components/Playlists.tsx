import { useState } from 'react';
import type { Playlist, PlaylistDetail } from '../types';
import { getPlaylistDetail } from '../api';

interface Props {
  playlists: Playlist[];
}

export default function Playlists({ playlists }: Props) {
  const [selected, setSelected] = useState<PlaylistDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = async (playlistId: string) => {
    if (selected?.playlistId === playlistId) {
      setSelected(null);
      return;
    }
    setLoadingId(playlistId);
    try {
      const detail = await getPlaylistDetail(playlistId);
      setSelected(detail);
    } catch {
      // handle silently
    } finally {
      setLoadingId(null);
    }
  };

  if (!playlists.length) {
    return (
      <div className="card">
        <h2>Your Playlists</h2>
        <p className="empty">No playlists found.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your Playlists</h2>
      <ul className="playlist-list">
        {playlists.map((pl) => (
          <li key={pl.playlistId} className="playlist-item">
            <button
              className="playlist-btn"
              onClick={() => handleSelect(pl.playlistId)}
            >
              {pl.imageUrl && (
                <img src={pl.imageUrl} alt={pl.name} className="playlist-img" />
              )}
              <div className="playlist-info">
                <span className="playlist-name">{pl.name}</span>
                <span className="playlist-meta">{pl.trackCount} tracks</span>
              </div>
              <span className="chevron">
                {selected?.playlistId === pl.playlistId ? '▲' : '▼'}
              </span>
            </button>

            {loadingId === pl.playlistId && (
              <p className="loading-inline">Loading tracks...</p>
            )}

            {selected?.playlistId === pl.playlistId && (
              <ul className="playlist-tracks">
                {selected.tracks.map((track) => (
                  <li key={track.trackId} className="playlist-track-item">
                    {track.albumImageUrl && (
                      <img
                        src={track.albumImageUrl}
                        alt={track.albumName ?? ''}
                        className="album-art-sm"
                      />
                    )}
                    <div className="track-info">
                      <span className="track-name">{track.name}</span>
                      <span className="track-artist">{track.artist}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
