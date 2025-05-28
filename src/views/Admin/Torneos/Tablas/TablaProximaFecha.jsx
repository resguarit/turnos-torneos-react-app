import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatearRangoHorario } from '@/utils/dateUtils';

export const TablaProximaFecha = ({ fecha, partidos, zonaId }) => {
  const navigate = useNavigate();

  if (!fecha) return null;

  // Helper function to get team name from the nested equipos array
  const getTeamName = (partido, teamId) => {
    const team = partido.equipos?.find(e => e.id === teamId);
    return team?.nombre || 'Equipo Desconocido';
  };

  return (
    <>
      <div className="flex flex-col w-full mt-4">
        <h2 className="text-xl font-semibold mb-3 ">Próxima Fecha: {fecha.nombre}</h2>
        {partidos && partidos.length > 0 ? (
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="py-2 px-3 text-left font-medium min-w-[120px]">Local</th>
                  <th className="py-2 px-3 text-center font-medium min-w-[40px]">vs</th>
                  <th className="py-2 px-3 text-left font-medium min-w-[120px]">Visitante</th>
                  <th className="py-2 px-3 text-center font-medium min-w-[80px]">Cancha</th>
                  <th className="py-2 px-3 text-center font-medium min-w-[100px]">Hora</th>
                </tr>
              </thead>
              <tbody>
                {partidos.map((partido, index) => (
                  <tr key={partido.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-3 text-gray-600 truncate">{getTeamName(partido, partido.equipo_local_id)}</td>
                    <td className="py-2 px-3 text-center text-gray-600">vs</td>
                    <td className="py-2 px-3 text-gray-600 truncate">{getTeamName(partido, partido.equipo_visitante_id)}</td>
                    <td className="py-2 px-3 text-center text-gray-600">{partido.cancha?.nro || 'No Definido'}</td>
                    <td className="py-2 px-3 text-center text-gray-600 whitespace-nowrap">{partido.horario?.hora_inicio && partido.horario?.hora_fin ? formatearRangoHorario(partido.horario.hora_inicio, partido.horario.hora_fin) : "No Definido"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 bg-white">No hay partidos programados para esta fecha.</p>
        )}
      </div>
      <button
        onClick={() => navigate(`/ver-fixture/${zonaId}`)}
        className='justify-start w-full text-sm items-center text-gray-500 flex mt-3 hover:text-gray-600'
      >
        Ver Fixture Completo <ArrowRight size={16} />
      </button>
    </>
  );
};