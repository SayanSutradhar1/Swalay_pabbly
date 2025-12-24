from datetime import datetime

from fastapi import APIRouter, Depends, Request
from fastapi.responses import PlainTextResponse

from app.db.mongo import get_db
from app.sockets import get_socket_for_user, sio
from config import settings

router = APIRouter(tags=["webhook"])

RECEIVED_MESSAGES = []


@router.get("/webhook")
async def verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == settings.VERIFY_TOKEN:
        return PlainTextResponse(challenge, status_code=200)
    return PlainTextResponse("Error, wrong token", status_code=403)


@router.post("/webhook")
async def webhook_received(request: Request, db=Depends(get_db)):
    try:
        data = await request.json()
        print("RAW DATA =", data)

        if data.get("entry"):
            for entry in data["entry"]:
                for change in entry.get("changes", []):
                    value = change.get("value", {})

                    if value.get("messages"):
                        for msg in value["messages"]:
                            message_data = {
                                "type": "message",
                                "direction": "incoming",
                                "from": msg.get("from"),
                                "id": msg.get("id"),
                                "timestamp": msg.get("timestamp"),
                                "text": msg.get("text", {}).get("body"),
                                "msg_type": msg.get("type"),
                                "raw": msg,
                            }
                            if value.get("contacts"):
                                message_data["contact"] = value["contacts"][0]

                            RECEIVED_MESSAGES.append(message_data)

                            incoming_msg_doc = {
                                "chatId": msg.get("from"),
                                "senderId": msg.get("from"),
                                "receiverId": settings.WHATSAPP_PHONE_NUMBER_ID,
                                "direction": "incoming",
                                "text": msg.get("text", {}).get("body", ""),
                                "status": "delivered",
                                "createdAt": datetime.utcnow().isoformat(),
                                "updatedAt": datetime.utcnow().isoformat(),
                                "whatsappMessageId": msg.get("id"),
                            }
                            await db["messages"].insert_one(incoming_msg_doc)
                            incoming_msg_doc["id"] = str(incoming_msg_doc.pop("_id"))

                            await sio.emit("new_message", incoming_msg_doc)
                            print("📨 Emitted incoming message to all users")

                    if value.get("statuses"):
                        for status_update in value["statuses"]:
                            status_data = {
                                "type": "status",
                                "id": status_update.get("id"),
                                "status": status_update.get("status"),
                                "timestamp": status_update.get("timestamp"),
                                "recipient_id": status_update.get("recipient_id"),
                                "raw": status_update,
                            }
                            RECEIVED_MESSAGES.append(status_data)

                            whatsapp_msg_id = status_update.get("id")
                            new_status = status_update.get("status")

                            if whatsapp_msg_id and new_status:
                                result = await db["messages"].find_one_and_update(
                                    {"whatsappMessageId": whatsapp_msg_id},
                                    {
                                        "$set": {
                                            "status": new_status,
                                            "updatedAt": datetime.utcnow().isoformat(),
                                        }
                                    },
                                    return_document=True,
                                )

                                if result:
                                    sender_id = result.get("senderId")
                                    sender_socket = get_socket_for_user(sender_id)

                                    status_event = {
                                        "messageId": str(result["_id"]),
                                        "whatsappMessageId": whatsapp_msg_id,
                                        "status": new_status,
                                        "timestamp": status_update.get("timestamp"),
                                    }

                                    if sender_socket:
                                        await sio.emit("message_status_update", status_event, to=sender_socket)
                                        print(f"✅ Emitted status update to user {sender_id}: {new_status}")
                                    else:
                                        print(f"⚠️ User {sender_id} not connected, DB updated with status: {new_status}")

                    if len(RECEIVED_MESSAGES) > 100:
                        RECEIVED_MESSAGES.pop(0)

    except Exception as exc:  # pragma: no cover - safety net logging
        print(f"⚠️ Error processing webhook: {exc}")
        import traceback

        traceback.print_exc()

    return {"status": "ok"}
