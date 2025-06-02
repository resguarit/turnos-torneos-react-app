import React from "react";
import { X } from "lucide-react";


export default function AsociarJugadorModal({
  isOpen,
  onClose,
  jugador,
  equipos,
  selectedEquipoId,
  setSelectedEquipoId,
  asignarCapitan,
  setAsignarCapitan,
  loading,
  onAsociar
}) {
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
            Asociar a equipo: {jugador?.nombre} {jugador?.apellido}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <select
            className="w-full border rounded p-2"
            value={selectedEquipoId ? selectedEquipoId.toString() : ""}
            onChange={e => setSelectedEquipoId(Number(e.target.value))}
          >
            <option value="">Seleccionar equipo</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="asignar-capitan"
              checked={asignarCapitan}
              onChange={() => setAsignarCapitan(!asignarCapitan)}
            />
            <label htmlFor="asignar-capitan" className="text-sm text-gray-700">
              Asignar como capitán
            </label>
          </div>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            onClick={onAsociar}
            disabled={loading}
          >
            {loading ? "Asociando..." : "Asociar"}
          </button>
        </div>
      </div>
    </div>
  );
}