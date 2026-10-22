import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { examinationsApi } from '../../api/examinationsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  HelpCircle,
  Plus,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Edit3,
  Power,
  RotateCcw,
} from 'lucide-react';

export const TeacherQuestionsPage = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Add question modal (Step 7)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    option0: '',
    option1: '',
    option2: '',
    option3: '',
    correctOptionIndex: 0,
    marks: 5,
    negativeMarks: 1,
    subject: 'Computer Applications',
    topic: 'Core Architecture',
    explanation: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit question modal (Step 8)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const showNotification = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  const fetchExamDetails = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await examinationsApi.getExaminationById(id);
      if (res.success) {
        setExam(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load examination questions.');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    fetchExamDetails();
  }, [fetchExamDetails]);

  // Step 7: Add Question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!newQuestion.questionText.trim()) {
      setAddError('Question text is required.');
      return;
    }
    const options = [
      newQuestion.option0.trim(),
      newQuestion.option1.trim(),
      newQuestion.option2.trim(),
      newQuestion.option3.trim(),
    ].filter(Boolean);

    if (options.length < 2) {
      setAddError('At least 2 options are required for multiple choice questions.');
      return;
    }

    setAddLoading(true);
    try {
      const payload = {
        questionText: newQuestion.questionText.trim(),
        options,
        correctOptionIndex: Number(newQuestion.correctOptionIndex),
        marks: Number(newQuestion.marks) || 1,
        negativeMarks: Number(newQuestion.negativeMarks) || 0,
        subject: newQuestion.subject.trim() || undefined,
        topic: newQuestion.topic.trim() || undefined,
        explanation: newQuestion.explanation.trim() || undefined,
      };

      const res = await examinationsApi.addExamQuestion(id, payload);
      if (res.success) {
        setShowAddModal(false);
        setNewQuestion({
          questionText: '',
          option0: '',
          option1: '',
          option2: '',
          option3: '',
          correctOptionIndex: 0,
          marks: 5,
          negativeMarks: 1,
          subject: 'Computer Applications',
          topic: 'Core Architecture',
          explanation: '',
        });
        showNotification('Question added to examination question bank.');
        fetchExamDetails();
      }
    } catch (err) {
      setAddError(err.message || 'Failed to add question to examination.');
    } finally {
      setAddLoading(false);
    }
  };

  // Step 8: Open & Submit Edit Question Modal
  const handleOpenEdit = (q) => {
    setEditingQuestion({
      _id: q._id,
      questionText: q.questionText || '',
      option0: q.options?.[0] || '',
      option1: q.options?.[1] || '',
      option2: q.options?.[2] || '',
      option3: q.options?.[3] || '',
      correctOptionIndex: q.correctOptionIndex ?? 0,
      marks: q.marks ?? 5,
      negativeMarks: q.negativeMarks ?? 1,
      subject: q.subject || '',
      topic: q.topic || '',
      explanation: q.explanation || '',
      isActive: q.isActive ?? true,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editingQuestion.questionText.trim()) {
      setEditError('Question text cannot be empty.');
      return;
    }

    const options = [
      editingQuestion.option0.trim(),
      editingQuestion.option1.trim(),
      editingQuestion.option2.trim(),
      editingQuestion.option3.trim(),
    ].filter(Boolean);

    if (options.length < 2) {
      setEditError('At least 2 options are required.');
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        questionText: editingQuestion.questionText.trim(),
        options,
        correctOptionIndex: Number(editingQuestion.correctOptionIndex),
        marks: Number(editingQuestion.marks),
        negativeMarks: Number(editingQuestion.negativeMarks),
        subject: editingQuestion.subject.trim() || undefined,
        topic: editingQuestion.topic.trim() || undefined,
        explanation: editingQuestion.explanation.trim() || undefined,
        isActive: editingQuestion.isActive,
      };

      const res = await examinationsApi.updateExamQuestion(id, editingQuestion._id, payload);
      if (res.success) {
        setShowEditModal(false);
        showNotification('Question updated successfully.');
        fetchExamDetails();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update question.');
    } finally {
      setEditLoading(false);
    }
  };

  // Step 9: Delete Question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? Total questions will be updated automatically.')) return;
    try {
      const res = await examinationsApi.deleteExamQuestion(id, questionId);
      if (res.success) {
        showNotification('Question removed from examination.');
        fetchExamDetails();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete question.');
    }
  };

  // Step 10: Toggle Question Active / Inactive Status
  const handleToggleStatus = async (q) => {
    const nextStatus = !q.isActive;
    try {
      const res = await examinationsApi.toggleQuestionStatus(id, q._id, nextStatus);
      if (res.success) {
        showNotification(`Question marked as ${nextStatus ? 'active' : 'inactive'}.`);
        fetchExamDetails();
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle question status.');
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <Lock size={40} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Admin Privileges Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Managing question bank items requires an active administrator token.
          </p>
          <Link to="/login/admin" className="btn btn-primary">
            Sign In as Admin
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving examination question bank..." />;
  }

  const questionsList = exam?.questions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <Link
          to="/teacher/examinations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Examinations</span>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              Question Bank: {exam?.title || 'Examination'}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Course: <strong>{exam?.course?.name || 'MCA'}</strong> • Total Questions: <strong>{questionsList.length}</strong> • Total Marks: <strong>{exam?.totalMarks}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={fetchExamDetails}
              className="btn btn-secondary btn-sm"
              title="Refresh questions"
            >
              <RotateCcw size={15} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success" style={{ margin: 0 }}>
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ margin: 0 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Questions Listing */}
      {questionsList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questionsList.map((q, idx) => (
            <div
              key={q._id || idx}
              className="card"
              style={{
                borderLeft: q.isActive === false ? '4px solid var(--border)' : '4px solid var(--primary)',
                opacity: q.isActive === false ? 0.75 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="badge badge-info">Question #{idx + 1}</span>
                  <Badge variant={q.isActive === false ? 'neutral' : 'success'}>
                    {q.isActive === false ? 'Inactive' : 'Active'}
                  </Badge>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Marks: +{q.marks || 1} {q.negativeMarks > 0 && `(-${q.negativeMarks})`}
                  </span>
                  {q.topic && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                      • {q.topic}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {/* Step 10: Toggle Active / Inactive Status */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(q)}
                    className="btn btn-secondary btn-sm"
                    title={q.isActive === false ? 'Activate question (Step 10)' : 'Deactivate question (Step 10)'}
                  >
                    <Power size={13} />
                    <span>{q.isActive === false ? 'Activate' : 'Deactivate'}</span>
                  </button>

                  {/* Step 8: Edit Question */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="btn btn-secondary btn-sm"
                    title="Edit question details (Step 8)"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  {/* Step 9: Delete Question */}
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="btn btn-danger btn-sm"
                    title="Remove question from exam (Step 9)"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                {q.questionText}
              </h3>

              {/* Multiple Choice Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {q.options &&
                  q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctOptionIndex === oIdx;
                    return (
                      <div
                        key={oIdx}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-tertiary)',
                          border: isCorrect ? '1px solid var(--success)' : '1px solid var(--border-subtle)',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {isCorrect ? (
                          <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                        ) : (
                          <span style={{ width: '16px', display: 'inline-block', color: 'var(--text-muted)' }}>
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                        )}
                        <span style={{ color: isCorrect ? '#34d399' : 'var(--text-secondary)' }}>
                          {opt}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {q.explanation && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HelpCircle}
          title="No questions in this examination"
          description="Click 'Add Question' above to add questions to the question bank."
        />
      )}

      {/* ========================================================================= */}
      {/* Step 7 Modal: Add Question to Examination */}
      {/* ========================================================================= */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Question to Examination (Step 7)"
          maxWidth="640px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="btn btn-primary"
                disabled={addLoading}
              >
                {addLoading ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          }
        >
          {addError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{addError}</span>
            </div>
          )}

          <form onSubmit={handleAddQuestion}>
            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="e.g. Which runtime executes JavaScript outside the browser?"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <label className="form-label">Options (Mark radio button for correct option index) *</label>
              {[0, 1, 2, 3].map((optNum) => (
                <div key={optNum} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="radio"
                    name="newCorrectOption"
                    checked={Number(newQuestion.correctOptionIndex) === optNum}
                    onChange={() => setNewQuestion({ ...newQuestion, correctOptionIndex: optNum })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Option ${String.fromCharCode(65 + optNum)}`}
                    value={newQuestion[`option${optNum}`]}
                    onChange={(e) => setNewQuestion({ ...newQuestion, [`option${optNum}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={newQuestion.marks}
                  onChange={(e) => setNewQuestion({ ...newQuestion, marks: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Penalty</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={newQuestion.negativeMarks}
                  onChange={(e) => setNewQuestion({ ...newQuestion, negativeMarks: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Topic</label>
                <input
                  type="text"
                  className="form-input"
                  value={newQuestion.topic}
                  onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Explanation</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="Pedagogical rationale for this question..."
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Step 8 Modal: Update Question Details */}
      {/* ========================================================================= */}
      {editingQuestion && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Question Details (Step 8)"
          maxWidth="640px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateQuestion}
                className="btn btn-primary"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          }
        >
          {editError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateQuestion}>
            <div className="form-group">
              <label className="form-label">Question Text *</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={editingQuestion.questionText}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <label className="form-label">Options (Mark radio button for correct option) *</label>
              {[0, 1, 2, 3].map((optNum) => (
                <div key={optNum} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="radio"
                    name="editCorrectOption"
                    checked={Number(editingQuestion.correctOptionIndex) === optNum}
                    onChange={() => setEditingQuestion({ ...editingQuestion, correctOptionIndex: optNum })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={editingQuestion[`option${optNum}`]}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, [`option${optNum}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingQuestion.marks}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Penalty</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={editingQuestion.negativeMarks}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, negativeMarks: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingQuestion.subject}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Topic</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingQuestion.topic}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Explanation</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={editingQuestion.explanation}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
