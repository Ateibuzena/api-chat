from flask import Flask, jsonify, request
from chat import chat
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # <--- esto habilita CORS para todos los dominios

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the chat API!"})

@app.route('/chat', methods=['POST', 'GET'])
def chatPoint():
    return chat()

