import React, { useState, useEffect } from 'react';
import { Trash2, PenSquare, Phone, DollarSign, AlertCircle, X, Eye, Calendar, Clock, User, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RegistrarPagoTurnoDialog from './RegistrarPagoTurnoDialog';
import InfoPagoTurnoDialog from './InfoPagoTurnoDialog';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import RegistrarPagoEventoDialog from './RegistrarPagoEventoDialog';
import { formatearFechaCompleta, formatearRangoHorario } from '@/utils/dateUtils';

const TurnoCard = ({ booking, handleDeleteSubmit, onPagoRegistrado, eventosPagados }) => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [verificandoCaja, setVerificandoCaja] = useState(false);
  const [cajaError, setCajaError] = useState(false);
  const [showPagoEvento, setShowPagoEvento] = useState(false);

  // Determinar si el evento está pagado usando eventosPagados
  const eventoPagado = booking.tipo === 'evento' && booking.evento_id && eventosPagados?.[booking.evento_id] === true;

  const handlePagoRegistrado = (data) => {
    // Si el pago fue exitoso, notificamos al componente padre para que actualice
    if (onPagoRegistrado) {
      onPagoRegistrado(data);
    }
  };

  // Obtener el nombre a mostrar
  const getNombreTurno = () => {
    if (booking.tipo === 'evento') {
      return `Evento: ${booking.nombre} (${booking.persona.name})`;
    }
    if (booking.tipo === 'torneo' && booking.partido) {
      const torneoNombre = booking.partido.fecha.zona.torneo.nombre || 'Sin torneo';
      const zonaNombre = booking.partido.fecha.zona.nombre || 'Sin zona';
      const fechaNombre = booking.partido.fecha.nombre || 'Sin fecha';
      return `${torneoNombre} - ${zonaNombre} - ${fechaNombre}`;
    }
    return booking.usuario?.nombre || booking.persona?.name || 'Sin nombre';
  };

  const verificarCajaAbierta = async () => {
    setVerificandoCaja(true);
    setCajaError(false);
    try {
      const response = await api.get('/caja-abierta');
      if (response.data && response.data.status === 200) {
        if (booking.tipo === 'evento') {
          setShowPagoEvento(true);
        } else {
          setShowPaymentModal(true);
        }
      } else {
        setCajaError(true);
      }
    } catch (error) {
      console.error('Error al verificar caja abierta:', error);
      setCajaError(true);
    } finally {
      setVerificandoCaja(false);
    }
  };

  const handlePagoClick = () => {
    // Si el turno está pagado o cancelado, o es un evento pagado, mostrar modal de información
    if (booking.estado === 'Pagado' || booking.estado === 'Cancelado' || eventoPagado) {
      // Para eventos pagados, no mostrar el modal de información
      if (booking.tipo === 'evento' && eventoPagado) {
        return; // No hacer nada si es un evento pagado
      }
      setShowInfoModal(true);
    } else {
      // Si no está pagado ni cancelado, verificar caja y mostrar modal de registro
      verificarCajaAbierta();
    }
  };

  const fecha_modificacion = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  const fecha_turno = new Date(booking.fecha_turno);

  return (
    <div
      key={booking.id}
      className="bg-white rounded-[8px] shadow-sm p-4 w-full h-full flex flex-col"
    >
      {/* INFORMACIÓN ARRIBA */}
      <div>
        <div className="flex justify-between items-start w-full">
          <div className="flex-1">
            <h3 className="font-semibold text-lg capitalize">{getNombreTurno()}</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Horario:</span>
              <p className="text-sm font-medium text-gray-500">{formatearRangoHorario(booking.horario.hora_inicio, booking.horario.hora_fin)}</p>
            </div>
            {booking.tipo !== 'torneo' && booking.tipo !== 'evento' && (
              <>
                <p className="text-sm font-medium text-gray-800">
                  {`Monto total: ${booking.monto_total !== undefined && booking.monto_total !== null ? `$${booking.monto_total}` : 'No definido'}`}
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {`Monto seña: ${booking.monto_seña !== undefined && booking.monto_seña !== null ? `$${booking.monto_seña}` : 'No definido'}`}
                </p>
              </>
            )}
            {booking.tipo === 'evento' && (
              <>
                <p className="text-sm font-medium text-gray-800">
                  {`Descripción: ${booking.descripcion}`}
                </p>
              <p className="text-sm font-medium text-gray-800">
                  {`Monto: ${booking.monto !== undefined && booking.monto !== null ? `$${booking.monto}` : 'No definido'}`}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full mt-2 mb-4">
          {booking.tipo === 'fijo' && booking.estado !== 'Cancelado' && (
            <span className="text-center px-3 py-1 bg-blue-400 rounded-xl text-sm">
              {`Turno fijo`}
            </span>
          )}
            <span
              className={`text-center px-3 py-1 rounded-xl capitalize text-sm ${
                (booking.estado === 'Pagado' || eventoPagado)
                  ? 'bg-green-300'
                  : booking.estado === 'Pendiente'
                  ? 'bg-yellow-300'
                  : booking.estado === 'Señado'
                  ? 'bg-blue-300'
                  : 'bg-red-300'
              }`}
            >
              {`Estado: ${eventoPagado ? 'Pagado' : booking.estado}`}
            </span>
          {/* Mostrar canchas para eventos o para turnos normales */}
          {booking.tipo === 'evento' && booking.canchas && booking.canchas.length > 0 ? (
            booking.canchas.map(c => (
              <span key={c.id} className="text-center px-3 py-1 bg-gray-300 rounded-xl text-sm">
                {`Cancha ${c.nro} - ${c.tipo || c.tipo_cancha}`}
              </span>
            ))
          ) : booking.cancha ? (
            <span className="text-center px-3 py-1 bg-gray-300 rounded-xl text-sm">
              {`Cancha ${booking.cancha.nro} - ${booking.cancha.tipo_cancha}`}
            </span>
          ) : null}
        </div>
      </div>

      {/* BOTONES SIEMPRE ABAJO */}
      <div className="flex gap-2 justify-center w-full mt-auto">
        {booking.estado !== 'Cancelado' && booking.estado !== 'Pagado' && booking.tipo !== 'torneo' && !eventoPagado && (
          <button
            onClick={() => handleDeleteSubmit(booking)}
            size="icon"
            className="bg-red-600 rounded-[4px] hover:bg-naranja/90 text-white p-2 transition-colors duration-200"
            disabled={verificandoCaja}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        {booking.tipo !== 'torneo' && (
          <div className="flex gap-2 justify-center ">
            <button
              onClick={() => {
                const telefono = booking.tipo === 'evento'
                  ? booking.persona?.telefono
                  : booking.usuario?.telefono;
                if (telefono) {
                  window.open(`https://api.whatsapp.com/send?phone=549${telefono}`, '_blank');
                } else {
                  toast.error('No se encontró un teléfono para este turno');
                }
              }}
              size="icon"
              className="bg-green-500 rounded-[4px] hover:bg-green-600 text-white p-2 transition-colors duration-200"
              disabled={verificandoCaja}
            >
              <Phone className="h-4 w-4" />
            </button>
            {booking.tipo !== 'torneo' && booking.tipo !== 'evento' && (
              <button
                size="icon"
                className="rounded-[4px] bg-blue-600 hover:bg-naranja/90 text-white p-2 transition-colors duration-200"
              onClick={() => navigate(`/editar-turno/${booking.id}`)}
              disabled={verificandoCaja}
            >
                <PenSquare className="h-4 w-4" /> 
              </button>
            )}
          </div>
        )}
        
        {/* Botón de pago/información - No mostrar para eventos pagados */}
        {/* Si es un evento pagado, no mostramos ningún botón */}
        {!(booking.tipo === 'evento' && eventoPagado) && (
          <button
            onClick={handlePagoClick}
            disabled={verificandoCaja}
            className={`flex rounded-[4px] flex-row gap-2 items-center text-white p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              (booking.estado === 'Pagado' || booking.estado === 'Cancelado')
                ? 'bg-blue-600 hover:bg-blue-700' // Estilo para "Ver Información"
                : 'bg-emerald-500 hover:bg-emerald-600' // Estilo para "Registrar Pago"
            }`}
          >
            {(booking.estado === 'Pagado' || booking.estado === 'Cancelado') ? (
              <>
                <Eye className="h-4 w-4" />
                Ver Información
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                {verificandoCaja ? 'Verificando caja...' : 'Registrar Pago'}
              </>
            )}
          </button>
        )}
      </div>

      {/* Modal para registrar pago (cuando NO está pagado ni cancelado) */}
      <RegistrarPagoTurnoDialog
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setVerificandoCaja(false);
        }}
        turno={booking}
        onPagoRegistrado={handlePagoRegistrado}
      />

      {/* Modal para ver información de pago (cuando SÍ está pagado) */}
      <InfoPagoTurnoDialog
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        turno={booking}
      />

      {/* Dialog para error de caja cerrada */}
      <Dialog open={cajaError} onOpenChange={(open) => {
        setCajaError(open);
        if (!open) setVerificandoCaja(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </DialogTitle>
            <DialogDescription className="pt-2">
              No se puede registrar el pago porque la caja no está abierta. Por favor, abra la caja antes de continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setCajaError(false);
                setVerificandoCaja(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <RegistrarPagoEventoDialog
        isOpen={showPagoEvento}
        onClose={() => setShowPagoEvento(false)}
        evento={booking}
        onPagoRegistrado={handlePagoRegistrado}
      />
    </div>
  );
};

export default TurnoCard;