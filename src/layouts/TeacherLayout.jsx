import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { DashboardSidebar } from '../components/navigation/DashboardSidebar';
import { useAuth } from '../context/useAuth';
import { Menu, Info, ShieldCheck, AlertTriangle } from 'lucide-react';

export const TeacherLayout = () => {
  const { user, role } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-container" style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <DashboardSidebar type="teacher" />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 999,
            display: 'flex',
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            style={{ width: '280px', height: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <DashboardSidebar type="teacher" onNavigate={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          className="teacher-top-header"
          style={{
            height: '65px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="btn-icon mobile-drawer-btn"
              style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem', flexShrink: 0 }}
              aria-label="Toggle faculty sidebar"
            >
              <Menu size={22} color="var(--text-primary)" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
              <span className="teacher-header-prefix" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>Academic Administration</span>
              <span className="teacher-header-prefix" style={{ color: 'var(--border-subtle)', flexShrink: 0 }}>/</span>
              <span
                className="teacher-header-title"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={role === 'admin' ? 'Faculty & Administrative Control' : 'Staff Portal (Review Mode)'}
              >
                {role === 'admin' ? 'Faculty & Administrative Control' : 'Staff Portal (Review Mode)'}
              </span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {role === 'admin' ? (
              <span
                className="teacher-header-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#e8f4ed',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #bedbc7',
                  whiteSpace: 'nowrap',
                }}
              >
                <ShieldCheck size={14} />
                <span>Admin Session</span>
              </span>
            ) : (
              <span
                className="teacher-header-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#fdf3e7',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #f4dfc2',
                  whiteSpace: 'nowrap',
                }}
              >
                <AlertTriangle size={14} />
                <span>Staff Review</span>
              </span>
            )}
            <Link
              to="/teacher/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 6px rgba(112, 92, 48, 0.2)',
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }} className="desktop-username">
                {user?.name || (role === 'admin' ? 'Administrator' : 'Academic Staff')}
              </span>
            </Link>
          </div>
        </header>

        {/* Staff Review Advisory */}
        {role !== 'admin' && (
          <div
            style={{
              backgroundColor: '#fdf3e7',
              borderBottom: '1px solid #f4dfc2',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: '#705c30',
            }}
          >
            <Info size={18} style={{ flexShrink: 0 }} />
            <div>
              Staff Preview Mode: To perform live updates to curriculum syllabi, question banks, or publish results, please authenticate via the <Link to="/login/admin" style={{ textDecoration: 'underline', fontWeight: 600, color: '#705c30' }}>Administrator Gateway</Link>.
            </div>
          </div>
        )}

        {/* Child Page Content */}
        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .desktop-sidebar-container { display: none !important; }
          .mobile-drawer-btn { display: inline-flex !important; }
          .desktop-username { display: none !important; }
        }
        @media (max-width: 640px) {
          .teacher-top-header { padding: 0 0.85rem !important; }
          .teacher-header-prefix { display: none !important; }
          .teacher-header-badge { display: none !important; }
          .teacher-header-title { max-width: 170px !important; }
          .dashboard-main-content { padding: 1rem 0.75rem !important; max-width: 100vw !important; overflow-x: hidden !important; box-sizing: border-box !important; }
        }
        @media (max-width: 380px) {
          .teacher-header-title { max-width: 130px !important; }
          .dashboard-main-content { padding: 0.85rem 0.5rem !important; }
        }
      `}</style>
    </div>
  );
};
