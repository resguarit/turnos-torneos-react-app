import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";

export default function CrearPlayoffModal({ open, onClose, onConfirm, loading }) {
  const [fecha, setFecha] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
          <button
            className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-2">Crear Playoff en Liga</h2>
          <p className="mb-4 text-gray-700 text-sm">
            Esta acción creará <b>dos nuevas zonas eliminatorias</b> a partir de la zona actual: una de <b>Ganadores</b> (mitad superior de la tabla) y otra de <b>Perdedores</b> (mitad inferior). Cada zona tendrá una fecha inicial y los cruces se armarán según la posición final de los equipos (1° vs último, 2° vs anteúltimo, etc).
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Fecha de inicio del playoff</label>
            <div className="relative">
              <button
                type="button"
                className="py-2 px-3 flex items-center gap-2 rounded-[6px] text-sm bg-blue-500 hover:bg-blue-600 text-white w-full"
                onClick={() => setCalendarOpen(!calendarOpen)}
                disabled={loading}
              >
                {fecha
                  ? format(fecha, "d 'de' MMMM yyyy", { locale: es })
                  : "Seleccionar fecha"}
              </button>
              {calendarOpen && (
                <div className="absolute z-50 bg-white shadow-lg rounded-md p-2 border mt-2 left-0">
                  <DayPicker
                    mode="single"
                    selected={fecha}
                    onSelect={(date) => {
                      setFecha(date);
                      setCalendarOpen(false);
                    }}
                    locale={es}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className={`px-4 py-2 rounded bg-black text-white hover:bg-green-700 ${(!fecha || loading) ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => onConfirm(fecha)}
              disabled={!fecha || loading}
            >
              {loading ? "Creando..." : "Confirmar y Crear Playoff"}
            </button>
          </div>
        </div>
      </div>
    )
  );
}