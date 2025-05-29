import React from 'react';

export const TablaPuntaje = ({ data, formato }) => {
  // Asegúrate de que 'data' sea un array antes de mapearlo. Si no, usa un array vacío.
  const equiposData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-black">
          <tr>
            <th className="py-2 px-3 border-b text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Equipo</th>
            {/* Cambiado a 'puntaje' */}
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">Pts</th>
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">PJ</th>
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">PG</th>
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">PE</th>
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">PP</th>
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">GF</th>
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">GC</th>
            <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[50px]">DG</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {/* Usa equiposData (que siempre es un array) para mapear */}
          {equiposData.map((equipo, index) => (
            <tr key={equipo.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="py-2 px-3 border-b text-sm truncate">{equipo.nombre}</td>
              {/* Cambiado a 'puntaje' */}
              <td className="py-2 px-3 border-b text-center text-sm font-medium">{equipo.puntaje}</td>
              <td className="py-2 px-3 border-b text-center text-sm">{equipo.partidosJugados}</td>
              <td className="py-2 px-3 border-b text-center text-sm">{equipo.partidosGanados}</td>
              <td className="py-2 px-3 border-b text-center text-sm">{equipo.partidosEmpatados}</td>
              <td className="py-2 px-3 border-b text-center text-sm">{equipo.partidosPerdidos}</td>
              <td className="py-2 px-3 border-b text-center text-sm">{equipo.golesFavor}</td>
              <td className="py-2 px-3 border-b text-center text-sm">{equipo.golesContra}</td>
              <td className="py-2 px-3 border-b text-center text-sm">{equipo.diferenciaGoles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


