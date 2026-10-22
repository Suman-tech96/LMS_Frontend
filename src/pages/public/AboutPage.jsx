import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Target,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Server,
  Layers,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2.5rem, 5vw, 4rem)', padding: 'clamp(2rem, 4vw, 3rem) 0 clamp(3rem, 6vw, 5rem) 0' }}>
      {/* Header */}
      <section className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
          About Sarat Education
        </span>
        <h1 style={{ marginBottom: '1.25rem', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          A Structured Architecture for Modern Higher Education
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: '1.7' }}>
          Sarat Education is a modern academic platform designed to streamline course material distribution, secure examinations, and automated academic result verification.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="container">
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          <div className="card card-hover" style={{ padding: 'clamp(1.25rem, 3.5vw, 2.5rem)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--primary-container)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Target size={24} />
            </div>
            <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>Our Mission</h3>
            <p style={{ lineHeight: '1.75' }}>
              To provide students and academic departments with a dependable, real-time platform that eliminates administrative friction, protects evaluation integrity, and makes educational resources instantly accessible.
            </p>
          </div>

          <div className="card card-hover" style={{ padding: 'clamp(1.25rem, 3.5vw, 2.5rem)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#f8e0a8',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Compass size={24} />
            </div>
            <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>Our Vision</h3>
            <p style={{ lineHeight: '1.75' }}>
              To build a seamless academic ecosystem where course administration, student progress tracking, and examination evaluation operate transparently through verified software services.
            </p>
          </div>
        </div>
      </section>

      {/* Educational Objectives */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: 'clamp(1.75rem, 4vw, 3rem)' }}>
          <h2 style={{ marginBottom: '0.75rem', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Key Educational Objectives</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
            Every component in our system maps directly to verifiable academic workflows.
          </p>
        </div>

        <div className="grid grid-cols-3">
          <div className="card card-hover" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              1. Centralized Course Materials
            </h4>
            <p style={{ fontSize: '0.925rem', lineHeight: '1.7' }}>
              Ensure every student has immediate access to approved syllabi, lectures, and technical references assigned specifically to their course and batch.
            </p>
          </div>

          <div className="card card-hover" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              2. Synchronized Examination Integrity
            </h4>
            <p style={{ fontSize: '0.925rem', lineHeight: '1.7' }}>
              Eliminate timing ambiguities with server-authoritative countdowns, per-question answer saving, and automated timeout submissions.
            </p>
          </div>

          <div className="card card-hover" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              3. Objective Evaluation & Transcripts
            </h4>
            <p style={{ fontSize: '0.925rem', lineHeight: '1.7' }}>
              Provide accurate marks calculations based on negative marking rules and passing criteria, followed by administrative publication.
            </p>
          </div>
        </div>
      </section>

      {/* Verified System Architecture */}
      <section className="container">
        <div
          className="card card-hover"
          style={{
            backgroundColor: '#ffffff',
            padding: 'clamp(1.25rem, 3.5vw, 2.5rem)',
            border: '1px solid #e7e2d8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Server size={24} color="var(--primary)" />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>System Verification & Security Principles</h3>
          </div>
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>
            Our frontend interfaces communicate directly with the operational Express/Node.js API gateway. We maintain a zero-fabrication standard:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem' }}>Zero mock data in production pathways</span>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem' }}>JWT Bearer token verification on all protected endpoints</span>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem' }}>Server-enforced attempt limits and negative scoring</span>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.875rem' }}>Clear role distinction (Student vs Administrator)</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Have questions about our academic portal?</h3>
        <p style={{ marginBottom: '1.75rem' }}>
          Our administrative support team is available to assist with student enrollment and credential verification.
        </p>
        <Link to="/contact" className="btn btn-primary">
          <span>Contact Academic Support</span>
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};
