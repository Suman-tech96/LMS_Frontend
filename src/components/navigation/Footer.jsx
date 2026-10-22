import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import logoImg from '../../assets/LMS_logo.jpeg';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#f5f1ea',
        borderTop: '1px solid #e4dfd4',
        marginTop: 'auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) 0 2rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1: Brand & Institutional Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-primary)',
              }}
            >
              <img
                src={logoImg}
                alt="Sarat Education Logo"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              />
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'var(--text-primary)',
                    display: 'block',
                    lineHeight: '1.2',
                  }}
                >
                  Sarat <span style={{ color: 'var(--primary)' }}>Education</span>
                </span>
                <span
                  style={{
                    fontSize: '0.675rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--accent)',
                    fontWeight: 700,
                  }}
                >
                  Academic Learning & Examination Portal
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.75' }}>
              Centralized academic platform providing accredited degree curricula, verified digital courseware, scheduled proctored examinations, and authenticated academic performance records.
            </p>

                      </div>

          {/* Col 2: Academic Programs */}
       

          {/* Col 3: Student Portals & Support */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-primary)',
                fontSize: '1.05rem',
                marginBottom: '1.25rem',
              }}
            >
              Student Portal Access
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link to="/login/student" className="footer-link">
                  <ChevronRight size={14} color="var(--primary)" />
                  <span>Student Portal Login</span>
                </Link>
              </li>
              <li>
                <Link to="/register/student" className="footer-link">
                  <ChevronRight size={14} color="var(--primary)" />
                  <span>New Student Registration</span>
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="footer-link">
                  <ChevronRight size={14} color="var(--primary)" />
                  <span>Student Password Recovery</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  <ChevronRight size={14} color="var(--primary)" />
                  <span>Academic Helpdesk & Grievance Cell</span>
                </Link>
              </li>
              <li>
                <Link to="/login/admin" className="footer-link" style={{ color: 'var(--text-muted)' }}>
                  <ChevronRight size={14} color="var(--text-muted)" />
                  <span>Faculty & Administrative Gateway</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contact & Examination Control Room */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-primary)',
                fontSize: '1.05rem',
                marginBottom: '1.25rem',
              }}
            >
              Campus & Examination Desk
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <PhoneCall size={16} color="var(--primary)" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Student Helpline</div>
                  <a href="tel:9861223439" style={{ color: 'var(--text-secondary)' }} className="footer-link">
                    +91 98612 23439
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Mail size={16} color="var(--primary)" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Academic Inquiries</div>
                  <a href="mailto:info@sarateducation.com" style={{ color: 'var(--text-secondary)' }} className="footer-link">
                    info@sarateducation.com
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Clock size={16} color="var(--primary)" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Helpdesk Hours</div>
                  <div>Mon – Sat: 09:00 AM – 06:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Regulatory Bar */}
        <div
          style={{
            paddingTop: '1.75rem',
            borderTop: '1px solid #e4dfd4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} Sarat Education. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/about" className="footer-link" style={{ fontSize: '0.825rem' }}>
              Academic Charter
            </Link>
            <Link to="/why-us" className="footer-link" style={{ fontSize: '0.825rem' }}>
              Examination Regulations
            </Link>
            <Link to="/contact" className="footer-link" style={{ fontSize: '0.825rem' }}>
              Helpdesk Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
