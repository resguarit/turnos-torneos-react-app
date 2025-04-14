import React from 'react';
import { TablaPuntaje } from '../Tablas/TablaPuntaje';
import { TablaProximaFecha } from '../Tablas/TablaProximaFecha';
import { TablasEstadisticasJugadores } from '../Tablas/TablasEstadisticasJugadores';
import ArañaEliminacion from "../ArañaEliminacion";

export function TabResultadosGrupos({ zonaId, grupos }) {
  return (
    <div>
      {/* Tablas por grupo */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Grupo {grupo.nombre}</h3>
            <TablaPuntaje data={grupo.equipos} />
          </div>
        ))}
      </div>

      {/* Fase eliminatoria si existe */}
      <ArañaEliminacion 
        equipos={grupos.flatMap(g => g.equipos.filter(e => e.clasificado))} 
        etapa="eliminatoria"
      />

      {/* Estadísticas generales */}
      <div className="w-full flex gap-8 justify-between">
        <TablasEstadisticasJugadores
          titulo="Goleadores"
          columnaEstadistica="Goles"
        />
        {/* ... otras estadísticas */}
      </div>
    </div>
  );
}