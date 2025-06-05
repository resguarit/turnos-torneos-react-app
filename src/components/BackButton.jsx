import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; // Icono de flecha izquierda

function BackButton({ruta}) {
    const navigate = useNavigate(); 

    return (
        <button onClick={() => navigate(`${ruta}`)} className="bg-black rounded-xl text-white py-2 pl-2 pr-4 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
    );
}

export default BackButton;
