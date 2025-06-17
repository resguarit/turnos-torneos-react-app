import { Popover } from "@headlessui/react"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';

export default function TorneosDropdown({ anchorRef, closeMenuTorneos }) {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/torneos');
        setTorneos(response.data);
      } catch (error) {
        console.error("Error fetching torneos for dropdown", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneos();
  }, []);

  return (
    <div className="absolute right-56 z-50 mt-2 bg-black text-white rounded-md shadow-lg p-2 min-w-[200px]">
      <button
        className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md"
        onClick={() => {
          navigate("/torneos-admi")
          closeMenuTorneos()
        }}
      >
        Ver Torneos
      </button>

      <div className="border-t border-gray-700 my-2" />

      {loading ? (
        <div className="w-full text-left px-3 py-2 text-gray-400">Cargando...</div>
      ) : (
        <>
          {torneos.filter(t => t.activo === 1).map((torneo) => (
            <Popover key={torneo.id} className="relative">
              <Popover.Button as="button" className="flex justify-between items-center w-full pl-10 px-3 py-2 hover:bg-gray-700 rounded-md">
                {torneo.nombre}
                <ChevronRight className="w-4 h-4" />
              </Popover.Button>

              <Popover.Panel
                className="absolute left-full top-0 ml-2 bg-black border-l border-white rounded-md shadow-lg p-2 z-50 w-48"
                style={{ maxHeight: 350, overflowY: "auto" }} // <-- scroll y alto máximo
              >
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md"
                  onClick={() => {
                    navigate(`/zonas-admi/${torneo.id}`)
                    closeMenuTorneos()
                  }}
                >
                  Ver Zonas
                </button>

                <div className="border-t border-gray-700 my-2" />

                {torneo.zonas?.filter(z => z.activo === 1).map(zona => (
                  <button
                    key={zona.id}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md"
                    onClick={() => {
                      navigate(`/detalle-zona/${zona.id}?tab=equipos`)
                      closeMenuTorneos()
                    }}
                  >
                    {zona.nombre}
                  </button>
                ))}

                {(!torneo.zonas || torneo.zonas.filter(z => z.activo === 1).length === 0) && (
                  <span className="text-gray-400 text-sm px-3 py-2 block">Sin zonas</span>
                )}
              </Popover.Panel>
            </Popover>
          ))}
          {!loading && torneos.filter(t => t.activo === 1).length === 0 && (
            <span className="text-gray-400 text-sm px-3 py-2 block">No hay torneos activos</span>
          )}
        </>
      )}

      <div className="border-t border-gray-700 my-2" />

      <button
        onClick={() => {
          navigate("/partidos")
          closeMenuTorneos()
        }}
        className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md"
      >
        Partidos
      </button>

      <button
        onClick={() => {
          navigate("/ver-jugadores")
          closeMenuTorneos()
        }}
        className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md"
      >
        Jugadores
      </button>
    </div>
  )
}
