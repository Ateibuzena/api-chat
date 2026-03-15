import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Chat() {

    const router = useNavigate();

    const [users, setUsers] = useState<string[]>([]);

    useEffect(() => {

        if (!localStorage.getItem("clientId")) {
            router("/"); // navegación SPA real, sin recarga
                return;
        }
        fetch('http://localhost:5000/users')
            .then(res => res.json())
            .then(data => {
                console.log("Usuarios conectados: ", data);
                setUsers(data); // actualiza el estado con la lista de usuarios
            })
            .catch(error => {
                console.error("Error al obtener usuarios: ", error);
            });
    }, []); // se ejecuta solo una vez al montar el componente
    
    const stateMensaje = useState("");

    const mensaje = stateMensaje[0]; // mensaje que almacena el estado actual o cambiado
    const setMensaje = stateMensaje[1]; // funcion que cambia el estado

    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMensaje(event.target.value); // actualiza el estado con el valor del input
    }

    const handleSend = async () => {
        try {
            const res = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: mensaje, 
                    clientId: localStorage.getItem("clientId")
                }) // envía el mensaje como JSON
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log("Respuesta del backend: ", data);
            setMensaje("") // limpia el input
        } catch (error) {
            console.error("Error al enviar el mensaje: ", error
            )
        }
    }

    const [selectedUser, setSelectedUser] = useState<string | null>(null);

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