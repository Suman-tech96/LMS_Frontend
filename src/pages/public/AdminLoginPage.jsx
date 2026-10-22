import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Shield, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';
import logoImg from '../../assets/LMS_logo.jpeg';

export const AdminLoginPage = () => {
  const { loginAdmin, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Official administrator email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      await loginAdmin(email.trim(), password);
      navigate('/teacher/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify administrative credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '78vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.25rem',
      }}
    >
      <div style={{ maxWidth: '460px', width: '100%' }}>
        <div className="card auth-card" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <img
                src={logoImg}
                alt="Sarat Education"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  color: 'var(--text-primary)',
                }}
              >
                Sarat <span style={{ color: 'var(--primary)' }}>Education</span>
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#fdf3e7',
                color: 'var(--accent)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Lock size={12} />
              <span>Administrative Gateway</span>
            </div>

            <h2 style={{ fontSize: '1.65rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Faculty & Staff Sign In
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Curriculum governance, proctored examinations, and academic management
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="admin-email">
                Official Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                className="form-input"
                placeholder="e.g. admin@sarateducation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <span className="form-hint">
                Authorized institutional email provided by academic administration.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" htmlFor="admin-password" style={{ margin: 0 }}>
                  Account Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter administrative password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--accent)',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Validating Administrative Token...</span>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Authenticate Institutional Access</span>
                </>
              )}
            </button>
          </form>

          {/* Institutional Notice */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f5f1ea',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.775rem',
              color: 'var(--text-secondary)',
            }}
          >
            <ShieldCheck size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span>Restricted academic terminal. Unauthorized entry attempts are logged.</span>
          </div>

          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
            Are you a student enrolled at Sarat Education?{' '}
            <Link to="/login/student" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Return to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
