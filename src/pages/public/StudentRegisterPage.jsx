import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { coursesApi } from '../../api/coursesApi';
import { UserPlus, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const StudentRegisterPage = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // No hardcoded defaults - all values start empty until explicitly chosen by the user or loaded from DB
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    course: '',
    batch: '',
    studentId: '',
  });

  // Dynamic courses list loaded strictly from database
  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  // Fetch courses dynamically from backend database
  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await coursesApi.getAllCourses({ status: 'active' });
        if (isMounted && res.success) {
          const list = res.data?.courses || (Array.isArray(res.data) ? res.data : []);
          setCoursesList(list);

          // If URL parameter ?course= exists and matches a course from DB, select it
          const queryCourseId = searchParams.get('course');
          if (queryCourseId) {
            const matched = list.find((c) => c._id === queryCourseId);
            if (matched) {
              setFormData((prev) => ({
                ...prev,
                course: matched._id,
                batch: '',
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Could not load courses from database:', err.message);
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    };
    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Derived selected course document from DB
  const selectedCourseDoc = coursesList.find((c) => c._id === formData.course);
  const availableBatches = selectedCourseDoc?.batches || [];

  const handleCourseChange = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      course: courseId,
      batch: '', // Reset batch so user explicitly picks from the selected course's DB batches
    }));
    if (errors.course) {
      setErrors((prev) => ({ ...prev, course: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Valid email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Invalid email format';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!formData.course) {
      errs.course = 'Please select a degree course';
    }
    if (!formData.batch.trim()) {
      errs.batch = 'Academic batch is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        course: formData.course,
        batch: formData.batch.trim(),
      };
      if (formData.studentId.trim()) {
        payload.studentId = formData.studentId.trim().toUpperCase();
      }

      const res = await registerStudent(payload);
      setRegistrationResult(res.data);
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationResult) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.25rem',
        }}
      >
        <div className="card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Registration Successful!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Your student account is now active. Please save your assigned Student Registration ID below:
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '2px dashed var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              OFFICIAL STUDENT REGISTRATION ID
            </span>
            <div
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'var(--primary-light)',
                fontFamily: 'monospace',
              }}
            >
              {registrationResult.studentId || registrationResult.student?.studentId}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Course: {registrationResult.student?.course?.name || selectedCourseDoc?.name} ({registrationResult.student?.batch || formData.batch})
            </div>
          </div>

          <button
            onClick={() => navigate('/student/dashboard', { replace: true })}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            <span>Proceed to Student Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.25rem',
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div className="card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 14px var(--primary-glow)',
              }}
            >
              <UserPlus size={26} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Student Registration</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Enroll in academic courses and obtain your examination ID
            </p>
          </div>

          {serverError && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Academic Email Address <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Phone Number (Optional)
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-grid-2">
              {/* Degree Course: Loaded 100% from DB, empty by default */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-course">
                  Degree Course <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="reg-course"
                  className="form-select"
                  value={formData.course}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  required
                >
                  <option value="">
                    {loadingCourses ? '-- Loading courses from database... --' : '-- Select Degree Course --'}
                  </option>
                  {coursesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
                </select>
                {errors.course && <span className="form-error">{errors.course}</span>}
              </div>

              {/* Batch: Loaded from selected course's DB batches, empty by default */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-batch">
                  Batch <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                {!formData.course ? (
                  <select id="reg-batch" className="form-select" disabled value="">
                    <option value="">-- Select Course First --</option>
                  </select>
                ) : availableBatches.length > 0 ? (
                  <select
                    id="reg-batch"
                    className="form-select"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {availableBatches.map((b, idx) => (
                      <option key={idx} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="reg-batch"
                    type="text"
                    className="form-input"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="Enter academic batch"
                    required
                  />
                )}
                {errors.batch && <span className="form-error">{errors.batch}</span>}
              </div>
            </div>
           

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Registering Account on Server...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Complete Student Registration</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login/student" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
