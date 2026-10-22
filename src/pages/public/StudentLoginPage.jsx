import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { LogIn, KeyRound, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/LMS_logo.jpeg';

export const StudentLoginPage = () => {
  const { loginStudent, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') navigate('/teacher/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please provide your student email address or Student ID.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginStudent(identifier.trim(), password);
      const destination = location.state?.from?.pathname || '/student/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your Student ID and password.');
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

            <h2 style={{ fontSize: '1.65rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Student Portal Sign In
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Access your enrolled courses, lecture notes, and proctored examinations
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
              <label className="form-label" htmlFor="student-identifier">
                Student ID or Registered Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="student-identifier"
                  type="text"
                  className="form-input"
                  placeholder="e.g. STU2026XXXX or student@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <span className="form-hint">
                Enter the Student ID issued during admission or your registered academic email.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" htmlFor="student-password" style={{ margin: 0 }}>
                  Account Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="student-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your confidential password"
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
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Authenticating with Portal...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In to Student Space</span>
                </>
              )}
            </button>
          </form>

          {/* Genuine Security Badge */}
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
            <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>Encrypted institutional login session with proctor security validation.</span>
          </div>

          {/* Footer Navigation Links */}
          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div>
              New student to Sarat Education?{' '}
              <Link to="/register/student" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Register here
              </Link>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.825rem' }}>
              Faculty, Staff, or Administrator?{' '}
              <Link to="/login/admin" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Institutional Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
