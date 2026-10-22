import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import logoImg from '../../assets/LMS_logo.jpeg';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Calendar,
  History,
  Award,
  User,
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';

export const DashboardSidebar = ({ type = 'student', onNavigate }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/materials', label: 'Study Materials', icon: FileText },
    { to: '/student/courses', label: 'My Course', icon: BookOpen },
    { to: '/student/examinations', label: 'Examinations', icon: Calendar },
    { to: '/student/exam-history', label: 'Exam History', icon: History },
    { to: '/student/results', label: 'Published Results', icon: Award },
    { to: '/student/profile', label: 'Student Profile', icon: User },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/teacher/courses', label: 'Courses & Batches', icon: BookOpen },
    { to: '/teacher/students', label: 'Enrolled Students', icon: Users },
    { to: '/teacher/materials', label: 'Study Materials', icon: FileText },
    { to: '/teacher/examinations', label: 'Examinations', icon: Calendar },
    { to: '/teacher/results', label: 'Results & Publish', icon: Award },
    { to: '/teacher/profile', label: 'Profile', icon: User },
  ];

  const links = type === 'student' ? studentLinks : teacherLinks;

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate();
    navigate('/');
  };

  return (
    <aside
      className="dashboard-sidebar-root"
      style={{
        width: collapsed ? '76px' : '260px',
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: '#122218',
        borderRight: '1px solid #1e3929',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: collapsed ? '1rem 0.5rem' : '1.15rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: collapsed ? '0.65rem' : '0.5rem',
          flexShrink: 0,
        }}
      >
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, overflow: 'hidden' }}>
            <img
              src={logoImg}
              alt="Sarat Education"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                flexShrink: 0,
              }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#ffffff',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {type === 'student' ? 'Student Portal' : role === 'admin' ? 'Admin Portal' : 'Faculty Portal'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#a3e2b4', fontWeight: 600, letterSpacing: '0.02em' }}>
                Sarat Education
              </div>
            </div>
          </div>
        ) : (
          <img
            src={logoImg}
            alt="Sarat Education"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              objectFit: 'cover',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'block',
            }}
          />
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-icon"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            padding: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color var(--transition-fast)',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User Info Capsule */}
      {!collapsed ? (
        <div
          style={{
            margin: '0.85rem 0.85rem 0.5rem 0.85rem',
            padding: '0.75rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(61, 110, 78, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9de0b0',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#f5f0e8',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name || 'Authorized User'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#a0a89d' }}>
                {user?.studentId ? user.studentId : role === 'admin' ? 'Administrator' : 'Student'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            margin: '0.65rem auto 0.25rem auto',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(61, 110, 78, 0.45)',
            border: '1px solid rgba(157, 224, 176, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9de0b0',
            fontWeight: 700,
            fontSize: '0.9rem',
            flexShrink: 0,
            cursor: 'default',
          }}
          title={`${user?.name || 'Authorized User'} (${user?.studentId || (role === 'admin' ? 'Administrator' : 'Student')})`}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      )}

      {/* Nav Items (Smooth Scrollable Area) */}
      <nav
        className="sidebar-scrollable-nav"
        style={{
          flex: 1,
          minHeight: 0,
          padding: collapsed ? '0.6rem 0.4rem' : '0.65rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              end={item.to === '/student/dashboard' || item.to === '/teacher/dashboard'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: collapsed ? '0.7rem 0' : '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 500,
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 2px 8px var(--primary-glow)' : 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
              })}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Actions (Always Anchored at Bottom) */}
      <div
        style={{
          padding: collapsed ? '0.75rem 0.45rem' : '0.85rem 1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: '#0f1c14',
          flexShrink: 0,
        }}
      >
        <NavLink
          to="/"
          onClick={onNavigate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: collapsed ? '0.6rem 0' : '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '0.85rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            textDecoration: 'none',
            transition: 'all var(--transition-fast)',
            width: '100%',
          }}
          title={collapsed ? 'Return to Website' : undefined}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Home size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Return to Website</span>}
        </NavLink>

        {/* Dedicated Visible Sign Out Action Button */}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          aria-label="Sign Out"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.75rem',
            padding: collapsed ? '0.65rem 0' : '0.65rem 0.85rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
            e.currentTarget.style.color = '#fca5a5';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.28)';
          }}
        >
          <LogOut size={18} strokeWidth={2.2} style={{ flexShrink: 0, color: 'inherit' }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <style>{`
        .sidebar-scrollable-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scrollable-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scrollable-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }
        .sidebar-scrollable-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </aside>
  );
};
