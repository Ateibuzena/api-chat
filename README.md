# API Chat

Aplicación de chat en tiempo real con:

- Backend en Flask + Socket.IO
- Frontend en React + TypeScript + Vite
- Salas privadas por par de usuarios (A-B)
- Entrega de mensajes pendientes cuando el receptor se reconecta

## Estructura

```text
api-chat/
	backend/
		main.py
		endpoint.py
		requieriments.txt
		chat/
			chat.py
		login/
			login.py
	frontend/
		src/
			Pages/
				Home.tsx
				Chat.tsx
```

## Requisitos

- Python 3.10+
- Node.js 18+
- npm

## Backend

### 1) Instalar dependencias

```bash
cd backend
pip install -r requieriments.txt
```

### 2) Ejecutar servidor

```bash
python3 main.py
```

Servidor por defecto:

- `http://localhost:5000`

## Frontend

### 1) Instalar dependencias

```bash
cd frontend
npm install
```

### 2) Ejecutar en desarrollo

```bash
npm run dev
```

Frontend por defecto:

- `http://localhost:5173`

## Endpoints HTTP

- `GET /` -> mensaje de bienvenida
- `POST /login` -> registra/recupera usuario por `clientId`
- `GET /users` -> lista de ids de usuario
- `GET /db` -> estado actual en memoria (`users` y mensajes)

## Eventos Socket.IO

### Cliente -> servidor

- `register` `{ clientId }`
- `join_private_chat` `{ clientId, peerId }`
- `send_message` `{ sender, receiver, message }`

### Servidor -> cliente

- `users_update` `{ users: string[] }`
- `chat_history` `{ peerId, messages }`
- `receive_message` `{ sender, receiver, message }`
- `message_sent` `{ sender, receiver, message }`
- `error` `{ message }`

## Como funciona el chat privado

1. Cada cliente se registra con `register`.
2. Al abrir chat con alguien, el frontend emite `join_private_chat`.
3. El backend crea/usa una sala privada por par (`private:userA_userB`) y responde con `chat_history`.
4. Al enviar mensaje, el backend lo guarda en memoria.
5. Si el receptor esta online, recibe `receive_message` en tiempo real.
6. Si el receptor esta offline, el mensaje queda pendiente y se entrega cuando haga `register`.

## Validacion rapida

Backend:

```bash
cd /home/azubieta/Documents/api-chat/backend
python3 -m py_compile endpoint.py chat/chat.py login/login.py
```

Frontend:

```bash
cd /home/azubieta/Documents/api-chat/frontend
npm run build
```

## Notas

- Los datos se guardan en memoria (lista `users`), no en base de datos persistente.
- Si reinicias el backend, se pierde el historial cargado en memoria.