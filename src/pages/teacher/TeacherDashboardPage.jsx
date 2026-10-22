import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { dashboardApi } from '../../api/dashboardApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  Award,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const TeacherDashboardPage = () => {
  const { user, role } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      if (role !== 'admin') {
        // Teacher role is not provisioned on backend; don't make forbidden call
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await dashboardApi.getOverview();
        if (res.success && isMounted) {
          setOverview(res.data);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to load administration overview.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, [role]);

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving faculty overview statistics..." />;
  }

  const isAdmin = role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #261f15 0%, #4a3c26 100%)',
          color: '#ffffff',
          borderColor: 'transparent',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <span
                style={{
                  backgroundColor: isAdmin ? '#e8f4ed' : '#fdf3e7',
                  color: isAdmin ? 'var(--primary)' : 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {isAdmin ? 'Administrative Privileges Active' : 'Staff Overview Session'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                {user?.email || 'Official Staff Gateway'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem', color: '#ffffff', fontFamily: 'var(--font-serif)' }}>
              Faculty & Academic Management Dashboard
            </h1>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem' }}>
              Curriculum oversight, student enrollment rosters, proctored examinations, and performance publishing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/teacher/examinations" className="btn" style={{ backgroundColor: '#ffffff', color: '#261f15', fontWeight: 600 }}>
              <Calendar size={16} />
              <span>Examination Setup</span>
            </Link>
            <Link to="/teacher/results" className="btn" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
              <Award size={16} />
              <span>Results & Grading</span>
            </Link>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="alert alert-warning" style={{ backgroundColor: '#fdf3e7', borderColor: '#f4dfc2', color: '#705c30' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Staff Review Mode:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Course curricula, batch structures, and examination records are displayed in read-only review mode. To configure new examinations, add test questions, or publish official results, please sign in through the <Link to="/login/admin" style={{ textDecoration: 'underline', fontWeight: 600, color: '#705c30' }}>Administrator Gateway</Link>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Real Statistics from GET /dashboard/overview */}
      {isAdmin && overview ? (
        <div className="grid grid-cols-4">
          <Link
            to="/teacher/students"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Enrolled Students</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#e8f4ed', color: 'var(--primary)' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {overview.students?.total || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              {overview.students?.active || 0} Active Candidates
            </div>
          </Link>

          <Link
            to="/teacher/courses"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Academic Curricula</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#fdf3e7', color: 'var(--accent)' }}>
                <BookOpen size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {overview.courses?.total }
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Accredited degree programs
            </div>
          </Link>

          <Link
            to="/teacher/examinations"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Examinations</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#f5f1ea', color: 'var(--text-primary)' }}>
                <Calendar size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {overview.examinations?.total || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {overview.examinations?.upcoming || 0} Upcoming • {overview.examinations?.completed || 0} Completed
            </div>
          </Link>

          <Link
            to="/teacher/results"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Evaluated Transcripts</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#e8f4ed', color: 'var(--primary)' }}>
                <Award size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {overview.results?.total || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {overview.results?.published || 0} Published • {overview.results?.unpublished || 0} Draft
            </div>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4">
          <Link
            to="/teacher/students"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Enrolled Students</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-primary)' }}>Active Roster</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Admin Configured</span>
          </Link>
          <Link
            to="/teacher/courses"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Degree Programs</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-primary)' }}>MCA, MBA, BCA</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Active Curricula</span>
          </Link>
          <Link
            to="/teacher/examinations"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Assessments</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-primary)' }}>Proctored Exams</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Scheduled Batches</span>
          </Link>
          <Link
            to="/teacher/results"
            className="card card-hover"
            style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Official Results</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-primary)' }}>Evaluated Marks</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Published Records</span>
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-3">
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Curriculum & Batches</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            View academic programs, configure batches (e.g. 2026-2027), and associate study resources.
          </p>
          <Link to="/teacher/courses" className="btn btn-secondary btn-sm">
            <span>Manage Courses</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Student Roster</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Inspect student registration records, account statuses, and individual examination transcripts.
          </p>
          <Link to="/teacher/students" className="btn btn-secondary btn-sm">
            <span>View Students</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Question Bank & Exams</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Create multiple-choice questions, set marks, configure negative grading, and schedule exam windows.
          </p>
          <Link to="/teacher/examinations" className="btn btn-secondary btn-sm">
            <span>Examination Setup</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
