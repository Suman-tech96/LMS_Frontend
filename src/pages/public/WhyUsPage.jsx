import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Shield,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const WhyUsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2.5rem, 5vw, 4rem)', padding: 'clamp(2rem, 4vw, 3rem) 0 clamp(3rem, 6vw, 5rem) 0' }}>
      {/* Header */}
      <section className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
        <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
          Platform Capabilities
        </span>
        <h1 style={{ marginBottom: '1.25rem', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          Why Choose Sarat Education?
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: '1.7' }}>
          Explore our verified academic capabilities engineered specifically for disciplined curriculum management and transparent online assessments.
        </p>
      </section>

      {/* Verified Feature Details */}
      <section className="container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Feature 1 */}
          <div className="card card-hover feature-row-card">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'var(--primary-container)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={32} />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>Centralized Study Materials Distribution</h3>
              <p style={{ lineHeight: '1.7', marginBottom: '1rem' }}>
                All course notes, reference PDFs, and technical syllabi are uploaded to Cloudinary storage and mapped to verified course codes (e.g. Master of Computer Applications). Students are granted authenticated access exclusively to the materials designated for their program and batch.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>• Direct authenticated preview & download</span>
                <span>• Categorized by subject & module</span>
                <span>• Protected against unverified public access</span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card card-hover feature-row-card">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#f8e0a8',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={32} />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>Server-Authoritative Examination Engine</h3>
              <p style={{ lineHeight: '1.7', marginBottom: '1rem' }}>
                Examinations are controlled strictly by scheduled start dates, end dates, and duration limits enforced by the backend API. The examination client includes real-time answer saving, question palette tracking, and automated timeout submission.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>• Server-calculated time remaining</span>
                <span>• Per-question answer saving (POST /save-answer)</span>
                <span>• Configurable negative marking & attempt limits</span>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card card-hover feature-row-card">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'var(--primary-container)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Award size={32} />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>Authentic Published Results & Breakdown</h3>
              <p style={{ lineHeight: '1.7', marginBottom: '1rem' }}>
                Results are evaluated automatically upon submission and stored securely in the MongoDB database. Students can only review their scores after the examination department formally issues publication, maintaining strict academic confidentiality.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>• Exact positive marks & penalty deductions</span>
                <span>• Pass / Fail determination based on passing criteria</span>
                <span>• Transparent publishing workflow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Matrix: Supported vs Unsupported */}
      <section className="container">
        <div className="card" style={{ padding: 'clamp(1.25rem, 3.5vw, 2.5rem)' }}>
          <h3 style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            System Transparency & Feature Scope
          </h3>
          <p style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
            To adhere to the highest standard of software integrity, we present only the features validated against our current backend API gateway.
          </p>

          <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
              }}
            >
              <h4 style={{ color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} />
                <span>Operational Features (Supported by Backend v1)</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Student registration with auto-generated registration ID</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Student login via email or registration identifier</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Password recovery via 6-digit SHA-256 OTP verification</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Authenticated course and study material browsing</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Timed examination interface with real-time answer saving</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Administrator examination scheduling and question bank management</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>Result evaluation and administrative publish/unpublish workflow</span>
                </li>
              </ul>
            </div>

            <div
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
              }}
            >
              <h4 style={{ color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={18} />
                <span>Deferred / Non-Provisioned Features</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--danger)' }}>✗</span>
                  <span>Standalone Teacher role (backend currently enforces Admin & Student)</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--danger)' }}>✗</span>
                  <span>Live streaming video classrooms or WebRTC sessions</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--danger)' }}>✗</span>
                  <span>AI chat tutors or synthetic question generation</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--danger)' }}>✗</span>
                  <span>Payment gateway / fee collection integrations</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--danger)' }}>✗</span>
                  <span>Automated physical attendance or biometric logging</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Experience our verified learning portal</h3>
        <p style={{ marginBottom: '1.75rem' }}>
          Register today or sign in with your student credentials to view your academic dashboard.
        </p>
        <Link to="/login/student" className="btn btn-primary">
          <span>Sign In to Student Portal</span>
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};
