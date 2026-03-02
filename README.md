# Linear Algebra Playground

A monorepo for learning linear algebra with interactive tools. Algorithms will be added chapter-by-chapter later.

## Structure

- **frontend/** — React + TypeScript + Vite + Tailwind + shadcn/ui
- **backend/** — Python FastAPI (all algorithms/logic live here)

## Running the app

### Backend

```bash
cd backend
pip install -r requirements.txt
# or: pip install -e .
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`. Try:
- `GET /health`
- `GET /api/chapters`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` (or the port Vite shows).

### Environment

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_API_BASE_URL` (e.g. `http://localhost:8000` for local dev).

If the backend is down, the frontend falls back to local chapter config.

## Development

- **Frontend**: `npm run build` / `npm run lint` in `frontend/`
- **Backend**: Optional ruff/black for lint/format
