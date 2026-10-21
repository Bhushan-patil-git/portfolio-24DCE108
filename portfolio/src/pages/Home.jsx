import { Link } from "react-router-dom";
import About from "../components/About";
import Skills from "../components/Skills";

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="pulse-dot"></span>
          <span>Machine Learning Enthusiast &bull; Computer Engineering</span>
        </div>

        <h1 className="hero-title">
          Hi, I&apos;m <span className="gradient-text">Bhushan Patil</span>
        </h1>
        <p className="hero-subtitle">
          Aspiring <strong>Machine Learning Engineer &amp; Data Scientist</strong> dedicated to training predictive models, analyzing complex datasets, and building full-stack web applications to deploy AI solutions.
        </p>

        <div className="hero-actions">
          <Link to="/projects" className="btn btn-hero-primary">
            🚀 Full-Stack ML Integration App
          </Link>
          <Link to="/contact" className="btn btn-hero-secondary">
            💬 Connect &amp; Collaborate
          </Link>
        </div>

        <div className="hero-stats-row">
          <div className="stat-card">
            <span className="stat-icon">🧠</span>
            <span className="stat-title">Machine Learning</span>
            <span className="stat-desc">Model Training, Classification &amp; Neural Nets</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <span className="stat-title">Data Science</span>
            <span className="stat-desc">EDA, Feature Engineering &amp; Analytics</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🌐</span>
            <span className="stat-title">ML Web Deployment</span>
            <span className="stat-desc">MERN &amp; RESTful APIs for Model Serving</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <About />

      {/* Skills Section */}
      <Skills />
    </div>
  );
}

export default Home;