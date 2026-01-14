from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import httpx
from app.db.mongo import get_db
from app.core.security import get_current_user
from models import UserPublic, WhatsAppCredential
from config import settings
from datetime import datetime

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

import logging

# Configure logger
logger = logging.getLogger(__name__)

class WhatsAppSignupRequest(BaseModel):
    code: str
    waba_id: str
    phone_number_id: str
    flow_id: str | None = None
    user_id: str | None = None # Added for manual override

@router.post("/whatsapp/signup")
async def whatsapp_signup(
    payload: WhatsAppSignupRequest,
    db=Depends(get_db)
):
    flow_id = payload.flow_id or "unknown"
    # Fallback to "admin" if no user_id provided (since auth was removed per request)
    user_id = payload.user_id or "admin" 
    
    logger.info(
        "Received WhatsApp signup request", 
        extra={"flow_id": flow_id, "user_id": user_id, "waba_id": payload.waba_id}
    )

    async with httpx.AsyncClient() as client:
        # 1. Exchange code for access token
        token_url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/oauth/access_token"
        token_params = {
            "client_id": settings.WHATSAPP_APP_ID,
            "client_secret": settings.WHATSAPP_APP_SECRET,
            "code": payload.code
        }
        
        try:
            logger.debug("Exchanging code for token", extra={"flow_id": flow_id})
            token_res = await client.get(token_url, params=token_params)
            token_res.raise_for_status()
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            logger.info("Token exchange successful", extra={"flow_id": flow_id})
        except httpx.HTTPStatusError as e:
            logger.error(f"Token exchange failed: {e.response.text}", extra={"flow_id": flow_id})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Failed to exchange token: {e.response.text}"
            )

        waba_id = payload.waba_id
        phone_number_id = payload.phone_number_id

        # 2. Register phone number - REMOVED
        logger.info("Skipping explicit PIN registration (handled by Embedded Signup)", extra={"flow_id": flow_id})

        # 3. Subscribe to webhooks
        subscribe_url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{waba_id}/subscribed_apps"
        sub_headers = {"Authorization": f"Bearer {access_token}"}
        
        try:
            sub_res = await client.post(subscribe_url, headers=sub_headers)
            if sub_res.status_code != 200:
                logger.warning(f"Webhook subscription returned non-200: {sub_res.text}", extra={"flow_id": flow_id})
            else:
                logger.info("Webhook subscription successful", extra={"flow_id": flow_id})
        except Exception as e:
            logger.error(f"Webhook subscription error: {e}", extra={"flow_id": flow_id}, exc_info=True)

        # 4. Save credentials
        try:
            credential = WhatsAppCredential(
                user_id=user_id,
                waba_id=waba_id,
                phone_number_id=phone_number_id,
                access_token=access_token,
                created_at=datetime.utcnow()
            )
            
            await db["whatsapp_credentials"].update_one(
                {"user_id": user_id},
                {"$set": credential.model_dump()},
                upsert=True
            )
            logger.info("Credentials saved to database", extra={"flow_id": flow_id, "user_id": user_id})
        except Exception as e:
            logger.error(f"Database save error: {e}", extra={"flow_id": flow_id}, exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to save credentials")
        
        return {
            "status": "success", 
            "waba_id": waba_id, 
            "phone_number_id": phone_number_id,
            "flow_id": flow_id
        }

@router.get("/whatsapp/status")
async def get_whatsapp_status(
    user_id: str = "admin", # Default default to admin
    db=Depends(get_db)
):
    """
    Check if the current user has a connected WhatsApp account.
    This is used as a fallback by the frontend if the embedded signup postMessage is missed.
    NO AUTH REQUIRED per request.
    """
    credential = await db["whatsapp_credentials"].find_one({"user_id": user_id})
    
    if credential:
        return {
            "connected": True,
            "waba_id": credential.get("waba_id"),
            "phone_number_id": credential.get("phone_number_id"),
            "connected_at": credential.get("created_at")
        }
    
    return {
        "connected": False,
        "waba_id": None, 
        "phone_number_id": None
    }
