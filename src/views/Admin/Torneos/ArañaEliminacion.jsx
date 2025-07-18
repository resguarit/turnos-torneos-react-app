import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from '@/lib/axiosConfig';
import { ChevronRight } from "lucide-react";
import ConfirmDeleteModal from "../Modals/ConfirmDeleteModal";
import React from "react";

export default function ArañaEliminacion({ equipos }) {
  const { zonaId } = useParams();
  const [rounds, setRounds] = useState([]);
  const [selectedWinners, setSelectedWinners] = useState({});
  const [historicWinners, setHistoricWinners] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showThirdPlaceModal, setShowThirdPlaceModal] = useState(false);
  const [pendingRoundData, setPendingRoundData] = useState(null);
  const [pendingLosers, setPendingLosers] = useState([]);

  // Determinar si existe partido por el tercer puesto
  const hasThirdPlace = useMemo(() => {
    if (rounds.length === 0) return false;
    const initialTeams = (rounds[0]?.matches?.length || 0) * 2;
    if (initialTeams === 0) return false;
    const expectedRoundsWithoutThird = Math.log2(initialTeams);
    // Si rounds.length excede en 1 al número mínimo esperado, asumimos tercer puesto
    return rounds.length === expectedRoundsWithoutThird + 1;
  }, [rounds]);

  // Cargar ganadores históricos desde el backend
  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await api.get(`/zonas/${zonaId}/fechas`);
        const eliminatoriaFechas = response.data.sort((a, b) =>
          new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
        );
        const roundsData = eliminatoriaFechas.map(fecha => ({
          id: fecha.id,
          nombre: fecha.nombre,
          matches: fecha.partidos.map(p => ({
            id: p.id,
            teams: [p.equipo_local_id, p.equipo_visitante_id],
            winner: p.ganador_id || null // <-- El backend debe devolver el ganador del partido si existe
          }))
        }));

        // Construir historicWinners a partir de los partidos que ya tienen ganador
        const newHistoricWinners = {};
        roundsData.forEach((round, roundIndex) => {
          round.matches.forEach((match, matchIndex) => {
            if (match.winner) {
              if (!newHistoricWinners[roundIndex]) newHistoricWinners[roundIndex] = {};
              newHistoricWinners[roundIndex][`${roundIndex}-${matchIndex}`] = match.winner;
            }
          });
        });

        // Detectar ganadores ya definidos en la ronda actual para autoseleccionarlos
        const currentRoundIndex = roundsData.length - 1;
        const autoSelected = newHistoricWinners[currentRoundIndex] || {};

        setRounds(roundsData);
        setHistoricWinners(newHistoricWinners);
        setSelectedWinners(autoSelected);
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

      // Calcular perdedores para la ronda actual
      const losers = currentRound.matches.map((match, index) => {
        const winnerId = selectedWinners[`${rounds.length - 1}-${index}`];
        return match.teams.find(teamId => teamId !== winnerId);
      });

      // Guardar datos temporalmente
      setPendingRoundData({
        fecha_anterior_id: currentRound.id,
        winners,
        losers
      });

      // Guardar en histórico
      setHistoricWinners(prev => ({
        ...prev,
        [rounds.length - 1]: { ...selectedWinners }
      }));

      // Si es semifinal (4 equipos -> 2 partidos), preguntar por tercer puesto
      if (winners.length === 2 && currentRound.matches.length === 2) {
        setPendingLosers(losers);
        setShowThirdPlaceModal(true);
        setLoading(false);
        return;
      }

      // Si no necesita confirmación, generar directamente
      await generateNextRound({
        fecha_anterior_id: currentRound.id,
        winners,
        crear_tercer_puesto: false,
        perdedores: []
      });
      
    } catch (error) {
      console.error('Error generating next round:', error);
      setLoading(false);
    }
  };
  // Función para generar la ronda con parámetros
  const generateNextRound = async (data) => {
    try {
      setLoading(true);
      const response = await api.post(`/zonas/${zonaId}/siguiente-ronda`, {
        ...data,
        crear_tercer_puesto: data.crear_tercer_puesto || false,
        perdedores: data.perdedores || []
      });

      // Manejar respuesta (puede devolver 1 o 2 fechas)
      const createdRounds = response.data.fechas || [response.data.fecha];
      
      const newRounds = createdRounds.map(fecha => ({
        id: fecha.id,
        nombre: fecha.nombre,
        matches: fecha.partidos.map(p => ({
          id: p.id,
          teams: [p.equipo_local_id, p.equipo_visitante_id],
          winner: p.ganador_id || null
        }))
      }));

      setRounds([...rounds, ...newRounds]);
      setSelectedWinners({});
      
    } catch (error) {
      console.error('Error generating next round:', error);
    } finally {
      setLoading(false);
    }
  };
  
   // Confirmar generación con tercer puesto
  const handleConfirmThirdPlace = (includeThirdPlace) => {
    setShowThirdPlaceModal(false);
    generateNextRound({
      ...pendingRoundData,
      crear_tercer_puesto: includeThirdPlace,
      perdedores: pendingLosers // SIEMPRE pasa los perdedores
    });
  };

  const handleDeleteFecha = async () => {
    if (!rounds.length) return;
    const lastFecha = rounds[rounds.length - 1];
    try {
      setLoadingDelete(true);
      await api.delete(`/fechas/${lastFecha.id}`);
      setRounds(rounds.slice(0, -1));
      setShowDeleteModal(false);
      // También eliminar del histórico
      setHistoricWinners(prev => {
        const copy = { ...prev };
        delete copy[rounds.length - 1];
        return copy;
      });
    } catch (error) {
      console.error('Error deleting fecha:', error);
    } finally {
      setLoadingDelete(false);
    }
  };

  const getTeamName = (teamId) => {
    return equipos.find(e => e.id === teamId)?.nombre || 'Desconocido';
  };

  const canGenerateNextRound = () => {
    if (!rounds.length) return false;
    const initialTeams = (rounds[0]?.matches?.length || 0) * 2;
    if (initialTeams === 0) return false;
    const expectedRoundsWithoutThird = Math.log2(initialTeams);
    if (rounds.length >= expectedRoundsWithoutThird) {
      return false;
    }
    const currentRound = rounds[rounds.length - 1];
    return currentRound.matches.every((_, index) =>
      selectedWinners.hasOwnProperty(`${rounds.length - 1}-${index}`)
    );
  };

  const isFinalRound = () => {
    if (!rounds.length) return false;
    const finalRound = rounds[rounds.length - 1];
    return (
      finalRound &&
      finalRound.matches.length === 1 &&
      finalRound.matches[0].teams.length === 2
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-2">Araña Eliminación</h3>
      <p className="text-xs mb-4 text-green-700 bg-green-200 p-1 border-l-2 border-green-500">
        Para avanzar a la siguiente ronda, debes seleccionar un ganador para cada partido de la ronda actual. Una vez seleccionados todos los ganadores, se generará automáticamente la nueva fecha con los nuevos cruces.
      </p>
      <div className="flex overflow-x-auto justify-start gap-8 md:gap-10 p-4 relative">
        {rounds.map((round, roundIndex) => {
          // Si hay tercer puesto y esta es la última ronda, se renderea junto con la anterior
          if (hasThirdPlace && roundIndex === rounds.length - 1) {
            return null; // Se renderiza en la columna anterior
          }

          const isCombinedColumn = hasThirdPlace && roundIndex === rounds.length - 2;
          const innerRounds = isCombinedColumn
            ? [
                { round, idx: roundIndex },
                { round: rounds[roundIndex + 1], idx: roundIndex + 1 },
              ]
            : [{ round, idx: roundIndex }];

          const columnKey = isCombinedColumn
            ? `${round.id}-${rounds[roundIndex + 1].id}`
            : round.id;

          const isLastColumn =
            (!hasThirdPlace && roundIndex === rounds.length - 1) ||
            (hasThirdPlace && roundIndex === rounds.length - 2);

          return (
            <div key={columnKey} className="flex flex-col gap-4 justify-center">
              {innerRounds.map(({ round: innerRound, idx: innerIdx }) => (
                <React.Fragment key={innerRound.id}>
                  <div key={`${innerRound.id}-title`} className="text-center font-semibold ">
                    {innerRound.nombre || 'No definido'}
                  </div>
                  <div key={`${innerRound.id}-matches`} className="flex flex-col gap-6">
                    {innerRound.matches.map((match, matchIndex) => {
                      // Usar historicWinners para todas las columnas menos la última, y selectedWinners solo para la última
                      let winnerId = null;
                      if (innerIdx === rounds.length - 1) {
                        winnerId =
                          selectedWinners[`${innerIdx}-${matchIndex}`] ??
                          historicWinners[innerIdx]?.[`${innerIdx}-${matchIndex}`];
                      } else {
                        winnerId = historicWinners[innerIdx]?.[`${innerIdx}-${matchIndex}`];
                      }

                      return (
                        <div key={match.id} className="relative">
                          <div className="flex flex-col gap-1 md:gap-2 border p-1 md:p-2 rounded-[6px] min-w-[140px] md:min-w-[200px] bg-gray-50">
                            {match.teams.map((teamId) => {
                              let className =
                                "p-1 md:p-2 rounded text-xs md:text-sm cursor-pointer transition-colors ";
                              if (winnerId) {
                                if (winnerId === teamId) {
                                  className +=
                                    "bg-green-100 border border-green-300 font-semibold text-green-800";
                                } else {
                                  className +=
                                    "bg-red-50 text-gray-500 line-through border border-gray-200";
                                }
                              } else {
                                className += isFinalRound()
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-white border border-gray-200 hover:bg-gray-200";
                              }
                              return (
                                <div
                                  key={teamId}
                                  className={className}
                                  onClick={() =>
                                    innerIdx === rounds.length - 1 &&
                                    !isFinalRound() &&
                                    handleWinnerSelect(innerIdx, matchIndex, teamId)
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate max-w-[95px] md:max-w-none">{getTeamName(teamId)}</span>
                                    {winnerId === teamId && (
                                      <ChevronRight className="inline-block ml-1 md:ml-2 text-green-500 w-3 h-3 md:w-4 md:h-4" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {innerIdx < rounds.length - 1 && (
                            <div className="absolute right-[-20px] md:right-[-35px] top-1/2 transform -translate-y-1/2">
                              <div className="h-[1px] w-5 md:w-8 bg-gray-300"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}

              {/* Botón eliminar sólo debajo de la última columna visual */}
              {isLastColumn && (
                <div className="flex justify-center mt-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-[6px] text-sm"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={loadingDelete}
                  >
                    {loadingDelete ? "Eliminando..." : "Eliminar Fecha"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {/* Botón generar siguiente ronda a la derecha de la última columna */}
        {rounds.length > 0 && canGenerateNextRound() && (
          <div className="flex flex-col justify-center items-center ml-8">
            <button
              onClick={handleGenerateNextRound}
              className="bg-blue-500 text-white px-4 py-2 rounded-[6px] hover:bg-blue-600 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Generar Siguiente Ronda'}
            </button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteFecha}
        loading={loadingDelete}
        accionTitulo="eliminación"
        accion="eliminar"
        pronombre="la"
        entidad="fecha"
        accionando="Eliminando"
        nombreElemento={rounds.length > 0 ? rounds[rounds.length - 1].nombre : undefined}
      />

        {/* Modal para tercer puesto */}
      {showThirdPlaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-bold mb-4">Generar Final</h3>
            <p>¿Deseas crear un partido por el tercer puesto?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => handleConfirmThirdPlace(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleConfirmThirdPlace(true)}
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
