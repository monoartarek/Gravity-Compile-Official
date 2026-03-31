import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Import your pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import Tech from "./pages/Tech";
import Projects from "./pages/Projects";
import Process from "./pages/Process";
import Team from "./pages/Team";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "68px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/tech" element={<Tech />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/process" element={<Process />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </>
  );
}