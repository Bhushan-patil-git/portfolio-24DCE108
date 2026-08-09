import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";

function App() {
  const [theme, setTheme] = useState("light-mode");

  const toggleTheme = () => {
    setTheme((current) => (current === "light-mode" ? "dark-mode" : "light-mode"));
  };

  return (
    <div className={theme}>
      <button type="button" onClick={toggleTheme} style={{ marginBottom: 16 }}>
        {theme === "light-mode" ? "Switch to dark mode" : "Switch to light mode"}
      </button>

      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;