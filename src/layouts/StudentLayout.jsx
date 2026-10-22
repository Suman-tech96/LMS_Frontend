import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { DashboardSidebar } from '../components/navigation/DashboardSidebar';
import { useAuth } from '../context/useAuth';
import { Menu, X, Bell, User, BookOpen } from 'lucide-react';

export const StudentLayout = () => {
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-container" style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <DashboardSidebar type="student" />
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
            <DashboardSidebar type="student" onNavigate={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          className="student-top-header"
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
              aria-label="Toggle student sidebar"
            >
              <Menu size={22} color="var(--text-primary)" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
              <span className="student-header-prefix" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>Student Space</span>
              <span className="student-header-prefix" style={{ color: 'var(--border-subtle)', flexShrink: 0 }}>/</span>
              <span
                className="student-header-title"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={user?.course?.name || 'Academic Program'}
              >
                {user?.course?.name || 'Academic Program'}
              </span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {user?.batch && (
              <span
                className="student-header-batch"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f5f1ea',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                }}
              >
                <BookOpen size={13} />
                <span>Batch: {user.batch}</span>
              </span>
            )}
            <Link
              to="/student/profile"
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
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 6px var(--primary-glow)',
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }} className="desktop-username">
                {user?.name || 'Student'}
              </span>
            </Link>
          </div>
        </header>

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
          .student-top-header { padding: 0 0.85rem !important; }
          .student-header-prefix { display: none !important; }
          .student-header-batch { display: none !important; }
          .student-header-title { max-width: 170px !important; }
          .dashboard-main-content { padding: 1rem 0.75rem !important; max-width: 100vw !important; overflow-x: hidden !important; box-sizing: border-box !important; }
        }
        @media (max-width: 380px) {
          .student-header-title { max-width: 130px !important; }
          .dashboard-main-content { padding: 0.85rem 0.5rem !important; }
        }
      `}</style>
    </div>
  );
};
