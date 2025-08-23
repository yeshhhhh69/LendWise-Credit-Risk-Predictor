=============================
 LENDWISE BACKEND - README.md
==============================

# LendWise Backend (FastAPI + XGBoost)

LendWise is an AI-powered **Credit Risk Prediction API**.  
It takes applicant information (age, income, employment length, loan details, credit history) and returns:

- Default probability
- Fair interest rate (7%–18%)
- Accept / Reject decision (threshold-based)


## Tech Stack
- Python 3.10+
- FastAPI (REST API framework)
- XGBoost (trained ML model)
- Joblib (model serialization)
- Uvicorn (server)


## Setup & Run Locally
Clone the repo and install requirements:
pip install -r requirements.txt


## Deployment
Run the API:
uvicorn main:app --reload

Visit API docs:
- Swagger UI → http://127.0.0.1:8000/docs


- Recommended: Render / Railway / Heroku
- Start command:  
uvicorn main:app --host 0.0.0.0 --port 10000


==============================
 LENDWISE FRONTEND - README.md
==============================

# LendWise Frontend (React)

LendWise is a **credit risk prediction web app**.  
It connects to the FastAPI backend and provides:

- Clean UI with Home / Prediction / About pages
- Input form for applicant details
- Animated results (default probability, interest rate, decision)
- Minimalist, professional design


## Tech Stack
- React (CRA)
- Framer Motion (animations)
- Vanilla CSS (custom styling)
- Fetch API (calls backend)


## Setup & Run Locally
Clone the repo and install:
npm install
npm start

Runs on → http://localhost:3000


## Deployment
- Recommended: Vercel (1-click from GitHub)
- Build command:
npm run build

- Output directory:
build


Make sure to update API endpoint in `src/pages/Prediction.js`:
```js
fetch("https://<your-backend-url>/predict", { ... })


👨‍💻 Team
Built for Hackathon 🚀

Team: [Yeshved Salelkar, Apurva Jaiswal]