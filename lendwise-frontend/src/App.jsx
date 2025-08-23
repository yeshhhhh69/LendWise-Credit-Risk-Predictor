import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import About from "./pages/About";
import logo from "./assets/LendWise.png";
import "./App.css";

// Small wrapper to animate page transitions
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/prediction" element={<PageWrapper><Prediction /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="brand">
          <img src={logo} alt="LendWise" />
          {/*<span className="brand-name">LendWise</span>*/}
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/prediction" className="nav-link">Prediction</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
      </nav>

      {/* Animated pages */}
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
