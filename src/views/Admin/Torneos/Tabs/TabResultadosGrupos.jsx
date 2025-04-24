import React, { useEffect, useState } from 'react';
import { TablaPuntaje } from '../Tablas/TablaPuntaje';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify';

export function TabResultadosGrupos({ zonaId, grupos }) {
  const [estadisticasPorGrupo, setEstadisticasPorGrupo] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPartidosPorZona = async () => {
    try {
      const response = await api.get(`/partidos/zona/${zonaId}`);
      // Asegúrate de que la respuesta sea exitosa y contenga los datos esperados
      if (response.status === 200 && Array.isArray(response.data.partidos)) {
        return response.data.partidos; // Devuelve el array de partidos
      } else {
        console.warn('La respuesta del servidor no contiene un array de partidos válido o el estado no es 200.');
        return []; // Devuelve un array vacío si la respuesta no es válida
      }
    } catch (error) {
      console.error('Error al obtener los partidos por zona:', error);
      toast.error('Error al cargar los partidos de la zona.');
      return []; // Devuelve un array vacío en caso de error
    }
  };

  const calcularTablasDeGrupos = (partidos, grupos) => {
    // Verificar que grupos sea un array válido
    if (!Array.isArray(grupos)) {
      console.error('Error: grupos no es un array válido.');
      return []; // Retorna un array vacío si grupos no es válido
    }
  
    const tablas = grupos.map((grupo) => {
      // Verificar que grupo.equipos sea un array válido
      const equiposArray = Array.isArray(grupo.equipos) ? grupo.equipos : [];
  
      const equipos = equiposArray.map((equipo) => ({
        id: equipo.id,
        nombre: equipo.nombre,
        puntos: 0,
        partidosJugados: 0,
        partidosGanados: 0,
        partidosPerdidos: 0,
        partidosEmpatados: 0,
        golesFavor: 0,
        golesContra: 0,
        diferenciaGoles: 0,
      }));
  
      // Verificar que partidos sea un array válido antes de iterar
      if (Array.isArray(partidos)) {
        partidos.forEach((partido) => {
          const { equipo_local_id, equipo_visitante_id, marcador_local, marcador_visitante } = partido;
  
          const equipoLocal = equipos.find((e) => e.id === equipo_local_id);
          const equipoVisitante = equipos.find((e) => e.id === equipo_visitante_id);
  
          // Actualizar estadísticas solo si los marcadores no son null
          if (marcador_local !== null && marcador_visitante !== null) {
            if (equipoLocal) {
              equipoLocal.partidosJugados += 1;
              equipoLocal.golesFavor += marcador_local;
              equipoLocal.golesContra += marcador_visitante;
              equipoLocal.diferenciaGoles = equipoLocal.golesFavor - equipoLocal.golesContra;
  
              if (marcador_local > marcador_visitante) {
                equipoLocal.partidosGanados += 1;
                equipoLocal.puntos += 3;
              } else if (marcador_local < marcador_visitante) {
                equipoLocal.partidosPerdidos += 1;
              } else {
                equipoLocal.partidosEmpatados += 1;
                equipoLocal.puntos += 1;
              }
            }
  
            if (equipoVisitante) {
              equipoVisitante.partidosJugados += 1;
              equipoVisitante.golesFavor += marcador_visitante;
              equipoVisitante.golesContra += marcador_local;
              equipoVisitante.diferenciaGoles = equipoVisitante.golesFavor - equipoVisitante.golesContra;
  
              if (marcador_visitante > marcador_local) {
                equipoVisitante.partidosGanados += 1;
                equipoVisitante.puntos += 3;
              } else if (marcador_visitante < marcador_local) {
                equipoVisitante.partidosPerdidos += 1;
              } else {
                equipoVisitante.partidosEmpatados += 1;
                equipoVisitante.puntos += 1;
              }
            }
          }
        });
      } else {
        console.warn('La variable partidos no es un array válido.');
      }
  
  
      // Ordenar equipos por puntos y diferencia de goles
      equipos.sort((a, b) => b.puntos - a.puntos || b.diferenciaGoles - a.diferenciaGoles);
  
      return {
        id: grupo.id,
        nombre: grupo.nombre,
        equipos,
      };
    });
  
    return tablas;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Obtener los partidos de la zona
        const partidos = await fetchPartidosPorZona();

        // Calcular las tablas de posiciones
        const tablas = calcularTablasDeGrupos(partidos, grupos);

        console.log('Tablas de posiciones:', tablas);
        setEstadisticasPorGrupo(tablas); // Actualizar el estado con las tablas
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [zonaId, grupos]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <BtnLoading />
      </div>
    );
  }

  return (
    <div>
      {/* Tablas por grupo */}
      <div className="flex flex-col gap-4 mb-6">
        {estadisticasPorGrupo.map((grupo) => (
          <div key={grupo.id} className="p-2">
            <h3 className="text-lg font-bold mb-1">{grupo.nombre}</h3>
            <TablaPuntaje data={grupo.equipos} formato="Grupos" />
          </div>
        ))}
      </div>
    </div>
  );
}