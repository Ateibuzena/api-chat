from flask import Flask, jsonify, request
from chat.chat import chat as chat_handler
from login.login import login as login_handler
from login.login import users
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app)  # <--- esto habilita CORS para todos los dominios
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "http://localhost:5173/chat"])

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
    # NO añadimos nada a users aquí
    print(f"Cliente registrado en socket: {clientId} con SID {request.sid}")

    # Emitimos la lista de usuarios actuales a todos los clientes
    emit("users_update", {"users": [u["id"] for u in users]}, broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    print("Cliente desconectado: ", request.sid)

@socketio.on('send_message')
def handle_message(data):
    sender = data.get("sender")
    receiver = data.get("receiver")
    message = data.get("message")
    print(f"Mensaje de {sender} a {receiver}: {message}")

    msg = chat_handler(users, sender, receiver, message)  # Procesa el mensaje usando la lógica de chat.py
    emit("receive_message", msg, broadcast=True)