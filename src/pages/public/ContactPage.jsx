import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email format';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim() || formData.message.length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Note: Backend has no dedicated POST /contact endpoint.
    // In accordance with instructions, we do not call fabricated URLs.
    // Instead we construct a safe mailto link and provide clear user feedback.
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      const mailtoLink = `mailto:info@sarateducation.com?subject=${encodeURIComponent(
        `[Sarat Education Inquiry] ${formData.subject}`
      )}&body=${encodeURIComponent(
        `From: ${formData.name} (${formData.email})\n\n${formData.message}`
      )}`;
      // Open default email client safely
      window.location.href = mailtoLink;
    }, 600);
  };

  return (
    <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem) 0 clamp(3rem, 6vw, 5rem) 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto clamp(2rem, 4vw, 3.5rem) auto' }}>
          <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
            Academic Support
          </span>
          <h1 style={{ marginBottom: '1.25rem', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
            Contact & Academic Helpdesk
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: '1.7' }}>
            Have questions regarding examination schedules, registration ID recovery, or course material access? Reach out to the examination and technical administration.
          </p>
        </div>

        <div className="contact-grid">
          {/* Left Column: Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: 'clamp(1.25rem, 3.5vw, 2rem)' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Support Channels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(61, 110, 78, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      Admissions & Academic Helpline
                    </h4>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      <a href="tel:+919861223439" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        +91 98612 23439
                      </a>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Direct phone assistance for student admissions & exams
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(112, 92, 48, 0.15)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      Official Email
                    </h4>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      <a href="mailto:info@sarateducation.com" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        info@sarateducation.com
                      </a>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Inquiries routed to Academic Department
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      Helpdesk Hours
                    </h4>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Monday – Friday: 09:00 – 17:00 IST</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Excludes Gazetted Examination Holidays
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      Academic Campus
                    </h4>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Sarat Education Campus, Academic Control Block</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Department of Computer Applications
                    </p>
                  </div>
                </div>
              </div>
            </div>

           
          </div>

          {/* Right Column: Contact Form */}
          <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Send an Inquiry</h3>

            {submittedSuccess && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Inquiry pre-formatted successfully!</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                    Your default email application has been launched with your inquiry pre-filled to <code>info@sarateducation.com</code>.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">
                  Inquiry Subject <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Examination Schedule Inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
                {errors.subject && <span className="form-error">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  Message <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  className="form-textarea"
                  placeholder="Please describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message to Support</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
