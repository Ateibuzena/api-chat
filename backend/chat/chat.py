from typing import List, Dict


def chat(users: List[Dict], sender: str, receiver: str, message: str) -> Dict:
    for u in users:
        if u["id"] == receiver:
            u["mensajes"].append({
                "from": sender,
                "message": message,
                "delivered": False
            })
        if u["id"] == sender:
            u["mensajes"].append({
                "to": receiver,
                "message": message
            })
    return {
        "sender": sender,
        "receiver": receiver,
        "message": message
    }
