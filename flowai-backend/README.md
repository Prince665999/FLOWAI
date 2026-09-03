# FLOWAI Backend

This is the FastAPI backend foundation for the FLOWAI platform.

## Quick start

1. Create a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
4. Start the app:
   ```bash
   uvicorn app.main:app --reload
   ```

## Default endpoints

- `/` - app metadata
- `/health` - health check

## Stack

- FastAPI
- PostgreSQL (production)
- SQLite (local development/tests)
- Redis + Celery
- ChromaDB
