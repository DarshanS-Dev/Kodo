# Kōdo — The AI Coding Mentor That Remembers You

Most AI tutors forget you the moment you close the tab. Kōdo doesn't.
Kōdo is an AI-powered coding mentor with persistent memory — it remembers your learning patterns, your weak spots, and the explanations that actually clicked for you, then uses that to become a fundamentally different tutor the longer you use it.

## Live Demo
- Website: [coming soon]
- Demo Video: [coming soon]

## Features

- **Comeback Brief** — Every session opens with a personalized summary of where you left off
- **Adaptive Explanations** — Kōdo remembers which analogies worked for you and uses them again
- **Pattern Interrupts** — Kōdo detects recurring behavioral patterns and calls them out before you repeat them
- **Built-in Code Editor** — Monaco Editor (same as VS Code) with syntax highlighting and code execution via Piston API
- **Problem Recommendation** — Kōdo suggests problems based on your weak areas and tracks what you've already solved
- **Weekly Insight Card** — Behavioral analysis of your learning patterns, not just topics covered

## How Hindsight is Used

Kōdo uses all three Hindsight API calls meaningfully:

- **`retain()`** — Called after every chat message and problem attempt. Stores behavioral inferences — not just what was said, but what it reveals about how the user thinks and learns.
- **`recall()`** — Called before every response to fetch relevant memory context. When a user is solving a problem, recall fetches their history with that specific problem type.
- **`reflect()`** — Called for the Comeback Brief, Pattern Interrupts, problem recommendations, and the Weekly Insight Card. This is where Hindsight reasons over the full observation history to generate non-obvious insights about the user.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Code Editor | Monaco Editor |
| Code Execution | Piston API |
| Backend | FastAPI |
| Memory | Hindsight Cloud |
| LLM | Groq (llama-3.3-70b-versatile) |

## Setup — Run Locally

### Backend
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `Backend/` folder:
```
HINDSIGHT_API_KEY=your_key_here
HINDSIGHT_BASE_URL=your_instance_url_here
GROQ_API_KEY=your_key_here
```

Run the server:
```bash
uvicorn main:app --reload
```

### Frontend
```bash
npm install
npm run dev
```

Update `BASE_URL` in `src/app/workspace/page.tsx` to point to your backend URL.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/session/start` | Generate Comeback Brief for returning user |
| POST | `/chat` | Main conversation loop with memory |
| POST | `/problem/submit` | Submit code attempt, retain behavioral analysis |
| GET | `/problem/list` | Fetch all problems for sidebar |
| GET | `/problem/{id}` | Fetch single problem |
| GET | `/insight/weekly` | Generate weekly behavioral insight |

## Team

- Darshan — Backend, Hindsight integration
- Arjun — Frontend, UI/UX

## Built With

- [Hindsight](https://github.com/vectorize-io/hindsight) — Agent memory system
- [Hindsight Docs](https://hindsight.vectorize.io/) — Documentation
- [Groq](https://groq.com) — LLM inference
- [Piston API](https://github.com/engineer-man/piston) — Code execution