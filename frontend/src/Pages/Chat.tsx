import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Chat() {

    const router = useNavigate();

    useEffect(() => {

        if (!localStorage.getItem("clientId")) {
            router("/"); // navegación SPA real, sin recarga
                return;
        }
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

    return (
        <div>
            {/* caja para escribir mensajes */ }
            <input
                type="text"
                placeholder="Type your message here..."
                style={{
                    width: '80%',
                    padding: '10px',
                    fontSize: '16px'
                }}
                value={mensaje} // vincula el valor del input con el estado
                onChange={handleChange}
            />

            {/* boton de enviar mensaje */}
            <button
                onClick={handleSend}
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