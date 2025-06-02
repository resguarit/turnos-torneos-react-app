import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DesvincularJugadorModal({
  isOpen,
  onClose,
  jugador,
  equiposJugador,
  loading,
  onDesvincular
}) {
  const [equipoId, setEquipoId] = useState("");
  const [confirm, setConfirm] = useState(false);

  // Resetear estado cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setEquipoId("");
      setConfirm(false);
    }
  }, [isOpen, jugador]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white p-6 rounded-[8px] shadow-lg w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Desvincular de equipo: {jugador?.nombre} {jugador?.apellido}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        {!confirm ? (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm">Selecciona el equipo del que quieres desvincular:</label>
              <select
                className="w-full border rounded p-2"
                value={equipoId}
                onChange={e => setEquipoId(e.target.value)}
              >
                <option value="">Seleccionar equipo</option>
                {equiposJugador.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                ))}
              </select>
            </div>
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
              disabled={!equipoId}
              onClick={() => setConfirm(true)}
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 text-center text-gray-700">
              ¿Seguro que deseas desvincular a <b>{jugador?.nombre} {jugador?.apellido}</b> del equipo <b>{equiposJugador.find(eq => eq.id === Number(equipoId))?.nombre}</b>?
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                onClick={() => onDesvincular(Number(equipoId))}
                disabled={loading}
              >
                {loading ? "Desvinculando..." : "Desvincular"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}