import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import api from '@/lib/axiosConfig';

export default function TorneosDropdown({ anchorRef, closeMenuTorneos }) {
    const [style, setStyle] = useState({});
    const navigate = useNavigate();
    const [torneos, setTorneos] = useState([]);
    const [openTorneo, setOpenTorneo] = useState(null);

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        zIndex: 50,
        minWidth: 192,
      });
    }
    fetchTorneos();
  }, [anchorRef]);

  const fetchTorneos = async () => {
    try {
      const response = await api.get("/torneos");
      setTorneos(response.data);
    } catch (error) {
      console.error("Error fetching torneos:", error);
    }
  };

   const handleTorneoClick = (torneoId) => {
    setOpenTorneo(openTorneo === torneoId ? null : torneoId);
  };

  return (
    <>
      <div style={style} className="font-inter text-base bg-white text-zinc-800 rounded-xl shadow-lg flex relative">
        <div className="flex flex-col items-start px-4 py-4 space-y-2 min-w-[192px]">
          <button
            onClick={() => {
              navigate("/torneos-admi");
              closeMenuTorneos();
            }}
            className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
          >
            Ver Todos <ChevronRight className="w-5" />
          </button>
          <span className="w-full h-[1px] bg-gray-300 my-2"></span>
          {torneos.map((torneo) => (
            <div key={torneo.id} className="w-full relative">
              <button
                className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
                style={{ zIndex: 51 }}
                onClick={() => handleTorneoClick(torneo.id)}
              >
                <span className="ml-4">{torneo.nombre}</span>
                <ChevronRight className="w-5" />
              </button>
              {/* Submenu de zonas */}
              {openTorneo === torneo.id && (
                <div
                  className="absolute top-0 left-full ml-2 bg-white rounded-xl shadow-lg py-2 px-4 min-w-[180px] z-50"
                >
                  <button
                    className="w-full text-left font-semibold text-blue-600 hover:underline mb-2"
                    onClick={() => {
                      navigate(`/zonas-admi/${torneo.id}`);
                      closeMenuTorneos();
                    }}
                  >
                    Ver todas las zonas
                  </button>
                  <span className="block h-[1px] bg-gray-200 my-2"></span>
                  {torneo.zonas && torneo.zonas.length > 0 ? (
                    torneo.zonas.map((zona) => (
                      <button
                        key={zona.id}
                        className="w-full text-left hover:bg-gray-100 px-2 py-1 rounded"
                        onClick={() => {
                          navigate(`/detalle-zona/${zona.id}`);
                          closeMenuTorneos();
                        }}
                      >
                        {zona.nombre}
                      </button>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Sin zonas</span>
                  )}
                </div>
              )}
            </div>
          ))}
          <span className="w-full h-[1px] bg-gray-300 my-2"></span>
          <button
            onClick={() => {
              navigate("/partidos");
              closeMenuTorneos();
            }}
            className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
          >
            Partidos <ChevronRight className="w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
