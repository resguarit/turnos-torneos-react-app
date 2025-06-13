import { useEffect, useState } from 'react';
import api from '@/lib/axiosConfig';

export default function CrearPlayoffGruposModal({ open, onClose, onConfirm, loading, grupos = [], ultimaFecha, zonaId }) {
  const [fecha, setFecha] = useState(
    ultimaFecha ? new Date(new Date(ultimaFecha).getTime() + 7 * 24 * 60 * 60 * 1000) : null
  );
  const [gruposConEquipos, setGruposConEquipos] = useState([]);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);

  // Traer los grupos con equipos al abrir el modal
  useEffect(() => {
    if (!open || !zonaId) return;
    setLoadingGrupos(true);
    const fetchGrupos = async () => {
      try {
        const res = await api.get(`/zonas/${zonaId}/grupos`);
        setGruposConEquipos(res.data || []);
        setEquiposSeleccionados(Array.isArray(res.data) ? res.data.map(g => []) : []);
      } catch (e) {
        setGruposConEquipos([]);
        setEquiposSeleccionados([]);
      } finally {
        setLoadingGrupos(false);
      }
    };
    fetchGrupos();
  }, [open, zonaId]);

  const handleSelectEquipo = (grupoIdx, equipoId) => {
    setEquiposSeleccionados(prev => {
      const nuevo = [...prev];
      if (nuevo[grupoIdx].includes(equipoId)) {
        nuevo[grupoIdx] = nuevo[grupoIdx].filter(id => id !== equipoId);
      } else {
        nuevo[grupoIdx] = [...nuevo[grupoIdx], equipoId];
      }
      return nuevo;
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2">Generar Ronda Eliminatoria</h2>
        <p className="mb-4 text-gray-700 text-sm">
          Selecciona los equipos de cada grupo que avanzan a la ronda eliminatoria.
        </p>
        <div className="mb-4 flex flex-row gap-6 justify-center min-h-[180px]">
          {loadingGrupos ? (
            <div className="w-full flex justify-center items-center py-8">
              <span className="text-gray-500 text-base">Cargando grupos...</span>
            </div>
          ) : (
            gruposConEquipos.map((grupo, idx) => (
              <div key={grupo.id} className="mb-2 flex-1 min-w-[180px]">
                <div className="font-semibold mb-1 text-center">{grupo.nombre}</div>
                <div className="flex flex-col gap-2 items-center">
                  {grupo.equipos.map(equipo => (
                    <button
                      key={equipo.id}
                      className={`px-2 py-1 rounded border w-full text-center ${
                        equiposSeleccionados[idx]?.includes(equipo.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                      onClick={() => handleSelectEquipo(idx, equipo.id)}
                      type="button"
                    >
                      {equipo.nombre}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Fecha de inicio</label>
          <input
            type="date"
            value={fecha ? fecha.toISOString().slice(0, 10) : ''}
            onChange={e => setFecha(new Date(e.target.value))}
            className="w-full border border-gray-300 rounded p-2"
            disabled={loading}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className={`px-4 py-2 rounded bg-black text-white hover:bg-green-700 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            onClick={() => onConfirm(fecha, equiposSeleccionados)}
            disabled={loading || loadingGrupos || !fecha || equiposSeleccionados.some(arr => arr.length === 0)}
          >
            {loading ? "Creando..." : "Confirmar y Crear Playoff"}
          </button>
        </div>
      </div>
    </div>
  );
}