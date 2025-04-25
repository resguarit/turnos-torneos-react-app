import React, { useEffect, useState } from 'react';
import { TablaPuntaje } from '../Tablas/TablaPuntaje'; // Asegúrate que la ruta sea correcta
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify';

export function TabResultadosGrupos({ zonaId, abortController }) {
  const [estadisticasGrupos, setEstadisticasGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      setLoading(true);
      try {
        // Llama al nuevo endpoint del backend
        const response = await api.get(`/zonas/${zonaId}/estadisticas-grupos`, {
          signal: abortController?.signal // Usa el AbortController si está disponible
        });

        if (response.status === 200 && Array.isArray(response.data)) {
          console.log('Estadísticas de grupos recibidas:', response.data);
          setEstadisticasGrupos(response.data); // Guarda los datos en el estado
        } else {
          console.warn('La respuesta del servidor no contiene un array válido de estadísticas.');
          setEstadisticasGrupos([]);
          toast.error('No se pudieron cargar las estadísticas de los grupos.');
        }
      } catch (error) {
        // Check if the error is due to cancellation
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          console.log('Petición de estadísticas cancelada.');
          return; // Don't treat cancellation as an error
        }
        // Log other errors
        console.error('Error al obtener las estadísticas de grupos:', error);
        toast.error(error.response?.data?.message || 'Error al cargar las estadísticas de los grupos.');
        setEstadisticasGrupos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();

    // No cleanup needed here, parent (DetalleZona) handles abortion via handleTabChange
    // return () => {
    //   abortController?.abort(); // REMOVE THIS LINE
    // };

  }, [zonaId, abortController]); // Dependencias del useEffect

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <BtnLoading />
      </div>
    );
  }

  if (!estadisticasGrupos || estadisticasGrupos.length === 0) {
    return <div className="text-center text-gray-500 py-10">No hay estadísticas de grupos disponibles.</div>;
  }

  return (
    <div>
      {/* Renderiza una tabla por cada grupo */}
      <div className="flex flex-col gap-6 mb-6">
        {estadisticasGrupos.map((grupo) => (
          <div key={grupo.id} className="p-2 ">
            <h3 className="text-xl font-semibold mb-3 ">{grupo.nombre}</h3>
            {/* Pasa el array de equipos del grupo a TablaPuntaje */}
            <TablaPuntaje data={grupo.equipos} formato="Grupos" />
          </div>
        ))}
      </div>
    </div>
  );
}