import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import CreateAgentModal from '../agents/CreateAgentModal';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/templates': 'Templates',
  '/integrations': 'Integrations',
};

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      fontWeight: 500,
      background: 'rgba(73,2,162,.08)',
      color: 'var(--gc-primary)',
      padding: '6px 12px',
      borderRadius: 8,
    }}>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pageTitle = pageTitles[location.pathname] || '';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="min-h-screen" style={{ background: 'var(--gc-bg)' }}>
      <Sidebar />
      <div style={{ marginLeft: 250 }}>
        {/* Topbar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,.82)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--gc-border)',
          padding: '0 28px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gc-text)' }}>
            {pageTitle}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--gc-primary)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: 11,
                fontSize: 12.5,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#5a16b8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#4902A2')}
            >
              <Plus style={{ width: 15, height: 15 }} />
              New Agent
            </button>
            <Clock />
            {/* User avatar */}
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--gc-grad)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }} onClick={() => navigate('/')}>
              {initials}
            </div>
          </div>
        </header>
        <main style={{ padding: '26px 28px' }}>
          {children}
        </main>
      </div>

      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
