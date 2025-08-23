import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Prediction(){
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    person_age: 30,
    person_income: 60000,
    person_emp_length: 2,
    loan_amnt: 15000,
    cb_person_default_on_file: "N",
    cb_person_cred_hist_length: 6,
    person_home_ownership: "RENT",
    loan_intent: "PERSONAL"
    // loan_percent_income is optional; backend computes if missing
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    const numeric = ["person_age","person_income","person_emp_length","loan_amnt","cb_person_cred_hist_length"];
    setForm(f => ({ ...f, [name]: numeric.includes(name) ? Number(value) : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try{
      const r = await fetch("http://127.0.0.1:8000/predict", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form)
      });
      const data = await r.json();
      setResult(data);
    }catch(err){
      setResult({ error:"Request failed. Check API URL/CORS." });
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop:0, marginBottom:10 }}>Credit Risk Prediction</h2>
        <p className="help" style={{ marginTop:0 }}>
          Enter applicant details. We’ll compute default probability, a fair interest rate (7–18%), and a decision.
        </p>

        <form onSubmit={submit} className="form-grid" style={{ marginTop:12 }}>
          {/* Left column */}
          <div className="form-row">
            <label className="label">Age</label>
            <input className="input" name="person_age" type="number" min="18" max="100"
                   value={form.person_age} onChange={onChange}/>
          </div>
          <div className="form-row">
            <label className="label">Annual Income (INR)</label>
            <input className="input" name="person_income" type="number" min="0"
                   value={form.person_income} onChange={onChange}/>
          </div>

          <div className="form-row">
            <label className="label">Employment Length (years)</label>
            <input className="input" name="person_emp_length" type="number" step="0.1" min="0"
                   value={form.person_emp_length} onChange={onChange}/>
          </div>
          <div className="form-row">
            <label className="label">Loan Amount (INR)</label>
            <input className="input" name="loan_amnt" type="number" min="0"
                   value={form.loan_amnt} onChange={onChange}/>
          </div>

          <div className="form-row">
            <label className="label">Credit History Length (years)</label>
            <input className="input" name="cb_person_cred_hist_length" type="number" min="0"
                   value={form.cb_person_cred_hist_length} onChange={onChange}/>
          </div>
          <div className="form-row">
            <label className="label">Previous Default on File</label>
            <select className="select" name="cb_person_default_on_file" value={form.cb_person_default_on_file} onChange={onChange}>
              <option value="N">No</option>
              <option value="Y">Yes</option>
            </select>
          </div>

          <div className="form-row">
            <label className="label">Home Ownership</label>
            <select className="select" name="person_home_ownership" value={form.person_home_ownership} onChange={onChange}>
              <option value="RENT">RENT</option>
              <option value="MORTGAGE">MORTGAGE</option>
              <option value="OWN">OWN</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div className="form-row">
            <label className="label">Loan Intent</label>
            <select className="select" name="loan_intent" value={form.loan_intent} onChange={onChange}>
              <option value="PERSONAL">PERSONAL</option>
              <option value="EDUCATION">EDUCATION</option>
              <option value="DEBTCONSOLIDATION">DEBTCONSOLIDATION</option>
              <option value="HOMEIMPROVEMENT">HOMEIMPROVEMENT</option>
              <option value="MEDICAL">MEDICAL</option>
              <option value="VENTURE">VENTURE</option>
            </select>
          </div>

          <div className="actions" style={{ gridColumn:"1 / -1" }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Scoring…" : "Predict"}
            </button>
            <button className="btn secondary" type="button" onClick={()=>setResult(null)}>
              Clear Result
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          "error" in result ? (
            <div className="result-banner result-bad">{result.error}</div>
          ) : (
            <>
              <div className="result-grid">
                <div className="kpi">
                  <div className="label">Default Probability</div>
                  <div className="value">{(result.default_probability*100).toFixed(2)}%</div>
                </div>
                <div className="kpi">
                  <div className="label">Interest Rate</div>
                  <div className="value">{result.interest_rate_percent}%</div>
                </div>
                <div className="kpi">
                  <div className="label">Decision</div>
                  <div className="value">{result.decision}</div>
                </div>
              </div>

              <motion.div
                initial={{ opacity:0, y:18 }}
                animate={{ opacity:1, y:0 }}
                transition={{ type:"spring", stiffness:140, damping:16 }}
                className={`result-banner ${result.decision === "ACCEPT" ? "result-ok" : "result-bad"}`}
              >
                {result.decision === "ACCEPT" ? "✅ Applicant Accepted" : "⚠️ Applicant Rejected"}
                <div className="help" style={{ marginTop:6 }}>
                  Threshold used: {( (result.explain && result.explain.threshold_used) ? result.explain.threshold_used*100 : 35 ).toFixed(0)}%
                </div>
              </motion.div>
            </>
          )
        )}
      </div>
    </div>
  );
}
