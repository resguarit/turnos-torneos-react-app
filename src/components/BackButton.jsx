import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; // Icono de flecha izquierda

function BackButton({ruta}) {
    const navigate = useNavigate(); 

    return (
        <button onClick={() => ruta ? navigate(ruta) : navigate(-1)} className="bg-secundario rounded-xl text-white py-2 pl-2 pr-4 text-xs sm:text-sm lg:text-base flex items-center justify-center">
            <ChevronLeft className="w-4 sm:w-5" /> Atrás
          </button>
    );
}

export default BackButton;
