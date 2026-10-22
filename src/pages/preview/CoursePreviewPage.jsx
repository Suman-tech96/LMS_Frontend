import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesApi } from '../../api/coursesApi';
import { studyMaterialsApi } from '../../api/studyMaterialsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  BookOpen,
  Calendar,
  FileText,
  Video,
  Printer,
  X,
  AlertCircle,
  ExternalLink,
  Layers,
  GraduationCap,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const CoursePreviewPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await coursesApi.getCourseById(id);
        if (res.success && res.data) {
          setCourse(res.data);
        } else {
          throw new Error('Course curriculum not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load course preview.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <LoadingSpinner fullPage text="Loading complete curriculum & course syllabus preview..." />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Unable to Preview Course</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{error || 'Course record could not be found.'}</p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button onClick={handleClose} className="btn btn-secondary">
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Top Control Bar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
              Academic Course Curriculum & Examination Map
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              title="Print Curriculum / Save as PDF"
            >
              <Printer size={15} />
              <span>Print Syllabus</span>
            </button>
            <button
              onClick={handleClose}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              title="Close this tab"
            >
              <X size={15} />
              <span>Close Tab</span>
            </button>
          </div>
        </div>

        {/* Course Document Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    fontSize: '0.85rem',
                  }}
                >
                  CODE: {course.code}
                </span>
                <Badge variant={course.status === 'active' ? 'success' : 'neutral'}>
                  {(course.status || 'active').toUpperCase()}
                </Badge>
                {course.category && (
                  <span
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {course.category}
                  </span>
                )}
              </div>
              <h1 style={{ margin: '0.75rem 0 0.5rem 0', fontSize: '2.25rem', fontWeight: 800, color: '#ffffff' }}>
                {course.name}
              </h1>
              <p style={{ margin: 0, color: '#a7f3d0', fontSize: '1rem', maxWidth: '750px', lineHeight: 1.5 }}>
                {course.description || 'Program curriculum, academic cohorts, and proctored examination milestones.'}
              </p>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Allocated Cohorts</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                  {course.batches && course.batches.length > 0 ? (
                    course.batches.map((b) => (
                      <span key={b} style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {b}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem' }}>2026</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Associated Study Materials */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="#10b981" /> Mapped Study Materials & Lecture Notes ({course.studyMaterials?.length || 0})
                </h2>
              </div>
              {course.studyMaterials && course.studyMaterials.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {course.studyMaterials.map((mat) => {
                    const resolvedUrl = mat.fileUrl ? studyMaterialsApi.resolveFileUrl(mat.fileUrl) : null;
                    return (
                      <div
                        key={mat._id}
                        style={{
                          padding: '1.25rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{mat.title}</strong>
                            <Badge variant={mat.status === 'active' ? 'success' : 'neutral'}>
                              {mat.status || 'Active'}
                            </Badge>
                          </div>
                          {mat.description && (
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                              {mat.description}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {mat.fileType ? mat.fileType.toUpperCase() : 'DOCUMENT'}
                          </span>
                          {resolvedUrl ? (
                            <a
                              href={resolvedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                            >
                              <ExternalLink size={13} />
                              <span>Preview Document</span>
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No link</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  No study materials mapped to this course yet.
                </div>
              )}
            </div>

            {/* Associated Examinations */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="#6366f1" /> Mapped Proctored Examinations ({course.examinations?.length || 0})
                </h2>
              </div>
              {course.examinations && course.examinations.length > 0 ? (
                <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th>Assessment Title</th>
                        <th>Duration</th>
                        <th>Passing Marks</th>
                        <th>Total Marks</th>
                        <th>Schedule</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.examinations.map((ex) => (
                        <tr key={ex._id}>
                          <td>
                            <strong>{ex.title}</strong>
                            {ex.description && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ex.description}</div>}
                          </td>
                          <td>{ex.durationMinutes} mins</td>
                          <td>{ex.passingMarks}</td>
                          <td>{ex.totalMarks}</td>
                          <td>
                            {ex.startDate ? new Date(ex.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Scheduled'}
                          </td>
                          <td>
                            <Badge variant={ex.status === 'live' ? 'success' : 'neutral'}>
                              {ex.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  No proctored examinations mapped to this course yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
