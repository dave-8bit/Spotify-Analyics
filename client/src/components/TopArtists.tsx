import type { Artist } from '../types';

interface Props {
  artists: Artist[];
}

export default function TopArtists({ artists }: Props) {
  if (!artists.length) {
    return (
      <div className="card">
        <h2>Top Artists</h2>
        <p className="empty">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Top Artists</h2>
      <ul className="artist-list">
        {artists.map((artist) => (
          <li key={artist.artistId} className="artist-item">
            <span className="rank">#{artist.rank}</span>
            {artist.imageUrl && (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="artist-img"
              />
            )}
            <div className="artist-info">
              <a href={artist.spotifyUrl} target="_blank" rel="noreferrer" className="artist-name">
                {artist.name}
              </a>
              <span className="artist-genres">{artist.genres.join(', ')}</span>
              <span className="artist-followers">
                {artist.followers.toLocaleString()} followers
              </span>
            </div>
            <span className="popularity-badge">{artist.popularity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
