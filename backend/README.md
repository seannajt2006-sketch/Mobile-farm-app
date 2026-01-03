# Farm Connect Backend (FastAPI)

FastAPI + PostgreSQL + SQLAlchemy/SQLModel. Stores Cloudinary image URLs.

## Setup
1. Create virtual env and install: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
2. Run dev server: `uvicorn app.main:app --reload`.
3. Configure environment via `.env` (see app/core/config.py for defaults).

## Project layout
- app/main.py — FastAPI app + router includes
- app/api/v1/routers/ — versioned endpoints
- app/models/ — ORM models
- app/schemas/ — Pydantic schemas
- app/services/ — business logic (e.g., uploads)
- app/db/ — database session and init
- tests/ — API tests

## Next steps
- Add database connection URL in `.env`.
- Flesh out models/schemas and routers for users, products, orders, uploads.
- Add Alembic migrations in alembic/.
