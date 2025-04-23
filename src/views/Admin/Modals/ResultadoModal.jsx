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
    loading
  }) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Resultado del Partido</DialogTitle>
          </DialogHeader>
  
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-center mb-4">
              {equipoLocalNombre} {resumen.local.goles} - {resumen.visitante.goles} {equipoVisitanteNombre}
            </h3>
  
            <div className="grid grid-cols-2 gap-4">
              <div className="border-r pr-4">
                <h4 className="font-medium mb-2">{equipoLocalNombre}</h4>
                <div className="space-y-1">
                  <p>Amarillas: {resumen.local.amarillas}</p>
                  <p>Rojas: {resumen.local.rojas}</p>
                </div>
              </div>
  
              <div className="pl-4">
                <h4 className="font-medium mb-2">{equipoVisitanteNombre}</h4>
                <div className="space-y-1">
                  <p>Amarillas: {resumen.visitante.amarillas}</p>
                  <p>Rojas: {resumen.visitante.rojas}</p>
                </div>
              </div>
            </div>
          </div>
  
          <DialogFooter className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Confirmando...' : 'Confirmar Resultado'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  