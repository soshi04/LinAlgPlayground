from fastapi import FastAPI

from app.api.router import api_router
from app.core.cors import setup_cors

app = FastAPI(title="Linear Algebra Playground API", version="0.1.0")

setup_cors(app)
app.include_router(api_router)
