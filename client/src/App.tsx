import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

function Login() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0a0a0a',
      gap: '1.5rem',
    }}>
      <h1 style={{ color: '#1db954', fontSize: '2rem' }}>🎵 Spotify Analytics</h1>
      <p style={{ color: '#777', fontSize: '1rem' }}>
        Connect your Spotify account to see your stats.
      </p>
      <a
        href="/api/auth/spotify"
        style={{
          background: '#1db954',
          color: '#000',
          padding: '0.75rem 2rem',
          borderRadius: '24px',
          fontWeight: 700,
          fontSize: '1rem',
          textDecoration: 'none',
        }}
      >
        Login with Spotify
      </a>
    </div>
  );
}

function ErrorPage() {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason') ?? 'unknown';
  const detail = params.get('detail');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0a0a0a',
      gap: '1rem',
      padding: '1rem',
      textAlign: 'center',
    }}>
      <h1 style={{ color: '#ff6b6b' }}>Something went wrong</h1>
      <p style={{ color: '#777' }}>Reason: {reason}</p>
      {detail ? (
        <p style={{ color: '#aaa', maxWidth: '36rem', lineHeight: 1.6 }}>
          {detail}
        </p>
      ) : null}
      <a href="/" style={{ color: '#1db954' }}>Go back</a>
    </div>
  );
}

export default App;
