# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np

# ---------- Load model ----------
model = joblib.load("credit_risk_xgb_model.pkl")

# If you trained with a pandas DataFrame, sklearn usually stores this:
# We'll use it to guarantee column order during prediction.
FEATURES = None
if hasattr(model, "feature_names_in_"):
    FEATURES = list(model.feature_names_in_)
else:
    # Fallback: if you saved a features list during training, load it here:
    # import json; FEATURES = json.load(open("feature_names.json"))
    # Otherwise we’ll infer from known engineering below.
    pass

# ---------- FastAPI app ----------
app = FastAPI(title="Credit Risk API", version="1.0.0")

# Allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Input schema ----------
class Applicant(BaseModel):
    person_age: int = Field(..., ge=18, le=100)
    person_income: int = Field(..., ge=0)
    person_emp_length: float = Field(..., ge=0)       # years
    loan_amnt: int = Field(..., ge=0)
    # Optional: if frontend doesn’t send it, we compute it below.
    loan_percent_income: float | None = None
    cb_person_default_on_file: str = Field(..., pattern="^(Y|N)$")
    cb_person_cred_hist_length: int = Field(..., ge=0)

    # Categorical
    person_home_ownership: str = Field(..., pattern="^(RENT|MORTGAGE|OWN|OTHER)$")
    loan_intent: str = Field(..., pattern="^(PERSONAL|EDUCATION|DEBTCONSOLIDATION|HOMEIMPROVEMENT|MEDICAL|VENTURE)$")

# ---------- Helper: auto assign loan grade (A..G -> 1..7) ----------
def auto_assign_grade(income, dti, cred_len, has_prev_default):
    """
    Simple rule-based simulation (transparent & explainable in demo):
    - Lower DTI (loan_percent_income) is safer
    - Higher income is safer
    - Longer credit history is safer
    - Prior default on file is riskier
    Returns numeric grade 1(A) .. 7(G)
    """
    score = 0
    # DTI
    if dti <= 0.10: score += 3
    elif dti <= 0.20: score += 2
    elif dti <= 0.35: score += 1
    else: score += 0

    # Income
    if income >= 100000: score += 3
    elif income >= 60000: score += 2
    elif income >= 30000: score += 1

    # Credit history length
    if cred_len >= 10: score += 2
    elif cred_len >= 5: score += 1

    # Previous default on file
    if has_prev_default: score -= 3

    # Map score to grade bands (tweakable)
    if score >= 7: return 1  # A
    if score >= 5: return 2  # B
    if score >= 3: return 3  # C
    if score >= 2: return 4  # D
    if score >= 1: return 5  # E
    if score >= 0: return 6  # F
    return 7                 # G

# ---------- Helper: preprocessing exactly like training ----------
HOME_CATS = ["RENT", "MORTGAGE", "OWN", "OTHER"]
LOAN_INTENT_CATS = ["PERSONAL", "EDUCATION", "DEBTCONSOLIDATION", "HOMEIMPROVEMENT", "MEDICAL", "VENTURE"]

def preprocess(app: Applicant) -> pd.DataFrame:
    d = app.dict()

    # Compute DTI if not provided
    if d.get("loan_percent_income") is None or pd.isna(d["loan_percent_income"]):
        d["loan_percent_income"] = (d["loan_amnt"] / d["person_income"]) if d["person_income"] > 0 else 0.0

    # Binary map for default flag
    d["cb_person_default_on_file"] = 1 if d["cb_person_default_on_file"] == "Y" else 0

    # Auto loan grade numeric (A..G -> 1..7)
    has_prev_default = (d["cb_person_default_on_file"] == 1)
    d["loan_grade"] = auto_assign_grade(
        income=d["person_income"],
        dti=d["loan_percent_income"],
        cred_len=d["cb_person_cred_hist_length"],
        has_prev_default=has_prev_default
    )

    # Base numeric columns
    row = {
        "person_age": d["person_age"],
        "person_income": d["person_income"],
        "person_emp_length": d["person_emp_length"],
        "loan_amnt": d["loan_amnt"],
        "loan_percent_income": d["loan_percent_income"],
        "cb_person_default_on_file": d["cb_person_default_on_file"],
        "cb_person_cred_hist_length": d["cb_person_cred_hist_length"],
        "loan_grade": d["loan_grade"],
    }

    # One-hot: person_home_ownership -> home_*
    for cat in HOME_CATS:
        row[f"home_{cat}"] = 1 if d["person_home_ownership"] == cat else 0

    # One-hot: loan_intent -> loan_*
    for cat in LOAN_INTENT_CATS:
        row[f"loan_{cat}"] = 1 if d["loan_intent"] == cat else 0

    df = pd.DataFrame([row])

    # Ensure column order matches training
    if FEATURES is not None:
        # add missing columns as 0
        for c in FEATURES:
            if c not in df.columns:
                df[c] = 0
        # drop any extras
        df = df[FEATURES]
    else:
        # If FEATURES is unknown, at least keep a stable order:
        # (This should match your training df column order after encoding.)
        # If you saved features during training, prefer loading that.
        df = df.reindex(sorted(df.columns), axis=1).fillna(0)

    return df

# ---------- Risk-based pricing ----------
def map_interest_rate(p_default: float) -> float:
    # Linear pricing 7% .. 18%
    r = 7.0 + (18.0 - 7.0) * float(p_default)
    return float(np.clip(r, 7.0, 18.0))

# ---------- Decision policy (for demo) ----------
# You can tune this threshold to maximize F1 or business profit.
ACCEPT_THRESHOLD = 0.35  # accept if prob default < 35%

@app.get("/")
def root():
    return {"status": "ok", "message": "Credit Risk API running"}

@app.post("/predict")
def predict(applicant: Applicant):
    X = preprocess(applicant)
    p_default = float(model.predict_proba(X)[:, 1][0])
    interest_rate = map_interest_rate(p_default)
    decision = "ACCEPT" if p_default < ACCEPT_THRESHOLD else "REJECT"

    return {
        "default_probability": round(p_default, 4),
        "interest_rate_percent": round(interest_rate, 2),
        "decision": decision,
        "explain": {
            "threshold_used": ACCEPT_THRESHOLD,
            "note": "Interest rate mapped linearly from predicted default probability (7%–18%)."
        }
    }
