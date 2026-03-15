import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

export default function Chat() {
    const router = useNavigate();
    // --- Estados ---
    const [users, setUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string>("");
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const clientId = localStorage.getItem("clientId");
        if (!clientId) {
            router("/"); // navegación SPA real, sin recarga
            return;
        }
        
        const s = io("http://localhost:5000");
        setSocket(s);

        // Registramos el usuario en el servidor
        s.emit("register", { clientId });

        // Escuchamos actualizaciones de usuarios conectados
        s.on("users_update", (data: { users: string[] }) => {
            setUsers(data.users); // ahora users es array
        });

        s.on("receive_message", (data: { sender: string; receiver: string; message: string }) => {
            console.log("Mensaje recibido:", data);
        });
        return () => {
            s.disconnect(); // limpiamos la conexión al desmontar el componente
        }
    }, [router]); // se ejecuta solo una vez al montar el componente
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMensaje(event.target.value); // actualiza el estado con el valor del input
    };
    
    const handleSend = async () => {
        if (!selectedUser || !mensaje.trim() || !socket) return; // no enviar si no hay usuario seleccionado o mensaje vacío
        socket.emit("send_message", {
            sender: localStorage.getItem("clientId"), 
            receiver: selectedUser, 
            message: mensaje
        });
        setMensaje(""); // limpia el input
    };


    return (
        <div>
            {/* caja para escribir mensajes */ }
            <input
                type="text"
                placeholder={selectedUser ? `Message to ${selectedUser}` : "Type your message..."}
                disabled={!selectedUser} // deshabilita el input si no hay usuario seleccionado
                style={{
                    width: '80%',
                    padding: '10px',
                    fontSize: '16px'
                }}
                value={mensaje} // vincula el valor del input con el estado
                onChange={handleChange}
            />

            <div style={{ marginTop: '20px' }}>
                <h3>Connected Users:</h3>
                {users
                .filter(userId => userId !== localStorage.getItem("clientId"))
                .map(userId => (
                <button
                    key={userId}
                    onClick={() => setSelectedUser(userId)}
                    style={{
                        display: "block",
                        margin: "5px",
                        padding: "10px",
                        backgroundColor: selectedUser === userId ? "lightblue" : "white"
                    }}
                >
                    {userId}
                </button>
                ))}
            </div>

            {/* boton de enviar mensaje */}
            <button
                onClick={handleSend}
                disabled={!mensaje.trim() || !selectedUser} // deshabilita el botón si no hay mensaje o usuario seleccionado
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    marginLeft: '10px'
                }}>
                Send
            </button>
        </div>
    )
}