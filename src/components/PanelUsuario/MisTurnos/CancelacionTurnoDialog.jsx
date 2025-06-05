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

  // Lógica para determinar el mensaje de cancelación
  let notaCancelacion = null;
  if (turno && turno.horario) {
    const fechaCreacionTurno = new Date(turno.created_at);
    const fechaTurnoString = turno.fecha_turno_completa || `${turno.fecha_turno.split('T')[0]}T${turno.horario.hora_inicio}`;
    const fechaHoraTurno = new Date(fechaTurnoString);
    const treintaMinutosDespuesCreacion = new Date(fechaCreacionTurno.getTime() + 30 * 60000);
    const veinticuatroHorasAntesDelTurno = new Date(fechaHoraTurno.getTime() - 24 * 60 * 60 * 1000);

    if (turno.estado === 'Pendiente') {
      notaCancelacion = (
        <>
          <p className="font-semibold text-orange-800 text-base md:text-lg">Política de cancelación (Turno Pendiente):</p>
          <ul className="list-disc list-inside text-sm md:text-base text-orange-700 space-y-1 mt-2">
            <li>
              Puedes cancelar sin costo alguno dentro de los <strong>30 minutos</strong> posteriores a la realización de la reserva.
              El plazo vence el: {format(treintaMinutosDespuesCreacion, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}.
            </li>
            <li>
              Después de los 30 minutos, la cancelación implicará que se mantenga el saldo negativo en tu cuenta corriente por el total del turno.
            </li>
          </ul>
        </>
      );
    } else if (turno.estado === 'Señado') {
      notaCancelacion = (
        <>
          <p className="font-semibold text-blue-800 text-base md:text-lg">Política de cancelación (Turno Señado):</p>
          <ul className="list-disc list-inside text-sm md:text-base text-blue-700 space-y-1 mt-2">
            <li>
              Si cancelas con <strong>24 horas o más de anticipación</strong> al inicio del turno (antes del {format(veinticuatroHorasAntesDelTurno, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}) se te reintegrará el monto de la seña.
              Si la seña fue pagada por Mercado Pago, la devolución se procesará a través de ese medio.
            </li>
            <li>
              Si cancelas con <strong>menos de 24 horas de anticipación</strong> al inicio del turno (después del {format(veinticuatroHorasAntesDelTurno, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}) o durante el mismo día del turno, el complejo retendrá el monto de la seña.
            </li>
          </ul>
        </>
      );
    } else {
        notaCancelacion = (
            <p className="text-sm md:text-base text-gray-600">
                Contacta con la administración para conocer la política de cancelación para este turno.
            </p>
        );
    }
  } else if (turno) {
    notaCancelacion = (
        <p className="text-sm md:text-base text-red-600">
            No se pudo determinar la política de cancelación porque falta información del horario del turno. Por favor, contacta a soporte.
        </p>
    );
  }

  return (
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <DialogContent className="w-[90%] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto rounded-lg">
        <DialogHeader className="px-4 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-medium">¿Estás seguro que deseas cancelar este turno?</DialogTitle>
          <DialogDescription className="pt-2 sm:pt-4 space-y-3 sm:space-y-4 text-sm sm:text-base">
            {turno && (
              <>
                <div className="flex gap-2 items-center">
                  <Calendar className="size-4 sm:size-5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm">
                    <span className="font-bold">Reserva hecha el: </span>
                    {format(new Date(turno.created_at), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
                {turno.estado === 'Pendiente' && (
                  <div className="flex gap-2 items-center">
                    <Clock className="size-4 sm:size-5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm">
                      <span className="font-bold">Cancelar sin costo hasta:</span> {
                        format(
                          new Date(new Date(turno.created_at).getTime() + 30 * 60000),
                          "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          { locale: es }
                        )
                      }
                    </p>
                  </div>
                )}
              </>
            )}
            {notaCancelacion && (
              <div className={`p-3 sm:p-4 rounded-lg mt-3 sm:mt-4 ${turno?.estado === 'Pendiente' ? 'bg-orange-100' : turno?.estado === 'Señado' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {notaCancelacion}
              </div>
            )}
            <p className="text-xs sm:text-sm ">* Esta acción no se puede deshacer</p>
            <div className="mt-3 sm:mt-4">
              <label htmlFor="cancelReason" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Motivo de la cancelación (opcional)</label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base p-2"
                rows="2"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <Button 
            variant="outline"
            className="w-full sm:w-auto text-sm sm:text-base"
            onClick={() => setShowCancelModal(false)}
            disabled={isCancelling}
          >
            Volver
          </Button>
          <Button 
            variant="destructive"
            className="w-full sm:w-auto text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelacionTurnoDialog;