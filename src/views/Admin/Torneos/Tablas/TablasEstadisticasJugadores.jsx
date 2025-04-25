import React from 'react';

export const TablasEstadisticasJugadores = ({
  titulo,
  datos,
  columnaEstadistica,
  valorKey, // e.g., 'goles', 'amarillas', 'rojas'
  nombreKey = 'nombre_completo', // Default key for player name
  equipoKey = 'equipo' // Default key for team name
}) => {
  // Ensure datos is an array
  const statsData = Array.isArray(datos) ? datos : [];

  return (
    <div className="">
      <h3 className="text-lg font-semibold mb-3 ">{titulo}</h3>
      {statsData.length > 0 ? (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-white bg-black">
              <th className="py-2 px-3 text-left font-medium ">Jugador</th>
              <th className="py-2 px-3 text-left font-medium ">Equipo</th>
              <th className="py-2 px-3 text-center font-medium ">{columnaEstadistica}</th>
            </tr>
          </thead>
          <tbody>
            {statsData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-3 text-gray-600">{item[nombreKey]}</td>
                <td className="py-2 px-3 text-gray-600">{item[equipoKey]}</td>
                <td className="py-2 px-3 text-center font-semibold text-gray-600">{item[valorKey]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center py-4 bg-white">No hay datos disponibles.</p>
      )}
    </div>
  );
};