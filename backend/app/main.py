from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import routers
from app.db.session import init_db

app = FastAPI(title="Farm Connect API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/", tags=["root"])
async def root():
    return {"message": "Farm Connect API"}
