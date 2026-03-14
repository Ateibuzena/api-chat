import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const router = useNavigate();

    const handleRegister = async () => {
        if (localStorage.getItem("clientId")) {
            router("/chat"); // navegación SPA real, sin recarga
            return;
        }
        try {
            const storedId = localStorage.getItem("clientId") || uuidv4();
            localStorage.setItem("clientId", storedId);
            const res = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: "", 
                    clientId: storedId
                }) // envía el mensaje de registro como JSON
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log("Respuesta del backend al registrar: ", data);

            router("/chat"); // navegación SPA real, sin recarga
        } catch (error) {
            console.error("Error al registrar el cliente: ", error);
        }
    }

    return (
        <div>
            {/* boton de enviar mensaje */}
            <button
                onClick={() => handleRegister()}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    marginLeft: '10px'
                }}>
                Register
            </button>
        </div>
    )
}