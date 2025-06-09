import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '@/lib/axiosConfig';
import { ChevronRight } from "lucide-react";
import ConfirmDeleteModal from "../Modals/ConfirmDeleteModal";

export default function ArañaEliminacion({ equipos }) {
  const { zonaId } = useParams();
  const [rounds, setRounds] = useState([]);
  const [selectedWinners, setSelectedWinners] = useState({});
  const [historicWinners, setHistoricWinners] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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

        setRounds(roundsData);
        setHistoricWinners(newHistoricWinners);
        setSelectedWinners({});
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

      // Guardar los ganadores actuales en el histórico (en memoria)
      setHistoricWinners(prev => ({
        ...prev,
        [rounds.length - 1]: { ...selectedWinners }
      }));

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
            winner: p.ganador_id || null
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
    const currentRound = rounds[rounds.length - 1];
    return currentRound.matches.every((_, index) =>
      selectedWinners.hasOwnProperty(`${rounds.length - 1}-${index}`)
    );
  };

  const isFinalRound = () => {
    if (!rounds.length) return false;
    const lastRound = rounds[rounds.length - 1];
    return lastRound.matches.length === 1 && lastRound.matches[0].teams.length === 2;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-2">Araña Eliminación</h3>
      <p className="text-xs mb-4 text-green-700 bg-green-200 p-1 border-l-2 border-green-500">
        Para avanzar a la siguiente ronda, debes seleccionar un ganador para cada partido de la ronda actual. Una vez seleccionados todos los ganadores, se generará automáticamente la nueva fecha con los nuevos cruces.
      </p>
      <div className="flex overflow-x-auto justify-center gap-8 p-4 relative">
        {rounds.map((round, roundIndex) => (
          <div key={round.id} className="flex flex-col gap-4 justify-center">
            <div className="text-center font-semibold ">{round.nombre || 'No definido'}</div>
            <div className="flex flex-col gap-6">
              {round.matches.map((match, matchIndex) => {
                // Usar historicWinners para todas las columnas menos la última, y selectedWinners solo para la última
                let winnerId = null;
                if (roundIndex === rounds.length - 1) {
                  winnerId = selectedWinners[`${roundIndex}-${matchIndex}`] ?? historicWinners[roundIndex]?.[`${roundIndex}-${matchIndex}`];
                } else {
                  winnerId = historicWinners[roundIndex]?.[`${roundIndex}-${matchIndex}`];
                }

                return (
                  <div key={match.id} className="relative">
                    <div className="flex flex-col gap-2 border p-2 rounded-[6px] min-w-[200px] bg-gray-50">
                      {match.teams.map(teamId => {
                        let className =
                          "p-2 rounded text-sm cursor-pointer transition-colors ";
                        if (winnerId) {
                          if (winnerId === teamId) {
                            className += "bg-green-100 border border-green-300 font-semibold text-green-800";
                          } else {
                            className += "bg-red-50 text-gray-500 line-through border border-gray-200";
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
                              roundIndex === rounds.length - 1 &&
                              !isFinalRound() &&
                              handleWinnerSelect(roundIndex, matchIndex, teamId)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{getTeamName(teamId)}</span>
                              {winnerId === teamId && (
                                <ChevronRight className="inline-block ml-2 text-green-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {roundIndex < rounds.length - 1 && (
                      <div className="absolute right-[-35px] top-1/2 transform -translate-y-1/2">
                        <div className="h-[1px] w-8 bg-gray-300"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Botón eliminar solo debajo de la última columna */}
            {roundIndex === rounds.length - 1 && (
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
        ))}
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
    </div>
  );
}
