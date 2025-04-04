import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '@/lib/axiosConfig';
import { ChevronRight } from "lucide-react";

export default function ArañaEliminacion({ equipos }) {
  const { zonaId } = useParams();
  const [rounds, setRounds] = useState([]);
  const [selectedWinners, setSelectedWinners] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await api.get(`/zonas/${zonaId}/fechas`);
        const eliminatoriaFechas = response.data.sort((a, b) => 
          new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
        const roundsData = eliminatoriaFechas.map(fecha => ({
          id: fecha.id,
          matches: fecha.partidos.map(p => ({
            id: p.id,
            teams: [p.equipo_local_id, p.equipo_visitante_id],
            winner: null
          }))
        }));
        setRounds(roundsData);
      } catch (error) {
        console.error('Error fetching fechas:', error);
      }
    };
    
    fetchFechas();
  }, [zonaId]);

  const handleWinnerSelect = (roundIndex, matchIndex, winnerId) => {
    setSelectedWinners(prev => ({
      ...prev,
      [`${roundIndex}-${matchIndex}`]: winnerId
    }));
  };

  const handleGenerateNextRound = async () => {
    try {
      setLoading(true);
      const currentRound = rounds[rounds.length - 1];
      const winners = currentRound.matches.map((match, index) => 
        selectedWinners[`${rounds.length - 1}-${index}`]
      );

      const response = await api.post(`/zona/${zonaId}/generar-siguiente-ronda`, {
        fecha_anterior_id: currentRound.id,
        winners: winners
      });

      if (response.data.fecha) {
        const newRound = {
          id: response.data.fecha.id,
          matches: response.data.fecha.partidos.map(p => ({
            id: p.id,
            teams: [p.equipo_local_id, p.equipo_visitante_id],
            winner: null
          }))
        };
        setRounds([...rounds, newRound]);
        setSelectedWinners({});
      }
    } catch (error) {
      console.error('Error generating next round:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId) => {
    return equipos.find(e => e.id === teamId)?.nombre || 'Desconocido';
  };

  const canGenerateNextRound = () => {
    if (!rounds.length) return false;
    const currentRound = rounds[rounds.length - 1];
    return currentRound.matches.every((_, index) => 
      selectedWinners.hasOwnProperty(`${rounds.length - 1}-${index}`)
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Araña Eliminación</h3>
      <div className="flex overflow-x-auto justify-center gap-8 p-4">
        {rounds.map((round, roundIndex) => (
          <div key={round.id} className="flex flex-col gap-4">
            <div className="text-center font-semibold ">Ronda {rounds.length - roundIndex}</div>
            <div className="flex flex-col gap-6">
              {round.matches.map((match, matchIndex) => (
                <div key={match.id} className="relative">
                  <div className="flex flex-col gap-2 border p-2 rounded-[6px] min-w-[200px]">
                    {match.teams.map(teamId => (
                      <div 
                        key={teamId} 
                        className="p-2 bg-gray-200 rounded-[6px] hover:bg-gray-300 cursor-pointer"
                        onClick={() => handleWinnerSelect(roundIndex, matchIndex, teamId)}
                      >
                        {getTeamName(teamId)}
                        {selectedWinners[`${roundIndex}-${matchIndex}`] === teamId && (
                          <ChevronRight className="inline-block ml-2 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  {roundIndex < rounds.length - 1 && (
                    <div className="absolute right-[-35px] top-1/2 transform -translate-y-1/2">
                      <div className="h-[1px] w-8 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {rounds.length > 0 && canGenerateNextRound() && (
        <div className="mt-4 flex justify-center">
          <button 
            onClick={handleGenerateNextRound}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar Siguiente Ronda'}
          </button>
        </div>
      )}
    </div>
  );
}
