import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { examinationsApi } from '../../api/examinationsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  FileText,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const ExaminationInstructionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInstructions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examinationsApi.getStudentExamInstructions(id);
        if (res.success && isMounted) {
          setExamData(res.data);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to load examination instructions.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInstructions();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving examination instructions & attempt rules..." />;
  }

  if (error || !examData) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <AlertTriangle size={36} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Examination Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            {error || 'You may not be eligible to attempt this examination at this time.'}
          </p>
          <Link to="/student/examinations" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Schedule</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Breadcrumb / Back */}
      <div>
        <Link
          to="/student/examinations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Examination Timetable</span>
        </Link>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '0.5rem' }}>{examData.title}</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Course: <strong>{examData.course?.name || 'Master of Computer Applications'}</strong> ({examData.course?.code || 'MCA'})
        </p>
      </div>

      {/* Critical Rules Summary Grid */}
      <div className="grid grid-cols-4">
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Duration
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent)' }}>
            {examData.durationMinutes} Mins
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Total Marks
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {examData.totalMarks} Marks
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Passing Criteria
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--success)' }}>
            {examData.passingMarks} Marks
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Negative Marking
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: examData.negativeMarks > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
            {examData.negativeMarks > 0 ? `-${examData.negativeMarks}` : '0'}
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} color="var(--primary-light)" />
          <span>Official Examination Guidelines</span>
        </h3>

        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem',
            whiteSpace: 'pre-line',
            lineHeight: '1.8',
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
          }}
        >
          {examData.instructions || 'Answer all questions within the given time. Do not refresh or close the browser tab during the test.'}
        </div>

        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Candidate Assessment Rules:
        </h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
          <li style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Real-Time Server Synchronization:</strong> Your remaining time is calculated and enforced on the backend. When time expires, your exam attempt will automatically submit.
            </span>
          </li>
          <li style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Automatic Answer Saving:</strong> Every response you choose is transmitted immediately to the server (<code>POST /save-answer</code>). You can safely navigate questions or resume an active session.
            </span>
          </li>
          <li style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Attempt Limits:</strong> You have <strong>{examData.remainingAttempts !== undefined ? examData.remainingAttempts : '1'} attempt(s) remaining</strong> out of {examData.maxAttempts || 1} maximum allowed.
            </span>
          </li>
          {examData.negativeMarks > 0 && (
            <li style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', color: '#fca5a5' }}>
              <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Negative Marking Enforced:</strong> Each incorrect answer deducts {examData.negativeMarks} marks from your total score. Unattempted questions incur no deduction.
              </span>
            </li>
          )}
        </ul>

        {/* Agreement Checkbox */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <input
            id="exam-agree-checkbox"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="exam-agree-checkbox" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
            I confirm that I have read and agree to follow all examination conduct instructions.
          </label>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/student/examinations" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            onClick={() => navigate(`/student/examinations/${id}/attempt`)}
            className="btn btn-primary btn-lg"
            disabled={!agreed && !examData.hasActiveAttempt}
          >
            <span>{examData.hasActiveAttempt ? 'Resume Active Attempt' : 'Begin Examination Now'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
