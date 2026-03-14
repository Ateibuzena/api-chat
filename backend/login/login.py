from flask import request, jsonify

users = []
def login():
    data = request.get_json()

    clientId = data.get('clientId', 'unknown')
    user = None
    for u in users:
        if u["id"] == clientId:
            user = u
            break
    if not user:
        user = {
            "id": clientId,
            "mensajes": []
        }
        users.append(user)
    return jsonify({
        "status": "Login successful",
        "clientId": clientId
    })
