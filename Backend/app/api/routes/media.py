import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.security import get_current_user
from config import settings
from models import UserPublic

router = APIRouter(tags=["media"])


@router.post("/media/upload/start")
async def start_upload(
    file_length: int,
    file_type: str,
    current_user: UserPublic = Depends(get_current_user),
):
    url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{settings.WHATSAPP_APP_ID}/uploads"
    params = {"file_length": file_length, "file_type": file_type, "access_token": settings.WHATSAPP_ACCESS_TOKEN}

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, params=params)
            if resp.status_code != 200:
                print(f"Upload start failed: {resp.text}")
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=resp.json().get("error", {}).get("message", "Upload start failed"),
                )
            return resp.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Connection error: {str(exc)}")


@router.post("/media/upload/finish")
async def finish_upload(
    session_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: UserPublic = Depends(get_current_user),
):
    url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{session_id}"
    headers = {"Authorization": f"OAuth {settings.WHATSAPP_ACCESS_TOKEN}", "file_offset": "0"}

    try:
        content = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(exc)}")

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, headers=headers, content=content)
            if resp.status_code != 200:
                print(f"Upload finish failed: {resp.text}")
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=resp.json().get("error", {}).get("message", "Upload finish failed"),
                )
            return resp.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Connection error: {str(exc)}")


@router.post("/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: UserPublic = Depends(get_current_user),
):
    """
    Upload media to WhatsApp API for use in templates.
    Returns the media ID.
    """
    url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{settings.WHATSAPP_PHONE_NUMBER_ID}/media"
    headers = {"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"}
    
    # Determine content type
    content_type = file.content_type or "application/octet-stream"
    
    try:
        file_content = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(exc)}")

    files = {
        "file": (file.filename, file_content, content_type),
        "messaging_product": (None, "whatsapp"),
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, headers=headers, files=files)
            if resp.status_code not in (200, 201):
                print(f"Media upload failed: {resp.text}")
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=resp.json().get("error", {}).get("message", "Media upload failed"),
                )
            return resp.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Connection error: {str(exc)}")
