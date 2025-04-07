import React from 'react';

export const TablaPuntaje = ({ data }) => {
  return (
    <table className="table-auto w-full">
      <thead>
        <tr className="bg-black text-white font-sans">
          <th className="border border-gray-300 px-4 py-2">Posición</th>
          <th className="border border-gray-300 px-4 py-2">Equipo</th>
          <th className="border border-gray-300 px-4 py-2">Puntos</th>
          <th className="border border-gray-300 px-4 py-2">PJ</th>
          <th className="border border-gray-300 px-4 py-2">PG</th>
          <th className="border border-gray-300 px-4 py-2">PP</th>
          <th className="border border-gray-300 px-4 py-2">PE</th>
          <th className="border border-gray-300 px-4 py-2">GF</th>
          <th className="border border-gray-300 px-4 py-2">GC</th>
          <th className="border border-gray-300 px-4 py-2">DG</th>
        </tr>
      </thead>
      <tbody>
        {data.map((equipo, index) => (
          <tr key={index} className="text-center bg-white">
            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.nombre}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.puntos}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.partidos_jugados}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.partidos_ganados}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.partidos_perdidos}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.partidos_empatados}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.goles_a_favor}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.goles_en_contra}</td>
            <td className="border border-gray-300 px-4 py-2">{equipo.diferencia_goles}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};