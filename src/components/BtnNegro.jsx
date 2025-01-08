import { useNavigate } from "react-router-dom";

function BtnNegro({ruta, texto}) {
    const navigate = useNavigate(); 

    return (
        <button
            onClick={() => navigate(ruta)} 
            style={{ borderRadius: "8px" }}
            className="bg-black text-white hover:bg-black/80 lg:text-[1.4rem] font-inter p-3"
        >
            {texto}
        </button>
    );
}

export default BtnNegro;