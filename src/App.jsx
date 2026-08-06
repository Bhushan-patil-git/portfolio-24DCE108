import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

function App() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
  ];

  return (
    <div>
      <Header name="Bhushan Patil" />

      <About />

      <Skills skillList={skills} />

      <Footer email="bhushan.mahendra.patil@gmail.com" />
    </div>
  );
}

export default App;