from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError
import httpx
import logging

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
from config import settings

logger = logging.getLogger(__name__)

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


@router.post("/facebook/callback", response_model=TokenResponse)
async def facebook_oauth_callback(code: str, state: str = None, db=Depends(get_db)):
    """
    Handle Facebook OAuth authorization code callback for Business Login.
    
    Facebook Login for Business uses authorization code flow (not access token from SDK).
    This endpoint exchanges the authorization code for an access token.
    """
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code is required"
        )
    
    # Verify Facebook OAuth is configured
    if not all([settings.FACEBOOK_APP_ID, settings.FACEBOOK_APP_SECRET, settings.FACEBOOK_REDIRECT_URI]):
        logger.error("Facebook OAuth is not properly configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Facebook OAuth is not configured on this server"
        )

    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Exchange authorization code for access token
            token_url = f"https://graph.facebook.com/{settings.META_API_VERSION}/oauth/access_token"
            token_params = {
                "client_id": settings.FACEBOOK_APP_ID,
                "client_secret": settings.FACEBOOK_APP_SECRET,
                "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
                "code": code,
            }
            
            logger.info(f"Exchanging authorization code for access token with redirect_uri: {settings.FACEBOOK_REDIRECT_URI}")
            
            token_response = await client.get(token_url, params=token_params)
            token_response.raise_for_status()
            token_data = token_response.json()
            
            access_token = token_data.get("access_token")
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to obtain access token from Facebook"
                )
            
            # Step 2: Get user info with business scopes (no email available in business flow)
            user_url = f"https://graph.facebook.com/{settings.META_API_VERSION}/me"
            user_params = {
                "fields": "id,name,business_management",
                "access_token": access_token
            }
            
            user_response = await client.get(user_url, params=user_params)
            user_response.raise_for_status()
            fb_data = user_response.json()
            
            facebook_id = fb_data.get("id")
            if not facebook_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to retrieve Facebook user ID"
                )
            
            # Step 3: Find or create user by Facebook ID
            # Business login doesn't provide email, so we use facebook_id as identifier
            user = await db["users"].find_one({"facebook_id": facebook_id})
            
            if user:
                # Update last login timestamp
                await db["users"].update_one(
                    {"_id": user["_id"]},
                    {"$set": {"last_login": datetime.utcnow().isoformat()}}
                )
            else:
                # Create new user for business account
                # Generate email from facebook_id if not provided
                generated_email = f"business_{facebook_id}@swalay.local"
                
                user_doc = {
                    "facebook_id": facebook_id,
                    "name": fb_data.get("name", f"Business Account {facebook_id}"),
                    "email": generated_email,
                    "login_type": "facebook_business",
                    "created_at": datetime.utcnow().isoformat(),
                    "last_login": datetime.utcnow().isoformat(),
                }
                result = await db["users"].insert_one(user_doc)
                user_doc["_id"] = result.inserted_id
                user = user_doc
            
            # Step 4: Generate and return application token
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
            
    except httpx.HTTPStatusError as e:
        logger.error(f"Facebook OAuth error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Facebook authentication failed: {e.response.text}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in Facebook OAuth callback: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during authentication"
        )
