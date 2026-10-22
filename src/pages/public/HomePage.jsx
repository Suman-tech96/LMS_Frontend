import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  School,
  Lock,
  Layers,
  GraduationCap,
  Sparkles,
  KeyRound,
  FileCheck2,
  FolderLock,
  ShieldAlert,
  HelpCircle,
  Timer,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { coursesApi } from '../../api/coursesApi';
import campusStudyImg from '../../assets/campus_study.jpg';
import campusTechImg from '../../assets/campus_tech.jpg';

export const HomePage = () => {
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch real courses directly from DB — NO dummy data
  useEffect(() => {
    let isMounted = true;
    const fetchDbCourses = async () => {
      try {
        const res = await coursesApi.getAllCourses({ limit: 6, status: 'active' });
        const list = res.data?.courses || res.data || [];
        if (isMounted) {
          if (Array.isArray(list)) {
            // Display only what the admin actually added in DB, up to 6
            setCourses(list.slice(0, 6));
          } else {
            setCourses([]);
          }
        }
      } catch (err) {
        console.error('Failed to load courses from database:', err.message);
        if (isMounted) {
          setCourses([]);
        }
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    };

    fetchDbCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2.5rem, 6vw, 5rem)', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(2.5rem, 6vw, 4.5rem) 0 clamp(2.25rem, 5vw, 4rem) 0',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Subtle ambient light glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '850px',
            height: '420px',
            background: 'radial-gradient(circle, rgba(216, 240, 222, 0.5) 0%, rgba(248, 224, 168, 0.2) 50%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '920px' }}>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            Empowering Academic Excellence with{' '}
            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>
              Structured
            </span>{' '}
            Digital Learning
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
              maxWidth: '740px',
              margin: '0 auto clamp(1.5rem, 4vw, 2.5rem) auto',
            }}
          >
            Sarat Education provides a centralized academic gateway for students and faculty. Access accredited curricula, download verified study notes, sit for server-timed proctored examinations, and view official semester scorecards.
          </p>

          {/* Hero CTAs */}
          <div className="hero-cta-buttons">
            {isAuthenticated ? (
              <>
                <Link
                  to={role === 'admin' ? '/teacher/dashboard' : '/student/dashboard'}
                  className="btn btn-primary btn-lg"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
                <a href="#courses" className="btn btn-secondary btn-lg">
                  <BookOpen size={18} />
                  <span>Explore Academic Programs</span>
                </a>
              </>
            ) : (
              <>
                <Link to="/login/student" className="btn btn-primary btn-lg">
                  <span>Student Login</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register/student" className="btn btn-secondary btn-lg">
                  <span>Register Account</span>
                </Link>
                <a href="#courses" className="btn btn-outline btn-lg">
                  <span>Explore Courses</span>
                </a>
              </>
            )}
          </div>

          {/* Authentic Academic Highlights Grid (No awkward big beige wrapper) */}
          <div className="academic-highlights-grid">
            <div
              className="card-hover"
              style={{
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e7e2d8',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <School size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Degree Programs
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                Accredited curricula in MCA, MBA & BCA with semester-based modules.
              </div>
            </div>

            <div
              className="card-hover"
              style={{
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e7e2d8',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Verified Courseware
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                Curated lecture notes, syllabus PDFs, and reference materials.
              </div>
            </div>

            <div
              className="card-hover"
              style={{
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e7e2d8',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#f8e0a8',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Timer size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Proctored Exams
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                Scheduled online testing with server-synchronized timers.
              </div>
            </div>

            <div
              className="card-hover"
              style={{
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e7e2d8',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-container)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={20} />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Official Results
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                Published scorecards, marks breakdown, and university grade sheets.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="container">
        <div style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.85rem',
            }}
          >
            Core Infrastructure
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', marginBottom: '0.75rem' }}>
            Verified Academic Pillars
          </h2>
          <p style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
            Built around the verified backend API services supporting comprehensive course delivery and automated examination evaluation.
          </p>
        </div>

        <div className="grid grid-cols-3">
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--primary-container)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={24} />
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Courseware</span>
              </div>
              <h3 style={{ marginBottom: '0.85rem', fontSize: '1.35rem' }}>Curated Study Materials</h3>
              <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                Download and preview verified lecture notes, syllabi, and technical documentation uploaded by authorized academic departments.
              </p>
            </div>
            <div style={{ paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '1.75rem' }}>
              <Link to={isAuthenticated ? '/student/materials' : '/login/student'} className="footer-link" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>
                <span>Preview documents</span>
                <ArrowRight size={15} />
              </Link>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF • Cloud Docs</span>
            </div>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    backgroundColor: '#f8e0a8',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={24} />
                </div>
                <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Server Timed</span>
              </div>
              <h3 style={{ marginBottom: '0.85rem', fontSize: '1.35rem' }}>Online Examination Engine</h3>
              <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                Engage with scheduled multiple-choice examinations featuring server-side countdown timers, question palettes, and auto-save capabilities.
              </p>
            </div>
            <div style={{ paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '1.75rem' }}>
              <Link to={isAuthenticated ? '/student/examinations' : '/login/student'} className="footer-link" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>
                <span>Exam guidelines</span>
                <ArrowRight size={15} />
              </Link>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-Sync Enabled</span>
            </div>
          </div>

          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--primary-container)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={24} />
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Authenticated</span>
              </div>
              <h3 style={{ marginBottom: '0.85rem', fontSize: '1.35rem' }}>Official Published Results</h3>
              <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                View authenticated scores, marks breakdown, percentage, and passing status published officially by the administration.
              </p>
            </div>
            <div style={{ paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '1.75rem' }}>
              <Link to={isAuthenticated ? '/student/results' : '/login/student'} className="footer-link" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>
                <span>Check results ledger</span>
                <ArrowRight size={15} />
              </Link>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digital Grade Sheet</span>
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMIC PROGRAMS & DISCIPLINES SECTION (Up to 6 courses directly from admin DB) */}
      <section className="container" id="courses" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.65rem',
              }}
            >
              <Layers size={14} />
              Academic Curriculum Directory
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', marginBottom: '0.5rem' }}>
              Academic Programs & Disciplines
            </h2>
            <p style={{ maxWidth: '640px', lineHeight: '1.7' }}>
              Official degree programs managed by the academic administration. Student login is required to access complete course modules, downloadable study vaults, and proctored examinations.
            </p>
          </div>

          {!isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="mobile-w-full">
              <Link to="/login/student" className="btn btn-secondary btn-sm" style={{ flex: '1 1 auto' }}>
                <span>Student Login to Unlock</span>
              </Link>
              <Link to="/register/student" className="btn btn-primary btn-sm" style={{ flex: '1 1 auto' }}>
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {loadingCourses ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid #e7e2d8' }}>
            <div className="spinner" style={{ margin: '0 auto 1.25rem auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading verified academic programs from database...</p>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid #e7e2d8' }}>
            <GraduationCap size={44} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Active Courses Currently Listed</h3>
            <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
              The administration is updating the academic course schedule. Please log in to check your personal enrolled status.
            </p>
            <Link to="/login/student" className="btn btn-primary">
              <span>Go to Student Login</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3" style={{ gap: '1.75rem' }}>
            {courses.slice(0, 6).map((course) => (
              <div
                key={course._id || course.code}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #e7e2d8',
                  padding: 'clamp(1.25rem, 3.5vw, 2rem)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top aesthetic accent line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <span
                      style={{
                        padding: '0.4rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-container)',
                        color: 'var(--on-primary-container)',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {course.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#f0ece4',
                        color: 'var(--accent)',
                        border: '1px solid #e4dfd4',
                      }}
                    >
                      {course.category || 'Academic Program'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.35rem',
                      marginBottom: '0.75rem',
                      lineHeight: '1.3',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    {course.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.925rem',
                      lineHeight: '1.65',
                      color: 'var(--text-secondary)',
                      marginBottom: '1.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description || 'Comprehensive curriculum with proctored examinations and structured digital courseware.'}
                  </p>

                  {/* Active Batches */}
                  {course.batches && course.batches.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Active Academic Batches:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {course.batches.map((batch, bIdx) => (
                          <span
                            key={bIdx}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: '#f5f1ea',
                              color: 'var(--text-secondary)',
                              fontWeight: 600,
                              border: '1px solid #e7e2d8',
                            }}
                          >
                            {batch}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Program stats indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#faf6f0',
                      border: '1px solid #ebe5da',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} color="var(--primary)" />
                      <span>{course.studyMaterials?.length || 0} Study Docs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={14} color="var(--accent)" />
                      <span>{course.examinations?.length || 0} Proctored Exams</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Section with "Login Needed to Explore More" */}
                <div style={{ borderTop: '1px solid #eee9e0', paddingTop: '1.25rem' }}>
                  {isAuthenticated ? (
                    <Link
                      to="/student/courses"
                      className="btn btn-outline"
                      style={{ width: '100%', justifyContent: 'space-between', padding: '0.75rem 1.25rem' }}
                    >
                      <span>Access Enrolled Syllabus</span>
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          fontSize: '0.775rem',
                          color: '#705c30',
                          fontWeight: 600,
                          backgroundColor: '#fbf5e8',
                          padding: '0.55rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid #f2e2be',
                        }}
                      >
                        <Lock size={14} color="#b45309" />
                        <span>Login required to view syllabus & materials</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <Link
                          to="/login/student"
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, padding: '0.55rem 0.85rem' }}
                        >
                          <span>Student Login</span>
                        </Link>
                        <Link
                          to="/register/student"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, padding: '0.55rem 0.85rem' }}
                        >
                          <span>Register</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DEDICATED INSTITUTIONAL SECURITY & LOGIN NEED SECTION */}
      <section className="container">
        <div
          className="section-card-responsive"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e7e2d8',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#fbf5e8',
                color: 'var(--accent)',
                fontSize: '0.775rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.85rem',
                border: '1px solid #f2e2be',
              }}
            >
              <KeyRound size={14} />
              Portal Access Protocols
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', marginBottom: '0.85rem' }}>
              Why Student Authentication is Required
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              Sarat Education enforces authenticated role validation to safeguard institutional course assets, prevent examination tampering, and maintain certified academic records.
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '2rem', marginBottom: '3rem' }}>
            {/* Card 1 */}
            <div
              className="card-hover"
              style={{
                backgroundColor: '#faf6f0',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e9e4da',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-container)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <FolderLock size={24} />
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>
                  Intellectual Course Vault
                </h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  Complete module syllabi, downloadable lecture slides (PPT), and textbook PDF archives are intellectual assets reserved exclusively for enrolled students in verified academic batches.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5ded3', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                ✓ Authorized Batch Lock
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="card-hover"
              style={{
                backgroundColor: '#faf6f0',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e9e4da',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#f8e0a8',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <ShieldAlert size={24} />
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>
                  Proctored Single-Session Exams
                </h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  All scheduled evaluations run under server-synchronized countdown timers. Real-time answer auto-saving and multi-tab prevention require verified single-session tokens.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5ded3', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                ✓ Server Clock Synchronization
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="card-hover"
              style={{
                backgroundColor: '#faf6f0',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e9e4da',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-container)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <FileCheck2 size={24} />
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>
                  Certified Transcripts & Records
                </h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  Official score breakdowns, percentage calculations, passing status, and permanent mark sheets are securely tied to each scholar’s unique institutional ID.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5ded3', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                ✓ Verifiable Grade Ledger
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#f5f1ea',
              border: '1px solid #e6e0d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Ready to Access Your Enrolled Course Ledger?
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Registered students may log in using their student registration ID or email address.
              </div>
            </div>

            <div className="mobile-btn-stack">
              {isAuthenticated ? (
                <Link to="/student/dashboard" className="btn btn-primary">
                  <span>Open Student Portal</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/login/student" className="btn btn-primary">
                    <span>Student Login to Unlock</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/register/student" className="btn btn-secondary">
                    <span>Register Account</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* 4-Step Learning Journey (from Stitch) */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.85rem',
            }}
          >
            Workflow Architecture
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', marginBottom: '0.75rem' }}>
            The Student Learning Journey
          </h2>
          <p style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
            Follow these verified milestones from student registration to published certification.
          </p>
        </div>

        <div className="grid grid-cols-4">
          <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <span style={{ fontSize: '3.75rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#ece7de', position: 'absolute', top: '-10px', right: '12px', pointerEvents: 'none', userSelect: 'none' }}>
              01
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 6px rgba(61, 110, 78, 0.3)',
              }}
            >
              01
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.15rem' }}>Registration</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.65', color: 'var(--text-secondary)' }}>
              Sign up with your academic email to receive your unique system-generated student registration ID.
            </p>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 600 }}>
              Unique Token Issued
            </div>
          </div>

          <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <span style={{ fontSize: '3.75rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#ece7de', position: 'absolute', top: '-10px', right: '12px', pointerEvents: 'none', userSelect: 'none' }}>
              02
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 6px rgba(112, 92, 48, 0.3)',
              }}
            >
              02
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.15rem' }}>Study Material</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.65', color: 'var(--text-secondary)' }}>
              Access course notes, technical references, and cloud-stored PDF guides for your batch.
            </p>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.775rem', color: 'var(--accent)', fontWeight: 600 }}>
              Verified Syllabi
            </div>
          </div>

          <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <span style={{ fontSize: '3.75rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#ece7de', position: 'absolute', top: '-10px', right: '12px', pointerEvents: 'none', userSelect: 'none' }}>
              03
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 6px rgba(61, 110, 78, 0.3)',
              }}
            >
              03
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.15rem' }}>Examinations</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.65', color: 'var(--text-secondary)' }}>
              Review exam instructions and take multiple-choice evaluations within your scheduled exam window.
            </p>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 600 }}>
              Synchronized Clock
            </div>
          </div>

          <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <span style={{ fontSize: '3.75rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#ece7de', position: 'absolute', top: '-10px', right: '12px', pointerEvents: 'none', userSelect: 'none' }}>
              04
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 6px rgba(112, 92, 48, 0.3)',
              }}
            >
              04
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.15rem' }}>Official Results</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.65', color: 'var(--text-secondary)' }}>
              Receive published grading, percentage, and detailed score breakdown evaluated by the server.
            </p>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.775rem', color: 'var(--accent)', fontWeight: 600 }}>
              Digitally Verified
            </div>
          </div>
        </div>
      </section>

      {/* Visual Highlight Strip: Academic Resources (from Stitch) */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '3.5rem', alignItems: 'center' }} className="grid-responsive-2">
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--primary)',
                marginBottom: '0.5rem',
                display: 'block',
              }}
            >
              Connected Learning
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', marginBottom: '1rem', lineHeight: '1.25' }}>
              Integrated Campus Academic Architecture
            </h2>
            <p style={{ lineHeight: '1.75', marginBottom: '2rem', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
              Students experience seamless transitions between study modules and proctored testing sessions, guaranteed by real-time database locks and state synchronization.
            </p>
            <div className="stat-fact-grid">
              <div className="card-hover" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid #e7e2d8', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
                  Syllabus Synchronization
                </div>
              </div>
              <div className="card-hover" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid #e7e2d8', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                  Zero
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
                  Manual Evaluation Bias
                </div>
              </div>
            </div>
          </div>

          {/* Campus Photography from Stitch */}
          <div className="campus-images-grid">
            <div
              className="card-hover"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                height: '280px',
                border: '1px solid #e7e2d8',
              }}
            >
              <img
                src={campusStudyImg}
                alt="Sarat Education campus study lounge"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div
              className="card-hover campus-img-offset"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                height: '280px',
                marginTop: '1.75rem',
                border: '1px solid #e7e2d8',
              }}
            >
              <img
                src={campusTechImg}
                alt="Sarat Education digital learning desk"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner (Forest Emerald Box from Stitch) */}
      <section className="container">
        <div
          className="section-card-responsive"
          style={{
            backgroundColor: 'var(--primary)',
            textAlign: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient circle glow */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              left: '-60px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              backgroundColor: 'rgba(216, 240, 222, 0.22)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <Lock size={22} />
            </div>

            <h2 style={{ color: '#ffffff', fontSize: 'clamp(1.6rem, 4.5vw, 2.5rem)', fontFamily: 'var(--font-serif)', marginBottom: '1.15rem', lineHeight: '1.2' }}>
              Ready to Begin Your Academic Session?
            </h2>

            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 auto 2.25rem auto', fontSize: '1.05rem', lineHeight: '1.75' }}>
              Log in with your student registration ID or email address to access your assigned course materials and exams.
            </p>

            <div className="mobile-btn-stack" style={{ justifyContent: 'center' }}>
              {isAuthenticated ? (
                <Link
                  to={role === 'admin' ? '/teacher/dashboard' : '/student/dashboard'}
                  className="btn btn-lg"
                  style={{ backgroundColor: '#ffffff', color: 'var(--primary)', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)' }}
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login/student"
                    className="btn btn-lg"
                    style={{ backgroundColor: '#ffffff', color: 'var(--primary)', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)' }}
                  >
                    <span>Student Portal Login</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/register/student"
                    className="btn btn-lg"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.35)' }}
                  >
                    <span>Register Account</span>
                  </Link>
                </>
              )}
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.825rem', marginTop: '1.75rem' }}>
              Forgot student credentials? Contact your academic administrator or the Examination Control Room at +91 98612 23439.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
