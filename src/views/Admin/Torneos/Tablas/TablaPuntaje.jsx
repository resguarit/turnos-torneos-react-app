import React from 'react';

export const TablaPuntaje = ({ data, formato }) => {
  // Asegúrate de que 'data' sea un array antes de mapearlo. Si no, usa un array vacío.
  const equiposData = Array.isArray(data) ? data : [];


    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-black">
            <tr>
              <th className="py-2 px-3 border-b text-left text-xs font-semibold text-white uppercase tracking-wider">Equipo</th>
              {/* Cambiado a 'puntaje' */}
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">Pts</th>
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">PJ</th>
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">PG</th>
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">PE</th>
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">PP</th>
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">GF</th>
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">GC</th>
              <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider">DG</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {/* Usa equiposData (que siempre es un array) para mapear */}
            {equiposData.map((equipo, index) => (
              <tr key={equipo.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-3 border-b text-sm">{equipo.nombre}</td>
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


