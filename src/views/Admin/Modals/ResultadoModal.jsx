// components/ConfirmarResultadoModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function ConfirmarResultadoModal({
  isOpen,
  onClose,
  onConfirm,
  resumen,
  equipoLocalNombre,
  equipoVisitanteNombre,
  loading,
}) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
        isOpen ? 'visible' : 'invisible'
      }`}
      onClick={handleBackdropClick} // Detectar clics fuera del modal
    >
      <div
        className="bg-white p-6 rounded-[8px] shadow-lg w-[40%] justify-center flex"
        onClick={(e) => e.stopPropagation()} // Evitar que los clics dentro del modal cierren el modal
      >
        <div className="w-full">
          <div>
            <h1 className="text-xl font-semibold mb-6">
              Confirmar Resultado del Partido
            </h1>
          </div>

          <div className="mb-6">
            <div className="relative flex items-center justify-between mb-6">
              <h3 className="text-xl text-left capitalize w-1/3 truncate">{equipoLocalNombre}</h3>

              <h3 className="absolute left-1/2 -translate-x-1/2 text-xl text-center">
                {resumen.local.goles} - {resumen.visitante.goles}
              </h3>

              <h3 className="text-xl capitalize text-right w-1/3 truncate">{equipoVisitanteNombre}</h3>
            </div>

            <div className="grid grid-cols-[1fr_1fr] gap-0">
              <div className="border-r border-gray-300 pr-4 flex justify-center">
                <div className="space-y-1 text-center">
                  <p>
                    <span className="text-xs">🟨</span> Amarillas: {resumen.local.amarillas}
                  </p>
                  <p>
                    <span className="text-xs">🟥</span> Rojas: {resumen.local.rojas}
                  </p>
                </div>
              </div>

              <div className="pl-4 flex justify-center">
                <div className="space-y-1 text-center">
                  <p>
                    <span className="text-xs">🟨</span> Amarillas: {resumen.visitante.amarillas}
                  </p>
                  <p>
                    <span className="text-xs">🟥</span> Rojas: {resumen.visitante.rojas}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-200 rounded-[6px] hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-2 bg-blue-600 text-white rounded-[6px] hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Confirmando...' : 'Confirmar Resultado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
