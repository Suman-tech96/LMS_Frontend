import React from 'react';
import { useAuth } from '../../context/useAuth';
import { Badge } from '../../components/common/Badge';
import { Shield, Mail, Calendar, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherProfilePage = () => {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const formatDateTime = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Profile</h1>
        <p style={{ margin: 0 }}>
          Authentication credentials, privileges, and system access role.
        </p>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: isAdmin
                ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                : 'linear-gradient(135deg, var(--primary) 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.85rem',
              fontWeight: 700,
              boxShadow: '0 6px 18px rgba(245, 158, 11, 0.3)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{user?.name || 'Academic Administrator'}</h2>
              <Badge variant={isAdmin ? 'success' : 'warning'}>
                {isAdmin ? 'System Administrator' : 'Guest Staff'}
              </Badge>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Sarat Education Gateway Access
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Account Email
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              <Mail size={16} color="var(--primary-light)" />
              <span>{user?.email || 'admin@lms.com'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Privilege Level
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              <Shield size={16} color="var(--warning)" />
              <span>{isAdmin ? 'Full Administrator Access' : 'Read-Only Faculty View'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Account Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--success)' }}>
              <UserCheck size={16} />
              <span>Active and Verified</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Last Login Session
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
              <span>{formatDateTime(user?.lastLogin)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
