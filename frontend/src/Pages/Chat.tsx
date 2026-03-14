import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Chat() {
    const stateMensaje = useState("");

    const mensaje = stateMensaje[0]; // mensaje que almacena el estado actual o cambiado
    const setMensaje = stateMensaje[1]; // funcion que cambia el estado

    const stateId = useState("")

    const clientId = stateId[0];
    const setId = stateId[1];

    useEffect(() => {
        const storedId = localStorage.getItem("clientId") || uuidv4();
        localStorage.setItem("clientId", storedId);
        setId(storedId); // actualiza el estado con el clientId
    }, []); // se ejecuta solo una vez al montar el componente

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
                    clientId: clientId
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