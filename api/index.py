"""Vercel serverless entry point — wraps the FastAPI app."""

import os
import sys

# Add backend to Python path so `from app.xxx` imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app  # noqa: E402, F401
