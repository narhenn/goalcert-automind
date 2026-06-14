# AUTOMIND

AI Agent Platform - Create, configure, and deploy AI agents with a visual workflow builder.

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose

### Setup

1. Start databases:
```bash
docker compose up -d
```

2. Backend:
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Run migrations
alembic upgrade head
# Start server
uvicorn app.main:app --reload --port 8000
```

3. Frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Open http://localhost:5173

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Flow
- **Backend**: FastAPI + SQLAlchemy 2.0 + Celery
- **Database**: PostgreSQL 16 + Redis 7
- **AI**: Claude API (Anthropic)
