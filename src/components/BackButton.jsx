import { useNavigate } from "react-router-dom";

function BackButton() {
    const navigate = useNavigate(); // Hook para la navegación

    return (
        <button
            onClick={() => navigate(-1)} // Navegar hacia la pantalla anterior
            className="bg-naranja font-inter text-white hover:bg-black/90 lg:text-xl lg:mb-4  w-1/2 lg:w-fit lg:px-3 lg:py-2 border border-white rounded-xl"
        >
            Atrás
        </button>
    );
}

export default BackButton;
