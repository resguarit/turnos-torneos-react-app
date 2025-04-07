import React from 'react';

export const TablasEstadisticasJugadores = ({ titulo, datos, columnaEstadistica }) => {
  if (!datos || datos.length === 0) return null;

  return (
    <div className="flex flex-col w-full mt-4">
      <h2 className="text-xl font-bold mb-2">{titulo}</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-black text-white font-sans">
            <th className="border border-gray-300 px-4 py-2">Jugador</th>
            <th className="border border-gray-300 px-4 py-2">Equipo</th>
            <th className="border border-gray-300 px-4 py-2">{columnaEstadistica}</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((jugador, index) => (
            <tr key={index} className="text-center bg-white">
              <td className="border border-gray-300 px-4 py-2">{jugador.nombre} {jugador.apellido}</td>
              <td className="border border-gray-300 px-4 py-2">{jugador.equipo}</td>
              <td className="border border-gray-300 px-4 py-2">{jugador.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};