import type { Album } from '../types';

interface Props {
  albums: Album[];
}

export default function TopAlbums({ albums }: Props) {
  if (!albums.length) {
    return (
      <div className="card">
        <h2>Top Albums</h2>
        <p className="empty">No album streaming data available yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Top Albums</h2>
      <ul className="album-list">
        {albums.map((album) => (
          <li key={album.albumId} className="album-item">
            {album.imageUrl && (
              <img
                src={album.imageUrl}
                alt={album.name}
                className="album-art"
              />
            )}
            <div className="album-info">
              <a href={album.spotifyUrl} target="_blank" rel="noreferrer" className="album-name">
                {album.name}
              </a>
              <span className="album-artist">{album.artist}</span>
              <span className="album-meta">
                {album.releaseDate ?? 'Unknown release'} · {album.totalTracks} tracks
              </span>
            </div>
            <span className="popularity-badge">{album.popularity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
