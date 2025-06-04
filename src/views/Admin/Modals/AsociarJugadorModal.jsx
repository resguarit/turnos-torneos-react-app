import React, { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { normalize } from "../../../utils/normalize"; 


export default function AsociarJugadorModal({
  isOpen,
  onClose,
  jugador,
  equipos,
  selectedEquipoId,
  setSelectedEquipoId,
  loading,
  onAsociar
}) {
  const [busquedaEquipo, setBusquedaEquipo] = useState("");

  // Reiniciar estado al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setBusquedaEquipo("");
      setSelectedEquipoId(null);
    }
  }, [isOpen, setSelectedEquipoId]);

  // Reiniciar estado después de asociar
  useEffect(() => {
    if (!loading && !isOpen) {
      setBusquedaEquipo("");
      setSelectedEquipoId(null);
    }
  }, [loading, isOpen, setSelectedEquipoId]);

  // Filtrado local de equipos por nombre
  const equiposFiltrados = useMemo(() => {
    if (!busquedaEquipo.trim()) return equipos;
    const term = normalize(busquedaEquipo.trim());
    return equipos.filter(
      (e) => e.nombre && normalize(e.nombre).includes(term)
    );
  }, [busquedaEquipo, equipos]);

  if (!isOpen) return null;

  const handleAsociar = () => {
    onAsociar();
    setBusquedaEquipo("");
    setSelectedEquipoId(null);
  };

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
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="Buscar equipo por nombre..."
            value={busquedaEquipo}
            onChange={e => setBusquedaEquipo(e.target.value)}
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto border rounded">
            {equiposFiltrados.length === 0 && (
              <div className="text-center text-gray-500 py-2 text-sm">
                No se encontraron equipos
              </div>
            )}
            {equiposFiltrados.map((equipo) => (
              <div
                key={equipo.id}
                className={`flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer ${
                  selectedEquipoId === equipo.id ? "bg-blue-100" : ""
                }`}
                onClick={() => setSelectedEquipoId(equipo.id)}
              >
                <span>{equipo.nombre}</span>
                {selectedEquipoId === equipo.id && (
                  <span className="text-xs text-blue-600 font-semibold">Seleccionado</span>
                )}
              </div>
            ))}
          </div>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            onClick={handleAsociar}
            disabled={loading || !selectedEquipoId}
          >
            {loading ? "Asociando..." : "Asociar"}
          </button>
        </div>
      </div>
    </div>
  );
}