from fastapi import HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient

from config import settings


async def connect_to_mongo(app):
    app.state.mongo_client = AsyncIOMotorClient(settings.MONGODB_URI)
    app.state.db = app.state.mongo_client[settings.MONGODB_DB_NAME]


async def close_mongo(app):
    mongo_client = getattr(app.state, "mongo_client", None)
    if mongo_client:
        mongo_client.close()


async def get_db(request: Request):
    db = getattr(request.app.state, "db", None)
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return db
