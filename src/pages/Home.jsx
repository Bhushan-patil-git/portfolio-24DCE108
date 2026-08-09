import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";
import Footer from "../components/Footer";

function Home() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
  ];

  return (
    <>
      <Header name="Bhushan Patil" />

      <About />

      <Skills skillList={skills} />

      <Footer email="bhushan@example.com" />
    </>
  );
}

export default Home;