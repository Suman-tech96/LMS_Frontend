import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentsApi } from '../../api/studentsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Award,
  ArrowLeft,
  Printer,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Hash,
} from 'lucide-react';

export const StudentPreviewPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentRes = await studentsApi.getStudentById(id);
        if (studentRes.success && studentRes.data) {
          setStudent(studentRes.data);
        } else {
          throw new Error('Student profile not found');
        }

        // Fetch exams history & results in parallel
        try {
          const examsRes = await studentsApi.getStudentExaminations(id);
          if (examsRes.success) setExams(examsRes.data || []);
        } catch (e) {
          console.warn('Exams fetch error:', e.message);
        }

        try {
          const resultsRes = await studentsApi.getStudentResults(id);
          if (resultsRes.success) setResults(resultsRes.data || []);
        } catch (e) {
          console.warn('Results fetch error:', e.message);
        }
      } catch (err) {
        setError(err.message || 'Failed to load student preview record.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentData();
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
        <LoadingSpinner fullPage text="Loading full student dossier preview..." />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Unable to Preview Student</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{error || 'Student record could not be found.'}</p>
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

  const statusVariant =
    student.status === 'active' ? 'success' : student.status === 'inactive' ? 'neutral' : 'review';

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
              Official Student Dossier & Record Preview
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              title="Print Dossier / Save as PDF"
            >
              <Printer size={15} />
              <span>Print Dossier</span>
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

        {/* Dossier Document Container */}
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
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                }}
              >
                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                    {student.name}
                  </h1>
                  <Badge variant={statusVariant}>
                    {(student.status || 'active').toUpperCase()}
                  </Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                    <Hash size={16} /> ID: <strong style={{ color: '#ffffff' }}>{student.studentId}</strong>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                    <BookOpen size={16} /> Course: <strong style={{ color: '#ffffff' }}>{student.course?.code || student.course?.name || 'N/A'}</strong>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                    <Calendar size={16} /> Batch: <strong style={{ color: '#ffffff' }}>{student.batch || '2026'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Enrolled On</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>
                {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Dossier Body */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Contact & Academic Quick Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="#3b82f6" /> Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Email Address:</span>
                    <strong style={{ color: '#1e293b' }}>{student.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Phone Number:</span>
                    <strong style={{ color: '#1e293b' }}>{student.phone || 'Not Provided'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Account Status:</span>
                    <Badge variant={statusVariant}>{student.status || 'Active'}</Badge>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} color="#10b981" /> Academic Program
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Course Name:</span>
                    <strong style={{ color: '#1e293b' }}>{student.course?.name || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Course Code:</span>
                    <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                      {student.course?.code || 'N/A'}
                    </code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Allocated Batch:</span>
                    <strong style={{ color: '#1e293b' }}>{student.batch || '2026'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Examination History Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="#6366f1" /> Examination History ({exams.length})
                </h2>
              </div>
              {exams.length > 0 ? (
                <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th>Examination Title</th>
                        <th>Course</th>
                        <th>Start Date</th>
                        <th>Duration</th>
                        <th>Passing Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((ex) => (
                        <tr key={ex._id}>
                          <td>
                            <strong>{ex.title}</strong>
                            {ex.description && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ex.description}</div>}
                          </td>
                          <td>{ex.course?.code || ex.course?.name || 'General'}</td>
                          <td>
                            {ex.startDate ? new Date(ex.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Scheduled'}
                          </td>
                          <td>{ex.durationMinutes} mins</td>
                          <td>{ex.passingMarks} / {ex.totalMarks}</td>
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
                  No examination schedule records found for this student.
                </div>
              )}
            </div>

            {/* Academic Results & Transcripts Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="#f59e0b" /> Academic Results & Transcript Records ({results.length})
                </h2>
              </div>
              {results.length > 0 ? (
                <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th>Assessment</th>
                        <th>Score Obtained</th>
                        <th>Total Marks</th>
                        <th>Percentage</th>
                        <th>Verdict</th>
                        <th>Publication Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => {
                        const pct = r.totalMarks ? ((r.scoreObtained / r.totalMarks) * 100).toFixed(1) : 0;
                        const isPass = r.status === 'passed' || r.scoreObtained >= (r.passingMarks || 0);
                        return (
                          <tr key={r._id}>
                            <td>
                              <strong>{r.examination?.title || r.examTitle || 'Semester Assessment'}</strong>
                            </td>
                            <td>
                              <strong style={{ color: isPass ? '#10b981' : '#ef4444' }}>{r.scoreObtained}</strong>
                            </td>
                            <td>{r.totalMarks || 100}</td>
                            <td>
                              <span style={{ fontWeight: 600 }}>{pct}%</span>
                            </td>
                            <td>
                              <Badge variant={isPass ? 'success' : 'danger'}>
                                {isPass ? 'PASSED' : 'NEEDS RE-EVAL'}
                              </Badge>
                            </td>
                            <td>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  No published result transcripts found for this student.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
