import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { parseISO, addMinutes, differenceInHours, isBefore } from 'date-fns';
// import { es } from 'date-fns/locale'; // es locale ya está en dateUtils
import {
  formatearFechaCompleta, // Se mantiene por si se usa directamente en otro lugar, aunque formatearFechaYHoraDetallada es la principal aquí
  formatearHora as formatearHoraUtil, // Se mantiene por si se usa directamente
  formatearMonto,
  formatearFechaYHoraDetallada // Nueva función importada
} from '../../../utils/dateUtils';
import { AlertCircle } from 'lucide-react'; // Para un posible ícono de advertencia

const CancelacionTurnoAdminModal = ({ isOpen, onClose, onConfirm, turno }) => {
  if (!turno) return null;

  const {
    created_at,
    fecha_turno,
    horario,
    monto_total,
    monto_seña,
    estado,
    usuario,
  } = turno;

  const now = new Date();
  const fechaReserva = created_at ? parseISO(created_at) : null;
  let fechaHoraInicioTurno = null;
  if (fecha_turno && horario && horario.hora_inicio) {
    try {
      const fechaParte = fecha_turno.split('T')[0];
      fechaHoraInicioTurno = parseISO(`${fechaParte}T${horario.hora_inicio}`);
    } catch (e) {
      console.error("Error parsing turno date/time:", e);
    }
  }

  let politicasMessages = [];
  if (estado === 'Pendiente') {
    if (fechaReserva) {
      const limiteCancelacionSinCosto = addMinutes(fechaReserva, 30);
      if (isBefore(now, limiteCancelacionSinCosto)) {
        politicasMessages.push(<><strong>Cancelación temprana (dentro de los 30 min):</strong> Puede cancelar sin costo hasta {formatearFechaYHoraDetallada(limiteCancelacionSinCosto.toISOString())}.</>);
        politicasMessages.push(<>Al cancelar, se ajustará la cuenta corriente del cliente revirtiendo el cargo total de <strong>${formatearMonto(monto_total)}</strong>.</>);
      } else {
        politicasMessages.push(<strong>Cancelación tardía (Pendiente - más de 30 min desde reserva):</strong>);
        politicasMessages.push(<>Según la política actual, al cancelar se ajustará la cuenta corriente del cliente (generalmente revirtiendo el cargo total de <strong>${formatearMonto(monto_total)}</strong>).</>);
      }
    } else {
      politicasMessages.push(<strong>No se pudo determinar el plazo de cancelación sin costo (fecha de reserva no disponible).</strong>);
    }
  } else if (estado === 'Señado') {
    if (fechaHoraInicioTurno) {
      const horasAnticipacion = differenceInHours(fechaHoraInicioTurno, now);
      if (horasAnticipacion >= 24) {
        const limiteDevolucion = new Date(fechaHoraInicioTurno.getTime() - 24 * 60 * 60 * 1000);
        politicasMessages.push(<><strong>Cancelación con anticipación (&gt;= 24hs):</strong> Puede cancelar con devolución de seña hasta {formatearFechaYHoraDetallada(limiteDevolucion.toISOString())}.</>);
        politicasMessages.push(<>Se devolverá la seña de <strong>${formatearMonto(monto_seña)}</strong>. Si el pago fue por Mercado Pago, la devolución se gestionará automáticamente. Si fue manual, se registrará la transacción de devolución en caja.</>);
        politicasMessages.push("La deuda restante en la cuenta corriente del cliente (si existe) será anulada.");
      } else {
        politicasMessages.push(<strong>Cancelación con poca anticipación (&lt; 24hs):</strong>);
        politicasMessages.push(<>El complejo retendrá la seña de <strong>${formatearMonto(monto_seña)}</strong>.</>);
        politicasMessages.push("La deuda restante en la cuenta corriente del cliente (si existe) será anulada.");
      }
    } else {
      politicasMessages.push(<strong>No se pudo determinar las condiciones de devolución de seña (datos del turno incompletos).</strong>);
    }
  } else {
    politicasMessages.push(`El turno está en estado '${estado}'. La cancelación seguirá las políticas generales.`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Confirmar Cancelación de Turno</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Por favor, revise los detalles y políticas de cancelación antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="border rounded-md p-6 space-y-4">
            <h4 className="font-medium text-gray-800 text-lg mb-3">Detalles del Turno:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between md:justify-start items-start text-sm">
                <span className="text-gray-600 shrink-0 mr-2">Cliente:</span>
                <span className="font-medium text-gray-900  ">{usuario?.nombre || 'No especificado'}</span>
              </div>
              <div className="flex justify-between md:justify-start items-start text-sm">
                <span className="text-gray-600 shrink-0 mr-2">Estado actual:</span>
                <span className="font-medium text-gray-900 text-right">{estado}</span>
              </div>
              <div className="flex justify-between md:justify-start items-start text-sm">
                <span className="text-gray-600 shrink-0 mr-2">Turno para el:</span>
                <span className="font-medium text-gray-900 text-right break-words">{fechaHoraInicioTurno ? formatearFechaYHoraDetallada(fechaHoraInicioTurno.toISOString()) : 'No disponible'}</span>
              </div>
              {fechaReserva && (
                <div className="flex justify-between md:justify-start items-start text-sm">
                  <span className="text-gray-600 shrink-0 mr-2">Reserva hecha el:</span>
                  <span className="font-medium text-gray-900 text-right break-words">{fechaReserva ? formatearFechaYHoraDetallada(fechaReserva.toISOString()) : 'No disponible'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-md p-6 space-y-4">
            <h4 className="font-medium text-gray-800 text-lg mb-3">Condiciones de Cancelación:</h4>
            <div className="space-y-4">
              {politicasMessages.map((msg, index) => (
                <p key={index} className={`text-sm ${index === 0 ? 'text-gray-800 font-medium' : 'text-gray-700'} leading-relaxed bg-gray-50 p-3 rounded-md`}>
                  {msg}
                </p>
              ))}
            </div>
          </div>
        </div>

        <p className="text-base font-semibold text-center text-gray-800 mt-4 mb-6">
          ¿Está seguro de que desea cancelar este turno?
        </p>
        <DialogFooter className="gap-4 sm:gap-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 rounded-md transition-colors w-full sm:w-auto px-6 py-5 text-base"
          >
            Volver
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors w-full sm:w-auto px-6 py-5 text-base"
          >
            Confirmar Cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelacionTurnoAdminModal; 