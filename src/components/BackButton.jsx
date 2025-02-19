import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Icono de flecha izquierda
import { BASE_URL } from '@/constants/config'

function BackButton() {
    const navigate = useNavigate(); // Hook para la navegación

    return (
        <button
            onClick={() => navigate(`${BASE_URL}/`)} // Navegar hacia la pantalla anterior
            className="bg-naranja flex justify-center font-semibold text-white hover:bg-black/90 lg:text-xl w-14 py-1 mb-4 border border-white rounded-[10px]"
        >
           <ArrowLeft />
        </button>
    );
}

export default BackButton;
