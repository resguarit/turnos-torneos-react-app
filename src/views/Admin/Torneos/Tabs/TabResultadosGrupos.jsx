import React, { useEffect, useState } from 'react';
import { TablaPuntaje } from '../Tablas/TablaPuntaje';
import ArañaEliminacion from "../ArañaEliminacion";
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';

export function TabResultadosGrupos({ zonaId, grupos }) {
  const [estadisticasPorGrupo, setEstadisticasPorGrupo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true);

        const estadisticasGrupo = {};

        // Iterar sobre los grupos y sus equipos
        for (const grupo of grupos) {
          estadisticasGrupo[grupo.id] = [];

          for (const equipo of grupo.equipos) {
            // Obtener partidos del equipo en la zona específica
            const response = await api.get(`/equipos/${equipo.id}/zona/${zonaId}/partidos`);
            const partidos = response.data;

            // Inicializar datos del equipo
            const equipoStats = {
              nombre: equipo.nombre,
              puntos: 0,
              partidos_jugados: 0,
              partidos_ganados: 0,
              partidos_perdidos: 0,
              partidos_empatados: 0,
              goles_a_favor: 0,
              goles_en_contra: 0,
              diferencia_goles: 0,
            };

            // Filtrar solo los partidos finalizados
            const partidosFinalizados = partidos.filter(
              (partido) => partido.estado === 'Finalizado'
            );

            // Procesar partidos del equipo
            partidosFinalizados.forEach((partido) => {
              const esLocal = partido.equipo_local_id === equipo.id;
              const golesFavor = esLocal ? partido.marcador_local : partido.marcador_visitante;
              const golesContra = esLocal ? partido.marcador_visitante : partido.marcador_local;

              // Sumar goles a favor y en contra
              equipoStats.goles_a_favor += golesFavor;
              equipoStats.goles_en_contra += golesContra;

              // Calcular diferencia de goles
              equipoStats.diferencia_goles += golesFavor - golesContra;

              // Determinar el resultado del partido
              if (golesFavor > golesContra) {
                equipoStats.puntos += 3;
                equipoStats.partidos_ganados += 1;
              } else if (golesFavor < golesContra) {
                equipoStats.partidos_perdidos += 1;
              } else {
                equipoStats.puntos += 1;
                equipoStats.partidos_empatados += 1;
              }

              // Incrementar partidos jugados
              equipoStats.partidos_jugados += 1;
            });

            // Agregar estadísticas del equipo al grupo
            estadisticasGrupo[grupo.id].push(equipoStats);
          }

          // Ordenar los equipos del grupo por puntos, diferencia de goles y partidos jugados
          estadisticasGrupo[grupo.id].sort((a, b) => {
            if (b.puntos === a.puntos) {
              if (b.diferencia_goles === a.diferencia_goles) {
                return b.partidos_jugados - a.partidos_jugados;
              }
              return b.diferencia_goles - a.diferencia_goles;
            }
            return b.puntos - a.puntos;
          });
        }

        setEstadisticasPorGrupo(estadisticasGrupo);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, [grupos]);

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
        {grupos.map((grupo) => (
          <div key={grupo.id} className="p-2">
            <h3 className="text-lg font-bold mb-1">{grupo.nombre}</h3>
            <TablaPuntaje data={estadisticasPorGrupo[grupo.id] || []} />
          </div>
        ))}
      </div>

      {/* Fase eliminatoria si existe */}
      <ArañaEliminacion
        equipos={grupos.flatMap((g) => g.equipos.filter((e) => e.clasificado))}
        etapa="eliminatoria"
      />
    </div>
  );
}