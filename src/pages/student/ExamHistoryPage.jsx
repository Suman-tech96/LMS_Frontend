import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultsApi } from '../../api/resultsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { History, Award, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const ExamHistoryPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await resultsApi.getStudentPublishedResults();
        if (res.success && isMounted) {
          setResults(res.data || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to retrieve exam history.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving student attempt records..." />;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Examination History</h1>
        <p style={{ margin: 0 }}>
          Chronological record of completed examination sessions, evaluations, and submission logs.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Examination Title</th>
                <th>Course / Batch</th>
                <th>Attempt Date</th>
                <th>Total / Obtained</th>
                <th>Score %</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.examination?.title || 'Academic Assessment'}</strong>
                  </td>
                  <td>
                    {r.course?.code || 'MCA'} ({r.batch || '2026-2027'})
                  </td>
                  <td>{formatDateTime(r.participation?.submitTime || r.createdAt)}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {r.obtainedMarks} / {r.totalMarks}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: r.isPassed ? 'var(--success)' : 'var(--danger)' }}>
                      {r.percentage}%
                    </span>
                  </td>
                  <td>
                    <Badge variant={r.isPassed ? 'success' : 'danger'}>
                      {r.isPassed ? 'Passed' : 'Failed'}
                    </Badge>
                  </td>
                  <td>
                    <Link to="/student/results" className="btn btn-secondary btn-sm">
                      <Award size={14} />
                      <span>Result Breakdown</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No completed examination history found"
          description="Once you complete and submit an examination, your submission records and transcripts will be archived here."
          action={
            <Link to="/student/examinations" className="btn btn-primary">
              <Calendar size={16} />
              <span>Go to Available Exams</span>
            </Link>
          }
        />
      )}
    </div>
  );
};
