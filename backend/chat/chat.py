from flask import request, jsonify

def receiveMsg(users):
    data = request.get_json()

    clientId = data.get('clientId', 'unknown')
    if clientId == 'unknown':
        return jsonify({"status": "Error", "message": "clientId is required"}), 400
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

def sendMsg(users):
    return jsonify({"status": "OK", "users": users})

def chat(users):
    if request.method == 'POST':
        return receiveMsg(users)

    if request.method == 'GET':
        return sendMsg(users)
