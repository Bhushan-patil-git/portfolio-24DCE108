import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="contact-page-container">
      <section className="contact-section">
        <div className="section-header">
          <span className="section-tag">Get in Touch</span>
          <h2>Contact Me</h2>
          <p className="section-desc">Have a question or want to collaborate on a project? Feel free to reach out!</p>
        </div>

        {submitted ? (
          <div className="contact-success-card">
            <span className="success-icon">✅</span>
            <h3>Message Sent Successfully!</h3>
            <p>Thank you, <strong>{formData.name}</strong>. I will get back to you at <strong>{formData.email}</strong> soon.</p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", subject: "", message: "" });
              }}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="contact-layout">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Project Collaboration / Question"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="message">Message *</label>
                  <span className="char-count">{formData.message.length} characters</span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  required
                  className="form-control textarea"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  📨 Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="btn-secondary"
                >
                  {showHelp ? "Hide Helper" : "💡 Help Guide"}
                </button>
              </div>

              {showHelp && (
                <div className="help-box">
                  <p><strong>Pro-Tip:</strong> State management is fully reactive using React&apos;s <code>useState</code> hook. Your inputs are captured and validated in real time.</p>
                </div>
              )}
            </form>

            <div className="contact-info-panel">
              <div className="info-card">
                <span className="info-icon">📍</span>
                <div>
                  <h4>Location</h4>
                  <p>Gujarat, India</p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon">🎓</span>
                <div>
                  <h4>Education</h4>
                  <p>B.Tech Computer Engineering (5th Sem)</p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon">⚡</span>
                <div>
                  <h4>Course Focus</h4>
                  <p>Advanced Web Development Frameworks (ITUE301)</p>
                </div>
              </div>

              {formData.message && (
                <div className="live-preview-card">
                  <span className="preview-tag">Live Preview</span>
                  <p className="preview-text">&ldquo;{formData.message}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Contact;