import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CancelacionTurnoDialog = ({ showCancelModal, setShowCancelModal, turno, handleCancelTurno, isCancelling }) => {
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = () => {
    handleCancelTurno(cancelReason);
  };

  return (
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <DialogContent className="sm:w-full max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">¿Estás seguro que deseas cancelar este turno?</DialogTitle>
          <DialogDescription className="pt-4 space-y-4">
            <div className="flex gap-2">
              <Calendar className="size-5" />
              <p className="text-sm">
                <span className="font-bold">Reserva hecha el: </span>{format(new Date(turno.created_at), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {locale:es})}
              </p>
            </div>
            <div className="flex gap-2">
              <Clock className="size-5" />
              <p className="text-sm">
                <span className="font-bold">Cancelar sin costo hasta:</span> {
                  format(
                    new Date(new Date(turno.created_at).getTime() + 30 * 60000),
                    "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", 
                    {locale:es}
                  )
                }
              </p>  
            </div>
            <p>Esta acción no se puede deshacer.</p>
            <div className="bg-orange-100 p-4 rounded-lg">
              <p className="font-semibold text-orange-800">Nota:</p>
              <p className="text-sm text-orange-700">
                Tienes 30 minutos después de hacer la reserva para cancelar la misma sin costo. 
                Pasados los 30 minutos hay un cargo por cancelación del 10% del total de la cancha.
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">Motivo de la cancelación (opcional)</label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 mt-4">
          <Button 
            className="w-full sm:w-24 bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => setShowCancelModal(false)}
            disabled={isCancelling}
          >
            Volver
          </Button>
          <Button 
            className="w-full sm:w-32 bg-red-500 text-white hover:bg-red-600"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelando...' : 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelacionTurnoDialog;