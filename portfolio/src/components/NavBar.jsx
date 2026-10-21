import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function NavBar() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-dot"></span>
          <span className="brand-text">Bhushan Patil</span>
          <span className="brand-badge">ML &bull; AI</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/projects" className={`nav-link ${location.pathname === "/projects" ? "active" : ""}`}>
            WDF App
          </Link>
          <Link to="/contact" className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}>
            Contact
          </Link>
        </div>

        <div className="nav-actions">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle-btn"
            title="Toggle theme"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;