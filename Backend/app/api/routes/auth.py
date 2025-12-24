from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError

from app.core.security import (
    authenticate_user,
    clear_auth_cookie,
    create_access_token,
    get_current_user,
    hash_password,
    sanitize_user,
    set_auth_cookie,
)
from app.db.mongo import get_db
from app.services.users import get_user_by_email
from models import TokenResponse, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserCreate, db=Depends(get_db)):
    existing = await get_user_by_email(payload.email, db)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_doc = {
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = await db["users"].insert_one(user_doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_doc["_id"] = result.inserted_id
    token = create_access_token(str(result.inserted_id), payload.email)
    response = JSONResponse(
        {
            "access_token": token,
            "token_type": "bearer",
            "user": sanitize_user(user_doc).model_dump(),
        }
    )
    set_auth_cookie(response, token)
    return response


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db=Depends(get_db)):
    user = await authenticate_user(payload.email, payload.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(str(user["_id"]), user["email"])
    response = JSONResponse(
        {
            "access_token": token,
            "token_type": "bearer",
            "user": sanitize_user(user).model_dump(),
        }
    )
    set_auth_cookie(response, token)
    return response


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: UserPublic = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout():
    response = JSONResponse({"detail": "Logged out"})
    clear_auth_cookie(response)
    return response
