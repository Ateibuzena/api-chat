from flask import request, jsonify

users = []  # Lista para almacenar los IDs de los clientes conectados

def receiveMsg():
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
    mensaje = data.get('message', '')
    if mensaje:
        for user in users:
            if user["id"] == clientId:
                user["mensajes"].append(mensaje)
                break
    print(f"Mensaje recibido de {clientId}: {mensaje}")
    return jsonify({
        "status": "Message received",
        "message": mensaje,
        "clientId": clientId
    })

def sendMsg():
    return jsonify({"status": "OK", "users": users})

def chat():
    if request.method == 'POST':
        return receiveMsg()

    if request.method == 'GET':
        return sendMsg()
