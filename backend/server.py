from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Tile Match API")
api_router = APIRouter(prefix="/api")


# ============ MODELS ============
class UpgradeRegister(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    email: EmailStr
    device_id: str = Field(min_length=1, max_length=100)


class UpgradeUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: EmailStr
    device_id: str
    created_at: str


class ScoreSubmit(BaseModel):
    device_id: str
    name: Optional[str] = "Player"
    theme: str
    difficulty: str  # easy | medium | hard
    mode: str  # levels | free
    level: Optional[int] = None
    time_seconds: int = Field(ge=0)
    moves: int = Field(ge=0)
    stars: int = Field(ge=0, le=3)


class ScoreOut(BaseModel):
    id: str
    device_id: str
    name: str
    theme: str
    difficulty: str
    mode: str
    level: Optional[int]
    time_seconds: int
    moves: int
    stars: int
    created_at: str


# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "Tile Match API"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.post("/upgrade/register", response_model=UpgradeUser)
async def upgrade_register(payload: UpgradeRegister):
    email = payload.email.lower()
    existing = await db.upgrade_users.find_one({"email": email})
    if existing:
        await db.upgrade_users.update_one(
            {"email": email},
            {"$set": {"name": payload.name, "device_id": payload.device_id}},
        )
        existing["name"] = payload.name
        existing["device_id"] = payload.device_id
        return UpgradeUser(**existing)

    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": email,
        "device_id": payload.device_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.upgrade_users.insert_one(doc)
    doc.pop("_id", None)
    return UpgradeUser(**doc)


@api_router.get("/upgrade/{device_id}")
async def get_upgrade(device_id: str):
    user = await db.upgrade_users.find_one({"device_id": device_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Not upgraded")
    return user


@api_router.post("/scores/submit", response_model=ScoreOut)
async def submit_score(payload: ScoreSubmit):
    # only accept scores from upgraded users for cloud leaderboard
    upgraded = await db.upgrade_users.find_one({"device_id": payload.device_id})
    if not upgraded:
        raise HTTPException(status_code=403, detail="Upgrade required for cloud leaderboard")

    doc = {
        "id": str(uuid.uuid4()),
        "device_id": payload.device_id,
        "name": upgraded.get("name", payload.name or "Player"),
        "theme": payload.theme,
        "difficulty": payload.difficulty,
        "mode": payload.mode,
        "level": payload.level,
        "time_seconds": payload.time_seconds,
        "moves": payload.moves,
        "stars": payload.stars,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.scores.insert_one(doc)
    doc.pop("_id", None)
    return ScoreOut(**doc)


@api_router.get("/scores/leaderboard")
async def leaderboard(theme: str, difficulty: str, limit: int = 20):
    cursor = db.scores.find(
        {"theme": theme, "difficulty": difficulty, "mode": "free"},
        {"_id": 0},
    ).sort([("time_seconds", 1), ("moves", 1)]).limit(limit)
    return await cursor.to_list(limit)


@api_router.get("/scores/user/{device_id}")
async def user_scores(device_id: str):
    cursor = db.scores.find({"device_id": device_id}, {"_id": 0}).sort("created_at", -1).limit(50)
    return await cursor.to_list(50)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.upgrade_users.create_index("email", unique=True)
    await db.upgrade_users.create_index("device_id")
    await db.scores.create_index([("theme", 1), ("difficulty", 1), ("time_seconds", 1)])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
