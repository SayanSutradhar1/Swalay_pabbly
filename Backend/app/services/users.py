async def get_user_by_email(email: str, db):
    return await db["users"].find_one({"email": email})
