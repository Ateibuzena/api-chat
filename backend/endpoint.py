from flask import Flask, jsonify
from chat.chat import chat as chat_handler
from login.login import login as login_handler, users
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5173/chat"])  # <--- esto habilita CORS para todos los dominios

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the chat API!"})

@app.route('/chat', methods=['POST', 'GET'])
def chat_point():
    return chat_handler(users)

@app.route('/login', methods=['POST'])
def login_point():
    return login_handler()

@app.route('/users', methods=['GET'])
def get_users():
    return jsonify([u["id"] for u in users])