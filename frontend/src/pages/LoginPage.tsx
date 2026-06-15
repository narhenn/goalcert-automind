import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../api/client';
import GoalCertLogo from '../components/layout/GoalCertLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gc-bg)' }}>
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center" style={{ marginBottom: 32 }}>
          <div className="inline-flex items-center gap-2 mb-3">
            <GoalCertLogo size={42} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gc-primary)' }}>
            GoalCert AutoMind
          </h1>
          <p style={{ fontSize: 13, color: 'var(--gc-muted)', marginTop: 4 }}>Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--gc-surface)',
          border: '1px solid var(--gc-border)',
          borderRadius: 'var(--radius)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div style={{
                background: 'rgba(225,29,72,.08)',
                color: 'var(--gc-red)',
                fontSize: 13,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(225,29,72,.2)',
              }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 6 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  border: '1px solid var(--gc-border2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--gc-text)',
                  outline: 'none',
                  background: 'var(--gc-surface)',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4902A2')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--gc-border2)')}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gc-text2)', marginBottom: 6 }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  border: '1px solid var(--gc-border2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--gc-text)',
                  outline: 'none',
                  background: 'var(--gc-surface)',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4902A2')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--gc-border2)')}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 11,
                border: 'none',
                background: 'var(--gc-primary)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#5a16b8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#4902A2'; }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo autofill */}
        <button
          type="button"
          onClick={() => {
            setEmail('demo@goalcert.com');
            setPassword('demo123');
          }}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 14,
            padding: '9px 16px',
            borderRadius: 11,
            border: '1px dashed var(--gc-border2)',
            background: 'var(--gc-soft)',
            color: 'var(--gc-primary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'background .15s, border-color .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(73,2,162,.06)';
            e.currentTarget.style.borderColor = 'var(--gc-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--gc-soft)';
            e.currentTarget.style.borderColor = 'var(--gc-border2)';
          }}
        >
          Fill Demo Credentials
        </button>

        <p className="text-center" style={{ fontSize: 13, color: 'var(--gc-muted)', marginTop: 14 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--gc-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
