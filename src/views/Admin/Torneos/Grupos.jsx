import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import api from '@/lib/axiosConfig';

export default function Grupos() {
  const { zonaId } = useParams();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await api.get(`/zonas/${zonaId}/grupos`);
        setGrupos(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, [zonaId]);

  const onEdit = () => {
    // Implement edit functionality here
  };

  if (loading) {
    return <div className="text-center p-4">Cargando grupos...</div>;
  }

  if (!grupos || grupos.length === 0) {
    return <div className="text-center p-4">No hay grupos disponibles</div>;
  }

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Grupos</h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 rounded-md hover:bg-orange-600 transition-colors"
        >
          <span>Editar</span>
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="bg-gray-100 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">{grupo.nombre}</h3>
            <ul className="space-y-2">
              {grupo.equipos.map((equipo) => (
                <li key={equipo.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>{equipo.nombre}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}