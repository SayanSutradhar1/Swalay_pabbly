import asyncio
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.services.templates import send_template_message
from models import BroadcastRequest, TemplateRequest, UserPublic

router = APIRouter(tags=["broadcasts"])

RATE_LIMIT_PER_SECOND = 1
BROADCASTS = []


@router.post("/broadcasts")
async def create_broadcast(req: BroadcastRequest, current_user: UserPublic = Depends(get_current_user)):
    if not req.phones or not req.template_name:
        raise HTTPException(status_code=400, detail="Phones and template_name are required")

    broadcast_id = str(uuid4())
    broadcast = {
        "id": broadcast_id,
        "name": req.name,
        "template_name": req.template_name,
        "template_id": req.template_id,
        "language_code": req.language_code,
        "created_at": datetime.utcnow().isoformat(),
        "recipients": [{"phone": phone, "status": "pending", "details": None} for phone in req.phones],
    }

    BROADCASTS.append(broadcast)

    for recipient in broadcast["recipients"]:
        try:
            template_req = TemplateRequest(
                phone=recipient["phone"],
                template_name=req.template_name,
                template_id=req.template_id,
                language_code=req.language_code,
                body_parameters=req.body_parameters,
                header_parameters=req.header_parameters,
                header_type=req.header_type,
            )

            res = await send_template_message(template_req)

            if isinstance(res, dict) and res.get("success"):
                recipient["status"] = "sent"
                recipient["details"] = res.get("whatsapp_response")
            else:
                recipient["status"] = "failed"
                recipient["details"] = res.get("details") if isinstance(res, dict) else {"error": "Unknown error"}
        except Exception as exc:
            print(f"Unexpected error sending to {recipient['phone']}: {str(exc)}")
            recipient["status"] = "failed"
            recipient["details"] = {"error": str(exc)}

        await asyncio.sleep(1.0 / RATE_LIMIT_PER_SECOND)

    sent = sum(1 for r in broadcast["recipients"] if r["status"] == "sent")
    failed = sum(1 for r in broadcast["recipients"] if r["status"] == "failed")

    return {"id": broadcast_id, "total": len(broadcast["recipients"]), "sent": sent, "failed": failed, "broadcast": broadcast}


@router.get("/broadcasts")
async def list_broadcasts(current_user: UserPublic = Depends(get_current_user)):
    summaries = []
    for broadcast in BROADCASTS:
        sent = sum(1 for r in broadcast["recipients"] if r["status"] == "sent")
        failed = sum(1 for r in broadcast["recipients"] if r["status"] == "failed")
        pending = sum(1 for r in broadcast["recipients"] if r["status"] == "pending")
        summaries.append(
            {
                "id": broadcast["id"],
                "name": broadcast["name"],
                "template_name": broadcast.get("template_name"),
                "total": len(broadcast["recipients"]),
                "sent": sent,
                "failed": failed,
                "pending": pending,
                "status": "completed" if pending == 0 else "in-progress",
                "created_at": broadcast.get("created_at"),
            }
        )
    return summaries


@router.get("/broadcasts/{broadcast_id}")
async def get_broadcast(broadcast_id: str, current_user: UserPublic = Depends(get_current_user)):
    for broadcast in BROADCASTS:
        if broadcast["id"] == broadcast_id:
            return broadcast
    raise HTTPException(status_code=404, detail="Broadcast not found")
