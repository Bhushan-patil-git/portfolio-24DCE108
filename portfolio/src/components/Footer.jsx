function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Bhushan Patil</h3>
          <p>Machine Learning &amp; AI Enthusiast | Full-Stack Web Development</p>
        </div>

        <div className="footer-meta">
          <p className="footer-course">CHARUSAT &bull; ITUE301 Advanced Web Development Frameworks</p>
          <p className="footer-copy">&copy; {new Date().getFullYear()} Bhushan Patil. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;