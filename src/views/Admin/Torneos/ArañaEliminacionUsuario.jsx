import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '@/lib/axiosConfig';
import { ChevronRight, Trophy, X } from "lucide-react";
import Confetti from 'react-confetti';

export default function ArañaEliminacionUsuario({ equipos }) {
  const { zonaId } = useParams();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChampionModal, setShowChampionModal] = useState(false);
  const [champion, setChampion] = useState(null);
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const detectSize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', detectSize);
    return () => window.removeEventListener('resize', detectSize);
  }, []);

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/zonas/${zonaId}/fechas`);
        const eliminatoriaFechas = response.data // Solo mostrar fechas jugadas o en curso
          .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
        
        const roundsData = eliminatoriaFechas.map(fecha => ({
          id: fecha.id,
          nombre: fecha.nombre,
          matches: fecha.partidos.map(p => ({
            id: p.id,
            teams: [p.equipo_local_id, p.equipo_visitante_id],
            winner: p.ganador_id || null,
            estado: p.estado
          }))
        }));
        setRounds(roundsData);

        // Verificar si hay un campeón (final jugada con ganador)
        const finalRound = roundsData[roundsData.length - 1];
        if (finalRound && finalRound.matches.length === 1) {
          const finalMatch = finalRound.matches[0];
          if (finalMatch.winner && finalMatch.estado === 'Finalizado') {
            const championTeam = equipos.find(e => e.id === finalMatch.winner);
            if (championTeam) {
              setChampion(championTeam);
              setShowChampionModal(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching fechas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (zonaId && equipos?.length > 0) {
      fetchFechas();
    }
  }, [zonaId, equipos]);

  const getTeamName = (teamId) => {
    return equipos.find(e => e.id === teamId)?.nombre || 'Desconocido';
  };

  const closeChampionModal = () => {
    setShowChampionModal(false);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Cuadro Eliminatorio</h3>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Cuadro Eliminatorio</h3>
        <div className="text-center text-gray-500 py-8">
          No hay rondas eliminatorias disponibles aún.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de Campeón con Confeti */}
      {showChampionModal && champion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            numberOfPieces={300}
            recycle={true}
            colors={['#FFD700', '#FFA500', '#FF6B00', '#4CAF50', '#2196F3', '#9C27B0']}
          />
          <div className="relative bg-white rounded-xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-4 text-center shadow-2xl">
            <button
              onClick={closeChampionModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="mb-4 sm:mb-6">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-yellow-500 mx-auto mb-3 sm:mb-4 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">¡CAMPEÓN!</h2>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 mb-3 sm:mb-4 break-words">
                {champion.nombre}
              </div>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                ¡Felicitaciones por conquistar el torneo!
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base">
              🏆 CAMPEÓN DEL TORNEO 🏆
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4 text-center">Cuadro Eliminatorio</h3>
        
        <div className="overflow-x-auto overflow-y-hidden">
          <div className="flex justify-start gap-6 p-2 min-w-max">
            {rounds.map((round, roundIndex) => (
              <div key={round.id} className="flex flex-col gap-3 justify-center flex-shrink-0">
                <div className="text-center font-semibold text-sm text-gray-700 mb-2 min-w-[160px]">
                  {round.nombre || `Ronda ${roundIndex + 1}`}
                </div>            
                <div className="flex flex-col gap-4">
                  {round.matches.map((match, matchIndex) => (
                    <div key={match.id} className="relative">
                      <div className="flex flex-col gap-1 border border-gray-300 p-2 rounded-md min-w-[160px] bg-gray-50">
                        {match.teams.map(teamId => (
                          <div 
                            key={teamId} 
                            className={`p-2 rounded text-sm transition-colors ${
                              match.winner === teamId 
                                ? 'bg-green-100 border border-green-300 font-semibold text-green-800' 
                                : match.winner && match.winner !== teamId
                                ? 'bg-red-50 text-gray-500 line-through'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{getTeamName(teamId)}</span>
                              {match.winner === teamId && (
                                <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 ml-1" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Línea conectora hacia la siguiente ronda */}
                      {roundIndex < rounds.length - 1 && (
                        <div className="absolute right-[-25px] top-1/2 transform -translate-y-1/2">
                          <div className="h-[1px] w-6 bg-gray-400"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Leyenda */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Ganador</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-50 border border-gray-200 rounded"></div>
            <span>Eliminado</span>
          </div>
        </div>
      </div>
    </>
  );
} 