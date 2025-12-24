from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.db.mongo import get_db
from app.sockets import get_socket_for_user, sio
from config import settings
from models import MessageRequest, UserPublic

router = APIRouter(tags=["messages"])


@router.get("/messages")
async def get_messages(
    chatId: Optional[str] = None,
    limit: int = 50,
    current_user: UserPublic = Depends(get_current_user),
    db=Depends(get_db),
):
    query = {}
    if chatId:
        query["chatId"] = chatId

    cursor = db["messages"].find(query).sort("createdAt", -1).limit(limit)
    messages = await cursor.to_list(length=limit)

    for msg in messages:
        msg["id"] = str(msg.pop("_id"))

    messages.reverse()
    return messages


@router.get("/messages/legacy")
async def get_messages_legacy(current_user: UserPublic = Depends(get_current_user)):
    from app.api.routes.webhook import RECEIVED_MESSAGES

    return RECEIVED_MESSAGES


@router.post("/send-message")
async def send_message(
    req: MessageRequest,
    current_user: UserPublic = Depends(get_current_user),
    db=Depends(get_db),
):
    if not req.phone or not req.message:
        raise HTTPException(status_code=400, detail="Phone and message are required")

    message_doc = {
        "chatId": req.phone,
        "senderId": current_user.id,
        "receiverId": req.phone,
        "direction": "outgoing",
        "text": req.message,
        "status": "sent",
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
        "whatsappMessageId": None,
    }

    url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": req.phone,
        "type": "text",
        "text": {"preview_url": False, "body": req.message},
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            whatsapp_response = response.json()

            if whatsapp_response.get("messages"):
                message_doc["whatsappMessageId"] = whatsapp_response["messages"][0].get("id")

            result = await db["messages"].insert_one(message_doc)
            message_id = str(result.inserted_id)

            response_message = {
                "id": message_id,
                "chatId": message_doc["chatId"],
                "senderId": message_doc["senderId"],
                "receiverId": message_doc["receiverId"],
                "text": message_doc["text"],
                "status": message_doc["status"],
                "createdAt": message_doc["createdAt"],
                "updatedAt": message_doc["updatedAt"],
                "whatsappMessageId": message_doc["whatsappMessageId"],
            }

            sender_socket = get_socket_for_user(current_user.id)
            if sender_socket:
                await sio.emit("new_message", response_message, to=sender_socket)
                print(f"📨 Emitted new_message to sender {current_user.id}")

            return {"success": True, "message": response_message, "whatsapp_response": whatsapp_response}
        except httpx.HTTPStatusError as e:
            print(f"Error sending message: {e.response.text}")
            message_doc["status"] = "failed"
            result = await db["messages"].insert_one(message_doc)
            message_id = str(result.inserted_id)

            response_message = {
                "id": message_id,
                "chatId": message_doc["chatId"],
                "senderId": message_doc["senderId"],
                "receiverId": message_doc["receiverId"],
                "text": message_doc["text"],
                "status": message_doc["status"],
                "createdAt": message_doc["createdAt"],
                "updatedAt": message_doc["updatedAt"],
                "whatsappMessageId": message_doc["whatsappMessageId"],
            }

            return {
                "success": False,
                "message": response_message,
                "error": "Failed to send message",
                "details": e.response.json(),
            }
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return {"success": False, "error": "Unexpected error", "details": {"message": str(e)}}
