import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
)

# User socket mapping: userId -> socketId
user_sockets = {}


def create_socket_app(app):
    return socketio.ASGIApp(sio, app)


def register_user_socket(user_id: str, sid: str):
    user_sockets[user_id] = sid


def remove_user_by_sid(sid: str):
    user_id_to_remove = None
    for user_id, socket_id in user_sockets.items():
        if socket_id == sid:
            user_id_to_remove = user_id
            break
    if user_id_to_remove:
        del user_sockets[user_id_to_remove]
    return user_id_to_remove


def get_socket_for_user(user_id: str):
    return user_sockets.get(user_id)


@sio.event
async def connect(sid, environ):
    print(f"🔌 Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")
    user_id = remove_user_by_sid(sid)
    if user_id:
        print(f"👤 Removed user {user_id} from socket mapping")


@sio.event
async def register(sid, data):
    user_id = data.get("userId") if data else None
    if user_id:
        register_user_socket(user_id, sid)
        print(f"✅ Registered user {user_id} with socket {sid}")
        await sio.emit("registered", {"userId": user_id}, to=sid)
    else:
        print("⚠️ Registration failed: no userId provided")
