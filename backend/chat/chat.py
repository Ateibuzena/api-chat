from typing import List, Dict


def chat(users: List[Dict], sender: str, receiver: str, message: str) -> Dict:
    for u in users:
        if u["id"] == receiver:
            u["mensajes"].append({
                "from": sender,
                "message": message
            })
            break
    return {
        "sender": sender,
        "receiver": receiver,
        "message": message
    }
