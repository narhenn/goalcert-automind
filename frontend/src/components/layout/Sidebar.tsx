import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Blocks, Bot, Plug, BarChart3, Settings } from 'lucide-react';
import GoalCertLogo from './GoalCertLogo';
import { useAuthStore } from '../../stores/authStore';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/templates', label: 'Templates', icon: Blocks },
];

const agentNav = [
  { to: '/integrations', label: 'Integrations', icon: Plug },
];

const insightNav = [
  { to: '#', label: 'Analytics', icon: BarChart3 },
  { to: '#', label: 'Settings', icon: Settings },
];

function NavSection({ label, items }: { label: string; items: typeof mainNav }) {
  return (
    <div className="mb-5">
      <p style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        color: 'var(--gc-muted)',
        padding: '0 14px',
        marginBottom: 8,
      }}>
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' sidebar-link-active' : '')}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all .15s ease',
                color: isActive ? '#ffffff' : 'var(--gc-text2)',
                background: isActive ? 'var(--gc-primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(73,2,162,.35)' : 'none',
              })}
            >
              <Icon style={{ width: 18, height: 18 }} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 250,
      height: '100vh',
      background: 'var(--gc-surface)',
      borderRight: '1px solid var(--gc-border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 60,
      overflow: 'hidden',
    }}>
      {/* Logo area */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--gc-border)' }}>
        <div className="flex items-center gap-2.5">
          <GoalCertLogo size={34} />
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--gc-primary)', lineHeight: 1.1 }}>
              GoalCert
            </p>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--gc-muted)', marginTop: 1 }}>
              AutoMind
            </p>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '18px 12px' }}>
        <NavSection label="Main" items={mainNav} />
        <NavSection label="Agents" items={agentNav} />
        <NavSection label="Insights" items={insightNav} />
      </nav>

      {/* Bottom card */}
      <div style={{ padding: '0 12px 18px' }}>
        <div style={{
          background: 'var(--gc-grad)',
          borderRadius: 12,
          padding: '14px 16px',
          color: '#ffffff',
        }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="pulse-dot" style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#4ade80',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Engine Online</span>
          </div>
          <p style={{ fontSize: 10.5, opacity: 0.75 }}>All systems operational</p>
        </div>

        {/* User / Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--gc-border)',
            background: 'var(--gc-soft)',
            color: 'var(--gc-text2)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {user?.name || user?.email || 'Sign out'}
          <span style={{ float: 'right', opacity: 0.5 }}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
