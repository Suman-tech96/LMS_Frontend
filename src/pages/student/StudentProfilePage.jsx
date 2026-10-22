import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { authApi } from '../../api/authApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Clock,
  BookOpen,
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user: initialUser } = useAuth();
  const [profile, setProfile] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    setRefreshSuccess(false);
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.student) {
        setProfile(res.data.student);
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Profile</h1>
          <p style={{ margin: 0 }}>
            Verified student record, identity credentials, and course affiliation.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary btn-sm"
          disabled={loading}
          title="Refresh profile from backend"
        >
          <RotateCcw size={15} />
          <span>{loading ? 'Refreshing...' : 'Refresh Records'}</span>
        </button>
      </div>

      {refreshSuccess && (
        <div className="alert alert-success" style={{ margin: 0 }}>
          <ShieldCheck size={18} />
          <span>Profile records synchronized with server database.</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
        {/* User Identity Top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.85rem',
              fontWeight: 700,
              boxShadow: '0 6px 18px var(--primary-glow)',
            }}
          >
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{profile?.name || 'Student Name'}</h2>
              <Badge variant="success">{profile?.status || 'Active'}</Badge>
            </div>
            <div style={{ display: 'flex', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <span>ID: <strong style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>{profile?.studentId}</strong></span>
              <span>•</span>
              <span>Role: Student Scholar</span>
            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }} className="profile-fields-grid">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Official Email
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              <Mail size={16} color="var(--primary-light)" />
              <span>{profile?.email}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Registered Phone
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              <Phone size={16} color="var(--accent)" />
              <span>{profile?.phone || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Enrolled Degree Program
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              <GraduationCap size={16} color="var(--primary-light)" />
              <span>{profile?.course?.name || 'Master of Computer Applications'} ({profile?.course?.code || 'MCA'})</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Academic Batch
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              <BookOpen size={16} color="var(--warning)" />
              <span>{profile?.batch || '2026-2027'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Enrollment Date
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <Calendar size={16} />
              <span>{formatDateTime(profile?.enrolledDate || profile?.createdAt)}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Last Session Activity
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
              <span>{formatDateTime(profile?.lastLogin)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .profile-fields-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
