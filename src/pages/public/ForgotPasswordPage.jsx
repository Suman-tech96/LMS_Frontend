import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessData(res.data || { email: email.trim() });
    } catch (err) {
      setError(err.message || 'Unable to request password recovery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
                background: 'rgba(27, 77, 62, 0.12)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <KeyRound size={26} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Forgot Password</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Enter your registered email to receive a 6-digit OTP verification code.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {successData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="alert alert-success">
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong>6-Digit Verification Code Sent!</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                    If an active account exists for <code>{successData.email}</code>, an OTP valid for {successData.expiryMinutes || 30} minutes has been generated.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(successData.email)}`)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                <span>Enter 6-Digit OTP & Reset Password</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  Registered Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="form-hint">
                  Supports both registered Student and Administrator email accounts.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.75rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Requesting OTP from Server...</span>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Remembered your credentials?{' '}
            <Link to="/login/student" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
