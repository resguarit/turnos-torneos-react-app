import React, { useMemo, useEffect, useState } from "react";
import { X } from "lucide-react";

export default function AgregarJugadorAEquipoModal({
  isOpen,
  onClose,
  equipo,
  jugadores,
  loading,
  onAsociar
}) {
  const [busquedaJugador, setBusquedaJugador] = React.useState("");
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [confirm, setConfirm] = useState(false);

  // Reiniciar estado al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setBusquedaJugador("");
      setJugadorSeleccionado(null);
      setConfirm(false);
    }
  }, [isOpen]);

  const jugadoresFiltrados = useMemo(() => {
    if (!busquedaJugador.trim()) return jugadores;
    const term = busquedaJugador.trim().toLowerCase();
    return jugadores.filter(
      (j) =>
        (j.nombre && j.nombre.toLowerCase().includes(term)) ||
        (j.apellido && j.apellido.toLowerCase().includes(term)) ||
        (j.dni && j.dni.toString().includes(term))
    );
  }, [busquedaJugador, jugadores]);

  if (!isOpen) return null;

  const handleAsociar = () => {
    if (jugadorSeleccionado) {
      onAsociar(jugadorSeleccionado);
      setBusquedaJugador("");
      setJugadorSeleccionado(null);
      setConfirm(false);
    }
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
            Agregar jugador a {equipo?.nombre}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="py-2">
          {!confirm ? (
            <>
              <input
                className="w-full border rounded px-2 py-1 mb-2"
                placeholder="Buscar por nombre, apellido o DNI..."
                value={busquedaJugador}
                onChange={e => setBusquedaJugador(e.target.value)}
                autoFocus
              />
              {jugadoresFiltrados.length === 0 && (
                <div className="text-center text-gray-500 py-2 text-sm">No se encontraron jugadores</div>
              )}
              <div className="max-h-48 overflow-y-auto border rounded">
                {jugadoresFiltrados.map(jugador => (
                  <div
                    key={jugador.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <span>
                      {jugador.nombre} {jugador.apellido} • DNI: {jugador.dni}
                    </span>
                    <button
                      className="ml-2 px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                      onClick={() => {
                        setJugadorSeleccionado(jugador);
                        setConfirm(true);
                      }}
                      disabled={loading}
                    >
                      Asociar
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 text-center text-gray-700">
                ¿Seguro que deseas asociar a <b>{jugadorSeleccionado?.nombre} {jugadorSeleccionado?.apellido}</b> (DNI: {jugadorSeleccionado?.dni}) al equipo <b>{equipo?.nombre}</b>?
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded"
                  onClick={() => {
                    setConfirm(false);
                    setJugadorSeleccionado(null);
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                  onClick={handleAsociar}
                  disabled={loading}
                >
                  {loading ? "Asociando..." : "Confirmar"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}