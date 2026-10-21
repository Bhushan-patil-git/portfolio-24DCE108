import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

// Practical 8: Route-based Code Splitting using React.lazy()
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Fallback UI component shown while dynamic chunk is loading
function RouteLoadingFallback() {
  return (
    <div className="route-fallback-container">
      <div className="spinner"></div>
      <p className="route-fallback-text">Loading page chunk...</p>
    </div>
  );
}

function App() {
  return (
    <div className="app-layout">
      <NavBar />
      <main className="main-content">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;