from flask import Flask, jsonify, request
from chat.chat import chat as chat_handler
from login.login import login as login_handler
from login.login import users
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
CORS(app)  # <--- esto habilita CORS para todos los dominios
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "http://localhost:5173/chat"])
connected_clients = {}


def get_private_room(user_a, user_b):
    return "private:" + "_".join(sorted([user_a, user_b]))


def mark_message_as_delivered(receiver_id, sender_id, message_text):
    for u in users:
        if u["id"] != receiver_id:
            continue
        for msg in u["mensajes"]:
            if msg.get("from") == sender_id and msg.get("message") == message_text and not msg.get("delivered", False):
                msg["delivered"] = True
                return


def deliver_pending_messages(client_id):
    for u in users:
        if u["id"] != client_id:
            continue
        for msg in u["mensajes"]:
            if "from" in msg and not msg.get("delivered", False):
                emit(
                    "receive_message",
                    {
                        "sender": msg["from"],
                        "receiver": client_id,
                        "message": msg["message"]
                    },
                    room=client_id
                )
                msg["delivered"] = True
        return


def get_conversation_for_user(client_id, peer_id):
    for u in users:
        if u["id"] != client_id:
            continue

        conversation = []
        for msg in u["mensajes"]:
            if msg.get("to") == peer_id:
                conversation.append({
                    "sender": client_id,
                    "receiver": peer_id,
                    "message": msg.get("message", "")
                })
            elif msg.get("from") == peer_id:
                conversation.append({
                    "sender": peer_id,
                    "receiver": client_id,
                    "message": msg.get("message", "")
                })

        return conversation

    return []

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the chat API!"})

# ---------- HTTP ROUTES ----------

@app.route('/login', methods=['POST'])
def login_point():
    return login_handler()

@app.route('/users', methods=['GET'])
def get_users():
    return jsonify([u["id"] for u in users])

@app.route('/db', methods=['GET'])
def get_db():
    return jsonify({"users": [u for u in users]})

# ---------- SOCKET.IO EVENTS ----------
@socketio.on('connect')
def handle_connect():
    print("Cliente conectado: ", request.sid)

@socketio.on('register')
def handle_register(data):
    clientId = data.get("clientId")
    if not clientId:
        emit("error", {"message": "clientId is required"})
        return
    connected_clients[clientId] = request.sid
    join_room(clientId)

    # NO añadimos nada a users aquí
    print(f"Cliente registrado en socket: {clientId} con SID {request.sid}")

    deliver_pending_messages(clientId)

    # Emitimos la lista de usuarios actuales a todos los clientes
    emit("users_update", {"users": [u["id"] for u in users]}, broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    print("Cliente desconectado: ", request.sid)
    disconnected_client_id = None
    for client_id, sid in connected_clients.items():
        if sid == request.sid:
            disconnected_client_id = client_id
            break
    if disconnected_client_id:
        del connected_clients[disconnected_client_id]


@socketio.on('join_private_chat')
def handle_join_private_chat(data):
    client_id = data.get("clientId")
    peer_id = data.get("peerId")
    if not client_id or not peer_id:
        emit("error", {"message": "clientId and peerId are required"})
        return

    private_room = get_private_room(client_id, peer_id)
    join_room(private_room)

    peer_sid = connected_clients.get(peer_id)
    if peer_sid:
        join_room(private_room, sid=peer_sid)

    emit(
        "chat_history",
        {
            "peerId": peer_id,
            "messages": get_conversation_for_user(client_id, peer_id)
        }
    )

@socketio.on('send_message')
def handle_message(data):
    sender = data.get("sender")
    receiver = data.get("receiver")
    message = data.get("message")
    if not sender or not receiver or message is None:
        emit("error", {"message": "sender, receiver and message are required"})
        return

    print(f"Mensaje de {sender} a {receiver}: {message}")

    msg = chat_handler(users, sender, receiver, message)  # Procesa el mensaje usando la lógica de chat.py
    private_room = get_private_room(sender, receiver)

    # El emisor siempre entra a la sala privada de la conversación.
    join_room(private_room)

    receiver_sid = connected_clients.get(receiver)
    if receiver_sid:
        # Si el receptor está online, lo unimos a la sala y recibe en tiempo real.
        join_room(private_room, sid=receiver_sid)
        emit("receive_message", msg, room=private_room, include_self=False)
        mark_message_as_delivered(receiver, sender, message)

    # Confirmación al emisor en su socket actual.
    emit("message_sent", msg)