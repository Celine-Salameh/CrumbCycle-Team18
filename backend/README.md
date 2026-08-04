# CrumbCycle FastAPI Backend

Epic 2 backend foundation with FastAPI, SQLAlchemy, PostgreSQL, Alembic migrations, JWT authentication, middleware, environment settings, request validation, and reusable CRUD utilities.

## Python

Python 3.14.0 is already installed on this machine, satisfying the Python 3.11+ requirement.

## Setup

```powershell
cd backend
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `.env` with your PostgreSQL credentials.

## Database

```powershell
alembic upgrade head
```

## Run

```powershell
uvicorn app.main:app --reload --port 8000
```

- Health: http://localhost:8000/api/health
- Docs: http://localhost:8000/docs

## Epic 2 Coverage

- 2.1 FastAPI project initialized with routers, services, models, schemas, and app structure.
- 2.2 SQLAlchemy PostgreSQL connection and Alembic migration setup.
- 2.3 JWT register, login, logout, refresh, and bcrypt password hashing.
- 2.4 CORS, centralized error handling, request validation, environment variables.
- 2.5 Generic reusable CRUD base utilities.
