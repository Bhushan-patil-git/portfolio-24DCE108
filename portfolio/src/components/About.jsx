function About({ description }) {
  return (
    <div className="about-section">
      <div className="section-header">
        <span className="section-tag">About Me</span>
        <h2>Machine Learning &amp; AI Focus</h2>
      </div>

      <div className="about-card">
        <div className="about-content">
          <p className="about-text">
            {description ||
              "I am a Computer Engineering student specializing in Machine Learning and Data Science. My primary passion lies in building intelligent systems, training deep learning & statistical models, extracting insights through exploratory data analysis, and bridging the gap between ML models and real-world web deployment through robust full-stack engineering."}
          </p>

          <div className="about-highlights">
            <div className="highlight-item">
              <span className="highlight-number">ML &amp; AI</span>
              <span className="highlight-label">Primary Specialization</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">Python</span>
              <span className="highlight-label">Data Science &amp; Modeling</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">MERN + APIs</span>
              <span className="highlight-label">Deployment &amp; Web Frameworks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;