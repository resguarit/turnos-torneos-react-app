import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const TablaProximaFecha = ({ fecha, partidos, zonaId }) => {
  const navigate = useNavigate();
  
  if (!fecha) return null;

  return (
    <>
      <div className="flex flex-col w-full mt-4">
        <h2 className="text-xl font-bold mb-2">Próxima Fecha: {fecha.nombre}</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-black text-white font-sans">
              <th className="border border-gray-300 px-4 py-2">Local</th>
              <th className="border border-gray-300 px-4 py-2">vs</th>
              <th className="border border-gray-300 px-4 py-2">Visitante</th>
              <th className="border border-gray-300 px-4 py-2">Cancha</th>
              <th className="border border-gray-300 px-4 py-2">Hora</th>
            </tr>
          </thead>
          <tbody>
            {partidos.map((partido, index) => (
              <tr key={index} className="text-center bg-white">
                <td className="border border-gray-300 px-4 py-2">{partido.equipo_local.nombre}</td>
                <td className="border border-gray-300 px-4 py-2">vs</td>
                <td className="border border-gray-300 px-4 py-2">{partido.equipo_visitante.nombre}</td>
                <td className="border border-gray-300 px-4 py-2">{partido.cancha?.nro || 'No Definido'}</td>
                <td className="border border-gray-300 px-4 py-2">{partido.horario?.hora || 'No Definido'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button 
        onClick={() => navigate(`/ver-fixture/${zonaId}`)}
        className='justify-start w-full text-sm items-center text-gray-400 flex mt-2'
      >
        Ver Fixture Completo <ArrowRight size={16} />
      </button>
    </>
  );
};