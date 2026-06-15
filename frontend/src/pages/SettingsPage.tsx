import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Key, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, color: 'var(--gc-text)', letterSpacing: '-.3px' }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginTop: 4 }}>
          Manage your account and preferences
        </p>
      </div>

      {saved && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 100,
          background: 'var(--gc-green)', color: '#fff',
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
        }}>
          Settings saved
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile */}
        <div style={{
          background: 'var(--gc-card)', border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)', padding: 24,
        }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 20 }}>
            <User style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 4 }}>Name</label>
              <input
                defaultValue={user?.name || ''}
                style={{
                  width: '100%', border: '1px solid var(--gc-border2)', borderRadius: 10,
                  padding: '10px 13px', fontSize: 13, color: 'var(--gc-text)', background: '#fff', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 4 }}>Email</label>
              <input
                defaultValue={user?.email || ''}
                disabled
                style={{
                  width: '100%', border: '1px solid var(--gc-border2)', borderRadius: 10,
                  padding: '10px 13px', fontSize: 13, color: 'var(--gc-muted)', background: 'var(--gc-soft)', outline: 'none',
                }}
              />
            </div>
            <button onClick={handleSave} style={{
              background: 'var(--gc-primary)', color: '#fff', padding: '9px 18px',
              borderRadius: 11, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              Save Changes
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div style={{
          background: 'var(--gc-card)', border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)', padding: 24,
        }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 20 }}>
            <Key style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            API Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 4 }}>OpenAI API Key</label>
              <input
                type="password"
                defaultValue="sk-proj-****"
                style={{
                  width: '100%', border: '1px solid var(--gc-border2)', borderRadius: 10,
                  padding: '10px 13px', fontSize: 13, color: 'var(--gc-text)', background: '#fff', outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 4 }}>Resend API Key</label>
              <input
                type="password"
                placeholder="re_..."
                style={{
                  width: '100%', border: '1px solid var(--gc-border2)', borderRadius: 10,
                  padding: '10px 13px', fontSize: 13, color: 'var(--gc-text)', background: '#fff', outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
            <button onClick={handleSave} style={{
              background: 'var(--gc-primary)', color: '#fff', padding: '9px 18px',
              borderRadius: 11, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              Update Keys
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div style={{
          background: 'var(--gc-card)', border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)', padding: 24,
        }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 20 }}>
            <Bell style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            Notifications
          </h3>
          <div className="space-y-3">
            {['Execution completed', 'Execution failed', 'Agent errors', 'Weekly report'].map((item) => (
              <label key={item} className="flex items-center justify-between" style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: 'var(--gc-text2)' }}>{item}</span>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gc-primary)', width: 16, height: 16 }} />
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div style={{
          background: 'var(--gc-card)', border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)', padding: 24,
        }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: 'var(--gc-text)', marginBottom: 20 }}>
            <Shield style={{ width: 16, height: 16, color: 'var(--gc-primary)' }} />
            Security
          </h3>
          <div className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 4 }}>Change Password</label>
              <input
                type="password"
                placeholder="New password"
                style={{
                  width: '100%', border: '1px solid var(--gc-border2)', borderRadius: 10,
                  padding: '10px 13px', fontSize: 13, color: 'var(--gc-text)', background: '#fff', outline: 'none',
                }}
              />
            </div>
            <button onClick={handleSave} style={{
              background: 'var(--gc-primary)', color: '#fff', padding: '9px 18px',
              borderRadius: 11, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
