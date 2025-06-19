import React, { useEffect, useState, useMemo } from "react";
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

  // Memo para detectar si existe partido por el tercer puesto
  const hasThirdPlace = useMemo(() => {
    if (rounds.length === 0) return false;
    const initialTeams = (rounds[0]?.matches?.length || 0) * 2;
    if (initialTeams === 0) return false;
    const expectedRoundsWithoutThird = Math.log2(initialTeams);
    return rounds.length === expectedRoundsWithoutThird + 1;
  }, [rounds]);

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

        // Verificar si hay un campeón (final jugada con ganador) - la final es siempre la última fecha
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

      <div className="p-4 bg-white rounded-lg shadow-md w-full">
        <h3 className="text-lg font-bold mb-4 text-center">Cuadro Eliminatorio</h3>
        
        <div className="overflow-x-auto overflow-y-hidden">
          <div className="flex justify-start gap-8 md:gap-10 p-2 min-w-max">
            {rounds.map((round, roundIndex) => {
              // Si hay tercer puesto y esta es la última ronda, se renderiza en la columna anterior
              if (hasThirdPlace && roundIndex === rounds.length - 1) return null;

              const isCombined = hasThirdPlace && roundIndex === rounds.length - 2;
              const innerRounds = isCombined
                ? [
                    { round, idx: roundIndex },
                    { round: rounds[roundIndex + 1], idx: roundIndex + 1 },
                  ]
                : [{ round, idx: roundIndex }];

              const columnKey = isCombined
                ? `${round.id}-${rounds[roundIndex + 1].id}`
                : round.id;

              return (
                <div key={columnKey} className="flex flex-col gap-4 justify-center flex-shrink-0">
                  {innerRounds.map(({ round: innerRound, idx: innerIdx }) => (
                    <React.Fragment key={innerRound.id}>
                      <div className="text-center font-semibold text-xs md:text-sm text-gray-700 mb-2 min-w-[140px] md:min-w-[200px]">
                        {innerRound.nombre || `Ronda ${innerIdx + 1}`}
                      </div>
                      <div className="flex flex-col gap-4">
                        {innerRound.matches.map((match, matchIndex) => (
                          <div key={match.id} className="relative">
                            <div className="flex flex-col gap-1 border border-gray-300 p-1 md:p-2 rounded-md min-w-[140px] md:min-w-[200px] bg-gray-50">
                              {match.teams.map((teamId) => (
                                <div
                                  key={teamId}
                                  className={`p-1 md:p-2 rounded text-xs md:text-sm transition-colors ${
                                    match.winner === teamId
                                      ? 'bg-green-100 border border-green-300 font-semibold text-green-800'
                                      : match.winner && match.winner !== teamId
                                      ? 'bg-red-50 text-gray-500 line-through'
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate max-w-[95px] md:max-w-none">
                                      {getTeamName(teamId)}
                                    </span>
                                    {match.winner === teamId && (
                                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-green-600 flex-shrink-0 ml-1" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Línea conectora hacia la siguiente ronda */}
                            {innerIdx < rounds.length - 1 && (
                              <div className="absolute right-[-20px] md:right-[-25px] top-1/2 transform -translate-y-1/2">
                                <div className="h-[1px] w-5 md:w-6 bg-gray-400"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              );
            })}
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