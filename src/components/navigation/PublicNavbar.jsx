import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import logoImg from '../../assets/LMS_logo.jpeg';
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  User,
} from 'lucide-react';

export const PublicNavbar = () => {
  const { role, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/why-us', label: 'Why Choose Us' },
    { to: '/contact', label: 'Contact Us' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(250, 246, 240, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 8px rgba(46, 50, 48, 0.05)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
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
              boxShadow: '0 2px 6px rgba(46, 50, 48, 0.08)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', lineHeight: '1.2', color: 'var(--text-primary)' }}>
              Sarat <span style={{ color: 'var(--primary)' }}>Education</span>
            </span>
            <span className="brand-subtitle" style={{ fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700 }}>
              Learning & Examination Portal
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.85rem, 1.5vw, 1.75rem)',
            flexShrink: 0,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth & Helpline CTAs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.5rem, 1vw, 0.75rem)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
          className="desktop-auth"
        >
          {/* Helpline pill from Stitch */}
          <div
            className="helpline-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#f0ece4',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <PhoneCall size={13} />
            <span>98612 23439</span>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to={role === 'admin' ? '/teacher/dashboard' : '/student/dashboard'}
                className="btn btn-primary btn-sm"
              >
                <LayoutDashboard size={15} />
                <span>{role === 'admin' ? 'Admin Portal' : 'Student Portal'}</span>
              </Link>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.7rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                <User size={14} color="var(--primary)" />
                <span>{user?.name?.split(' ')[0] || (role === 'admin' ? 'Admin' : 'Student')}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link
                to="/login/student"
                className="btn btn-outline btn-sm"
              >
                <LogIn size={15} />
                <span>Student Login</span>
              </Link>
              <Link to="/register/student" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="btn-icon mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: '1rem',
                fontWeight: 500,
                color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                padding: '0.4rem 0',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.5rem 0' }} />
          {isAuthenticated ? (
            <>
              <Link
                to={role === 'admin' ? '/teacher/dashboard' : '/student/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
              >
                <LayoutDashboard size={18} />
                <span>Go to Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/login/student"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-outline"
              >
                <LogIn size={18} />
                <span>Student Login</span>
              </Link>
              <Link
                to="/register/student"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
              >
                <UserPlus size={18} />
                <span>Student Registration</span>
              </Link>
              <Link
                to="/login/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
              >
                Faculty & Administrator Gateway
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 1220px) {
          .helpline-pill { display: none !important; }
        }
        @media (max-width: 1024px) {
          .desktop-nav, .desktop-auth { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
        @media (max-width: 480px) {
          .brand-subtitle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
