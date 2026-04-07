import type { Track } from '../types';

interface Props {
  tracks: Track[];
  title: string;
}

export default function TopTracks({ tracks, title }: Props) {
  if (!tracks.length) {
    return (
      <div className="card">
        <h2>{title}</h2>
        <p className="empty">No data available yet. Keep listening!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{title}</h2>
      <ul className="track-list">
        {tracks.map((track, i) => (
          <li key={track.trackId} className="track-item">
            <span className="rank">#{track.rank ?? i + 1}</span>
            {track.albumImageUrl && (
              <img
                src={track.albumImageUrl}
                alt={track.albumName ?? track.name}
                className="album-art"
              />
            )}
            <div className="track-info">
              <span className="track-name">
                {track.spotifyUrl ? (
                  <a href={track.spotifyUrl} target="_blank" rel="noreferrer">
                    {track.name}
                  </a>
                ) : (
                  track.name
                )}
              </span>
              <span className="track-artist">{track.artist}</span>
              {track.playCount !== undefined && (
                <span className="play-count">{track.playCount} plays</span>
              )}
            </div>
            {track.popularity !== undefined && (
              <div className="popularity-bar">
                <div
                  className="popularity-fill"
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
