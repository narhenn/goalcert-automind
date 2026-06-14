import { Link } from 'react-router-dom';
import GoalCertLogo from './GoalCertLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--gc-bg)' }}>
      <GoalCertLogo size={48} />
      <h1 style={{ fontSize: 64, fontWeight: 800, color: 'var(--gc-text)', marginTop: 16 }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--gc-muted)', marginTop: 8 }}>Page Not Found</p>
      <Link
        to="/"
        style={{
          marginTop: 28,
          display: 'inline-block',
          padding: '11px 24px',
          background: 'var(--gc-primary)',
          color: '#ffffff',
          borderRadius: 11,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
