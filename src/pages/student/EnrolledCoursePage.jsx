import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { coursesApi } from '../../api/coursesApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { BookOpen, Calendar, FileText, CheckCircle2, ShieldAlert, Layers, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EnrolledCoursePage = () => {
  const { user } = useAuth();
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCourse = async () => {
      const courseId = user?.course?._id || user?.course;
      if (!courseId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await coursesApi.getCourseById(courseId);
        if (res.success && isMounted) {
          setCourseDetails(res.data);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to retrieve course details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourse();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving enrolled curriculum information..." />;
  }

  const course = courseDetails || user?.course || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Enrolled Course</h1>
        <p style={{ margin: 0 }}>
          Detailed curriculum, syllabus, and mapped examinations for your degree program.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Main Course Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #14281c 0%, #264a34 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: 'clamp(1.25rem, 4vw, 2.5rem)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                {course.category || 'Postgraduate'}
              </span>
              <span
                style={{
                  backgroundColor: '#9de0b0',
                  color: '#0e2617',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                Active Enrollment
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4.5vw, 2.35rem)',
                marginBottom: '0.5rem',
                color: '#ffffff',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.25,
              }}
            >
              {course.name || 'Master of Computer Applications'}
            </h2>
            <div style={{ fontSize: '1rem', color: '#a8e6b8', fontWeight: 600, letterSpacing: '0.02em' }}>
              Course Code: {course.code || 'MCA'}
            </div>
          </div>

          <div
            className="enrolled-batch-box"
            style={{
              padding: '0.85rem 1.35rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
              Assigned Batch
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-serif)' }}>
              {user?.batch || '2026-2027'}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.975rem', lineHeight: '1.75', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '850px', margin: 0 }}>
          {course.description || 'A comprehensive postgraduate degree course covering advanced computer applications, distributed computing, database engineering, and modern application development.'}
        </p>

        {course.youtubeLink && (
          <div style={{ marginTop: '1.25rem' }}>
            <a
              href={course.youtubeLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Video size={15} color="#fca5a5" />
              <span>Watch Course Introduction Video</span>
            </a>
          </div>
        )}
      </div>

      {/* Mapped Modules Grid */}
      <div className="enrolled-modules-grid">
        {/* Linked Study Materials */}
        <div className="card" style={{ padding: 'clamp(1.15rem, 3vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.15rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <FileText size={18} color="var(--primary)" />
              <span>Assigned Study Materials</span>
            </h3>
            <Link to="/student/materials" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          {course.studyMaterials && course.studyMaterials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {course.studyMaterials.map((mat) => (
                <div
                  key={mat._id}
                  style={{
                    padding: '0.85rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{mat.title}</span>
                  <Link to="/student/materials" style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Access Material &rarr;
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              General materials for this course can be accessed via the Study Materials tab.
            </p>
          )}
        </div>

        {/* Linked Examinations */}
        <div className="card" style={{ padding: 'clamp(1.15rem, 3vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.15rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Calendar size={18} color="var(--accent)" />
              <span>Mapped Examinations</span>
            </h3>
            <Link to="/student/examinations" className="btn btn-secondary btn-sm">
              View Schedule
            </Link>
          </div>

          {course.examinations && course.examinations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {course.examinations.map((exam) => (
                <div
                  key={exam._id}
                  style={{
                    padding: '0.85rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{exam.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total Marks: {exam.totalMarks || 20}
                    </div>
                  </div>
                  <Badge variant={exam.status === 'published' ? 'success' : 'neutral'}>
                    {exam.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Evaluations assigned to your batch appear in the Examination Schedule.
            </p>
          )}
        </div>
      </div>

      {/* Program Association Policy Notice */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderLeft: '4px solid var(--primary)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
          <ShieldAlert size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Course Assignment Policy
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              Course and batch affiliations are bound directly to your authenticated student profile in the database. Per institutional regulations, students cannot unilaterally reassign courses or batches. If you need a batch transfer or course correction, please contact your academic administrator.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .enrolled-modules-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .enrolled-modules-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .enrolled-batch-box {
            width: 100% !important;
            text-align: left !important;
            margin-top: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
