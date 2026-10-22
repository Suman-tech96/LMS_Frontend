import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { examinationsApi } from '../../api/examinationsApi';
import { studyMaterialsApi } from '../../api/studyMaterialsApi';
import { resultsApi } from '../../api/resultsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  GraduationCap,
  Calendar,
  FileText,
  Award,
  ArrowRight,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [examsRes, materialsRes, resultsRes] = await Promise.allSettled([
          examinationsApi.getStudentAvailableExams(),
          studyMaterialsApi.getAllStudyMaterials({ limit: 5 }),
          resultsApi.getStudentPublishedResults(),
        ]);

        if (isMounted) {
          if (examsRes.status === 'fulfilled' && examsRes.value.success) {
            setExams(examsRes.value.data || []);
          }
          if (materialsRes.status === 'fulfilled' && materialsRes.value.success) {
            setMaterials(materialsRes.value.data || []);
          }
          if (resultsRes.status === 'fulfilled' && resultsRes.value.success) {
            setResults(resultsRes.value.data || []);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving real-time academic records..." />;
  }

  const liveOrUpcomingExam = exams.find((e) => e.canAttempt || e.hasActiveAttempt || e.lifecycleStatus === 'Live' || e.lifecycleStatus === 'Upcoming');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #14281c 0%, #264a34 100%)',
          color: '#ffffff',
          borderColor: 'transparent',
          padding: 'clamp(1.25rem, 3.5vw, 2.25rem)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.04em',
                }}
              >
                {user?.studentId || 'STUDENT ID'}
              </span>
              <span
                style={{
                  backgroundColor: '#9de0b0',
                  color: '#0e2617',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Enrolled Active
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)', marginBottom: '0.4rem', color: '#ffffff', fontFamily: 'var(--font-serif)' }}>
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem' }}>
              Academic Program: <strong style={{ color: '#ffffff' }}>{user?.course?.name || 'Master of Computer Applications'}</strong> (Batch: {user?.batch || '2026-2027'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/student/examinations" className="btn" style={{ backgroundColor: '#ffffff', color: '#14281c', fontWeight: 600 }}>
              <Calendar size={16} />
              <span>Examination Schedule</span>
            </Link>
            <Link to="/student/materials" className="btn" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}>
              <FileText size={16} />
              <span>Browse Courseware</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-4">
        <Link
          to="/student/courses"
          className="card card-hover"
          style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Degree Program</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#e8f4ed', color: 'var(--primary)' }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {user?.course?.code || 'MCA'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Batch: {user?.batch || '2026-2027'}
          </div>
        </Link>

        <Link
          to="/student/examinations"
          className="card card-hover"
          style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Scheduled Exams</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#fdf3e7', color: 'var(--accent)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {exams.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Active proctored windows
          </div>
        </Link>

        <Link
          to="/student/materials"
          className="card card-hover"
          style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Course Notes</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#f5f1ea', color: 'var(--text-primary)' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {materials.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Verified lecture materials
          </div>
        </Link>

        <Link
          to="/student/results"
          className="card card-hover"
          style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Evaluated Results</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#e8f4ed', color: 'var(--primary)' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {results.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Published transcripts
          </div>
        </Link>
      </div>

      {/* Main Grid: Active Exam + Recent Materials */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.75rem' }} className="dashboard-grid">
        {/* Left Column: Priority Examination Notice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="card-header">
              <h3 className="card-title">Assigned Examination Status</h3>
              <Link to="/student/examinations" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            {liveOrUpcomingExam ? (
              <div
                style={{
                  backgroundColor: '#f5f1ea',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      {liveOrUpcomingExam.title}
                    </h4>
                    <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-secondary)' }}>
                      {liveOrUpcomingExam.description || 'Proctored assessment session'}
                    </p>
                  </div>
                  <Badge variant={liveOrUpcomingExam.canAttempt ? 'success' : 'warning'}>
                    {liveOrUpcomingExam.hasActiveAttempt
                      ? 'In Progress'
                      : liveOrUpcomingExam.lifecycleStatus || 'Scheduled'}
                  </Badge>
                </div>

                <div
                  className="exam-meta-grid"
                  style={{
                    padding: '1rem 0',
                    borderTop: '1px solid #e4dfd4',
                    borderBottom: '1px solid #e4dfd4',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.775rem' }}>Duration:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{liveOrUpcomingExam.durationMinutes} Minutes</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.775rem' }}>Total Marks:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{liveOrUpcomingExam.totalMarks} Marks</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.775rem' }}>Passing Score:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{liveOrUpcomingExam.passingMarks} Marks</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <Link
                    to={`/student/examinations/${liveOrUpcomingExam._id}/instructions`}
                    className="btn btn-primary"
                  >
                    <span>{liveOrUpcomingExam.hasActiveAttempt ? 'Resume Examination' : 'View Guidelines & Start'}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No active exams right now"
                description="All scheduled examinations for your batch will appear here once activated."
              />
            )}
          </div>

          {/* Recent Published Result */}
          {results.length > 0 && (
            <div className="card" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="card-header">
                <h3 className="card-title">Latest Official Result</h3>
                <Link to="/student/results" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  All Results
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  backgroundColor: '#f5f1ea',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                    {results[0].examination?.title || 'Academic Assessment'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Status: <strong style={{ color: results[0].isPassed ? 'var(--success)' : 'var(--danger)' }}>
                      {results[0].isPassed ? 'Passed' : 'Needs Review'}
                    </strong> | Grade: <strong>{results[0].grade || 'Evaluated'}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {results[0].obtainedMarks} / {results[0].totalMarks}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {results[0].percentage}% score
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Study Materials */}
        <div className="card" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="card-header">
            <h3 className="card-title">Course Study Materials</h3>
            <Link to="/student/materials" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          {materials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {materials.map((m) => (
                <div
                  key={m._id}
                  style={{
                    padding: '0.9rem',
                    backgroundColor: '#faf6f0',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {m.category || 'General'} • {m.fileType?.toUpperCase() || 'PDF'}
                    </div>
                  </div>

                  {m.fileUrl ? (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#ffffff' }}
                    >
                      <ExternalLink size={13} />
                      <span>Open</span>
                    </a>
                  ) : (
                    <span className="badge badge-neutral">No File</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No materials uploaded"
              description="Study materials assigned to your course will appear here."
            />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
