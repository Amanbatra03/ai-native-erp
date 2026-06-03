# AI-Native ERP System

> A full-stack, AI-powered Enterprise Resource Planning system with Natural Language Query, Gemini-driven lead scoring, and autonomous automation agents.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![LangChain](https://img.shields.io/badge/LangChain-0.2-blueviolet)
![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-orange?logo=google)
![SQLite](https://img.shields.io/badge/SQLite-3-lightblue?logo=sqlite)

---

## Overview

This project is a production-grade ERP system that replaces traditional dashboards with an AI-first interface. Instead of navigating menus, users query the system in plain English — and an AI agent translates those queries into SQL, executes them, and returns business insights in real time.

Built across **4 business modules** — CRM, HR, Finance, and Supply Chain — with a dedicated **Marketing module** powered by Gemini-based lead scoring.

---

## AI Features

| Feature | Technology | Description |
|---|---|---|
| **Natural Language Query (NLQ)** | LangChain + Gemini 2.0 Flash | Ask questions like *"Show me all deals over $50K closed this quarter"* — the AI writes and runs the SQL |
| **AI Lead Scoring** | Gemini 2.0 Flash | Automatically scores marketing leads (0–100) and assigns Hot / Warm / Cold priority |
| **Business Insights** | Gemini 2.0 Flash | Generates a real-time 1–2 sentence business insight from live dashboard KPIs |
| **Automated Leave Approval** | Rule-based AI Agent | Autonomously approves leave requests ≤ 3 days without human intervention |
| **Predictive Restock** | Inventory Intelligence | Detects items below reorder level and auto-generates replenishment orders |
| **AI Chat Assistant** | Gemini NLQ Agent | Dedicated chat interface for querying the entire ERP database conversationally |

---

## Tech Stack

**Backend**
- **FastAPI** — REST API framework
- **SQLAlchemy** — ORM with SQLite persistence
- **LangChain** — AI agent orchestration for SQL generation
- **Google Gemini 2.0 Flash** — LLM for NLQ, scoring, and insights
- **Pydantic** — Data validation and serialization

**Frontend**
- **React 18** + **TypeScript** — Component-based UI
- **Vite** — Build tooling
- **Tailwind CSS** — Utility-first styling
- **React Router** — Client-side navigation

---

## Modules

### CRM
- Companies, Contacts, Deals management
- Pipeline tracking with deal value and status

### HR
- Employee directory with salary and department data
- Leave request management with AI auto-approval
- Monthly payroll aggregation

### Finance
- Transaction ledger (Income / Expense categorization)
- Net income calculation across entities

### Supply Chain
- Inventory tracking with SKU-level granularity
- Supplier management
- Low-stock alerts and autonomous restock execution

### Marketing & AI
- Campaign management
- AI-scored lead pipeline (Hot / Warm / Cold)
- Batch lead qualification with Gemini scoring

---

## Architecture

```
ai-erp/
├── backend/
│   ├── main.py          # FastAPI app, all REST endpoints
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── database.py      # DB connection and session management
│   ├── ai_utils.py      # LangChain NLQ agent + Gemini integrations
│   └── seed_v3.py       # Database seeder with realistic sample data
└── frontend/
    └── src/
        ├── pages/       # React pages per module
        ├── App.tsx      # Router + Sidebar layout
        └── api.ts       # Axios API client
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Google Gemini API key (free tier works)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Create .env file
echo GOOGLE_API_KEY=your_key_here > .env
echo DATABASE_URL=sqlite:///./sql_app.db >> .env

# Seed the database
python seed_v3.py

# Start the server
uvicorn main:app --reload
# API docs available at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## Key API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/nlq/` | POST | Natural language query against the full database |
| `/dashboard/stats` | GET | Aggregated KPIs across all modules |
| `/dashboard/insight` | GET | Gemini-generated business insight |
| `/automate/qualify-leads` | POST | AI batch-scores all new leads |
| `/automate/approve-leave/` | POST | AI agent auto-approves eligible leave requests |
| `/automate/predict-restock/` | POST | Identifies and suggests inventory replenishment |
| `/automate/execute-restock` | POST | Autonomously executes restock orders |

---

## Example: Natural Language Query

**Request:**
```json
POST /nlq/
{ "query": "How many employees are in the Engineering department?" }
```

**Response:**
```json
{
  "query": "How many employees are in the Engineering department?",
  "response": "There are 8 employees in the Engineering department."
}
```

The AI agent automatically generates the SQL query, executes it against the live database, and returns a human-readable answer.

---

## Skills Demonstrated

- **Agentic AI** — LangChain SQL agent with tool-calling pattern
- **LLM Integration** — Gemini 2.0 Flash for NLQ, scoring, and insight generation
- **Full-Stack Development** — FastAPI REST backend + React TypeScript frontend
- **Database Design** — Relational schema across 12 interconnected entities
- **REST API Design** — Clean endpoint structure with Pydantic validation

---

## 🚀 Live Demo

🌐 **App:** https://ai-native-erp-frontend.onrender.com  
📡 **API:** https://ai-native-erp-backend.onrender.com/docs

> ⚡ Backend on Render free tier — allow 30s on first load if inactive.

![AI ERP Dashboard](./screenshots/dashboard.png)
