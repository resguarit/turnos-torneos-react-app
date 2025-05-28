import React, { useState } from 'react';

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

  const [mostrarMas, setMostrarMas] = useState(false);

  const showedStatsData = mostrarMas ? statsData : statsData.slice(0, 10);

  return (
    <div className="">
      <h3 className="text-lg font-semibold mb-3 ">{titulo}</h3>
      {statsData.length > 0 ? (
        <div>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="min-w-full text-sm table-fixed">
              <thead>
                <tr className="text-white bg-black">
                  <th className="py-2 px-3 text-left font-medium w-2/5 min-w-[120px]">Jugador</th>
                  <th className="py-2 px-3 text-left font-medium w-2/5 min-w-[100px]">Equipo</th>
                  <th className="py-2 px-3 text-center font-medium w-1/5 min-w-[80px]">{columnaEstadistica}</th>
                </tr>
              </thead>
              <tbody>
                {showedStatsData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-3 text-gray-700 truncate">{item[nombreKey]}</td>
                    <td className="py-2 px-3 text-gray-700 truncate">{item[equipoKey]}</td>
                    <td className="py-2 px-3 text-center font-semibold text-gray-700">{item[valorKey]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {statsData.length > 10 && (
            <div className="mt-3 text-center">
              <button 
                onClick={() => setMostrarMas(!mostrarMas)} 
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                {mostrarMas ? 'Mostrar menos' : 'Mostrar más'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4 bg-white">No hay datos disponibles.</p>
      )}
    </div>
  );
};