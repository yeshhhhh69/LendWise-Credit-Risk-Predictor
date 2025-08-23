import React from "react";

export default function About(){
  return (
    <div className="container">
      <div className="card" style={{ textAlign:"center" }}>
        <h2 style={{ marginTop:0 }}>About LendWise</h2>
        <p className="help" style={{ maxWidth:720, margin:"10px auto 0" }}>
          LendWise is a credit risk platform built for Aignite hackathon, BMSCE submission.
          It uses an XGBoost model (trained on ~32k rows) served via FastAPI to
          estimate default probability, assign a fair interest rate (7–18%), and produce a decision under a configurable threshold.
        </p>
        <p className="help" style={{ maxWidth:720, margin:"10px auto 0" }}>
          note: This model was built on a limited dataset and made for a hackathon is not to be used for real credit risk predictions.
        </p>
        <p style={{ marginTop:16, color:"#374151" }}>
          Team: <strong>[Yeshved Salelkar, Apurva Jaiswal]</strong> • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
