import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import logoImg from '../../assets/LMS_logo.jpeg';

export const TeacherLoginPage = () => {
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
      <div style={{ maxWidth: '520px', width: '100%' }}>
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
              Faculty & Staff Access
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Academic Operations, Course Curricula & Proctored Examination Desk
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#f5f1ea',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.75rem',
              fontSize: '0.875rem',
              lineHeight: '1.7',
            }}
          >
            <h4 style={{ marginBottom: '0.65rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              Faculty Portal Instructions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} color="var(--primary)" style={{ marginTop: '4px', flexShrink: 0 }} />
                <span>
                  Course syllabus authoring, question bank updates, and scheduled exam configurations are managed through the <strong>Institutional Administration Gateway</strong>.
                </span>
              </li>
              <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} color="var(--primary)" style={{ marginTop: '4px', flexShrink: 0 }} />
                <span>
                  Department instructors and academic staff should log in using their assigned administrative credentials.
                </span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link to="/login/admin" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <ShieldCheck size={18} />
              <span>Proceed to Faculty & Staff Sign In</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login/student"
              className="btn btn-secondary"
              style={{ width: '100%', backgroundColor: '#ffffff' }}
            >
              <span>Enrolled Student? Sign In Here</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
