import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please provide the valid 6-digit verification code.');
      return;
    }
    if (!password || password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim() || undefined,
        otp: otp.trim(),
        password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code. Please request a new OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.25rem',
        }}
      >
        <div className="card auth-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Password Reset Complete!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Your account credentials have been updated securely. You can now log in with your new password.
          </p>

          <Link to="/login/student" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <span>Sign In to Student Portal</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.25rem',
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(217, 119, 6, 0.12)',
                color: 'var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Lock size={26} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Set New Password</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Enter the 6-digit verification code and your new password
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Email Address (Optional)
              </label>
              <input
                id="reset-email"
                type="email"
                className="form-input"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-otp">
                6-Digit Verification Code (OTP) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reset-otp"
                type="text"
                maxLength={6}
                className="form-input"
                placeholder="e.g. 116665"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ letterSpacing: '0.25em', fontSize: '1.25rem', textAlign: 'center', fontFamily: 'monospace' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-password">
                New Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reset-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-password">
                Confirm New Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Validating OTP with Server...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Need a new code?{' '}
            <Link to="/forgot-password" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Request code again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
