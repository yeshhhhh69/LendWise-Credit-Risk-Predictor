import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/LendWise.png";

export default function Home(){
  return (
    <div className="container">
      <section className="hero">
        <img src={logo} alt="LendWise" />
        <h1>Smarter Lending. Clearer Risk.</h1>
        <p>
          LendWise turns applicant information into a probabilistic default score,
          assigns a fair interest rate (7–18%), and provides an accept/reject decision —
          fast, explainable, and consistent.
        </p>
        <Link to="/prediction" className="cta">Try Prediction</Link>
      </section>
    </div>
  );
}
