from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.db.mongo import get_db
from app.core.security import get_current_user
from models import UserPublic

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileResponse(BaseModel):
    id: str
    email: str
    created_at: str
    whatsapp_connected: bool
    whatsapp_phone_number_id: Optional[str] = None
    whatsapp_waba_id: Optional[str] = None


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: UserPublic = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get user profile with WhatsApp integration status"""
    
    # Check if user has WhatsApp credentials
    whatsapp_creds = await db["whatsapp_credentials"].find_one(
        {"user_id": current_user.id}
    )
    
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        created_at=current_user.created_at,
        whatsapp_connected=whatsapp_creds is not None,
        whatsapp_phone_number_id=whatsapp_creds.get("phone_number_id") if whatsapp_creds else None,
        whatsapp_waba_id=whatsapp_creds.get("waba_id") if whatsapp_creds else None
    )


@router.delete("/whatsapp")
async def disconnect_whatsapp(
    current_user: UserPublic = Depends(get_current_user),
    db=Depends(get_db)
):
    """Disconnect WhatsApp integration"""
    
    result = await db["whatsapp_credentials"].delete_one(
        {"user_id": current_user.id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No WhatsApp connection found"
        )
    
    return {"message": "WhatsApp disconnected successfully"}
