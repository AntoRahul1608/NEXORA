# Nexora AI — Stateful AI Agent with Dynamic UI

Nexora AI is a production-quality, stateful AI agent platform built for **HackIndia 2026**. Rather than using hardcoded React pages or pre-defined chat templates, Nexora AI utilizes LLM-driven structured JSON layouts. The AI understands natural language intent, dynamically designs its own user interface, and delivers it as an interactive, fully validated layout tree that React renders in real-time.

---

## Key Features

- 🧠 **Dynamic UI Generation**: GPT decides which components are needed based on user intent and returns standard schemas. No React code or HTML/JSX is returned.
- 🔄 **Stateful Event Loop**: Fully supports forms, validation, and multi-step dialogs. Interaction events (button clicks, form submits) are sent back to the orchestrator to continue the reasoning sequence.
- 💾 **Generic Database Schema**: 6 generic database tables in SQLite (SQLAlchemy) support arbitrary workflows (bookings, dashboards, registrations) without table-per-domain coupling.
- 💎 **Premium Aesthetic**: Responsive dark theme layout with custom scrollbars, glassmorphism cards, Framer Motion transitions, and Recharts.

---

## Technology Stack

### Backend
- **FastAPI** (Python 3.12)
- **Pydantic v2**
- **OpenAI Responses API** (Structured Outputs)
- **SQLAlchemy** (sqlite+aiosqlite)

### Frontend
- **React** (v19) + **TypeScript**
- **Vite**
- **Tailwind CSS v4** (Vite CSS Plugin)
- **Zustand** (State Management)
- **Framer Motion** (Animations)
- **Recharts** (Visualizations)
- **React Hook Form** (Form Validation)

---

## Project Structure

```
Nexora_AI/
├── backend/
│   ├── app/
│   │   ├── core/           # Settings configuration
│   │   ├── storage/        # Database models & sessions
│   │   ├── schemas/        # Dynamic UI schemas
│   │   ├── validators/     # UI validator classes
│   │   ├── prompts/        # System prompt templates
│   │   ├── services/       # OpenAI, Storage & Session Services
│   │   ├── agents/         # Orchestrator & Memory Manager
│   │   └── api/            # Chat, Session, Event controllers
│   ├── requirements.txt    # Python dependencies
│   └── main.py             # App factory entry point
└── frontend/
    ├── src/
    │   ├── api/            # API Client services
    │   ├── store/          # Zustand State store
    │   ├── types/          # Shared TypeScript interfaces
    │   ├── renderer/       # Recursive dynamic UI engine
    │   ├── components/     # 28 Premium UI components
    │   └── App.tsx         # Dashboard landing page
```

---

## Setup & Running

### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file based on `.env.example`:
   ```bash
   copy .env.example .env
   ```
3. Set your `OPENAI_API_KEY` inside `.env`.
4. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.
