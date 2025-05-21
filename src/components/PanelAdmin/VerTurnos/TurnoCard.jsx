import React, { useState, useEffect } from 'react';
import { Trash2, PenSquare, Phone, DollarSign, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RegistrarPagoTurnoDialog from './RegistrarPagoTurnoDialog';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import RegistrarPagoEventoDialog from './RegistrarPagoEventoDialog';

const TurnoCard = ({ booking, handleDeleteSubmit, onPagoRegistrado }) => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [verificandoCaja, setVerificandoCaja] = useState(false);
  const [cajaError, setCajaError] = useState(false);
  const [showPagoEvento, setShowPagoEvento] = useState(false);
  const [eventoPagado, setEventoPagado] = useState(false);

  useEffect(() => {
    const fetchEstadoPago = async () => {
      if (booking.tipo === 'evento') {
        try {
          const res = await api.get(`/estadoPago/evento/${booking.evento_id}`);
          setEventoPagado(res.data?.estado_pago === true);
        } catch {
          setEventoPagado(false);
        }
      }
    };
    fetchEstadoPago();
  }, [booking]);

  const handlePagoRegistrado = (data) => {
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
        setShowPaymentModal(true);
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

  const fecha_modificacion = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  const fecha_turno = new Date(booking.fecha_turno);

  return (
    <div
      key={booking.id}
      className="bg-white rounded-[8px] shadow-sm p-4 space-y-4 w-full"
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex-1">
          <h3 className="font-semibold text-lg capitalize">{getNombreTurno()}</h3>
          <p className="text-sm font-medium text-gray-500">{`${booking.horario.hora_inicio} - ${booking.horario.hora_fin}`}</p>
          <p className="text-sm font-medium text-gray-800">
            {`Monto total: ${booking.monto_total !== undefined && booking.monto_total !== null ? `$${booking.monto_total}` : 'No definido'}`}
          </p>
          <p className="text-sm font-medium text-gray-800">
            {`Monto seña: ${booking.monto_seña !== undefined && booking.monto_seña !== null ? `$${booking.monto_seña}` : 'No definido'}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        {booking.tipo === 'fijo' && (
          <span className="text-center px-3 py-1 bg-blue-400 rounded-xl text-sm">
            {`Turno fijo`}
          </span>
        )}
        {booking.tipo !== 'fijo' && (
          <span
            className={`text-center px-3 py-1 rounded-xl capitalize text-sm ${
              booking.estado === 'Pendiente'
                ? 'bg-yellow-300'
                : booking.estado === 'Señado'
                ? 'bg-blue-300'
                : booking.estado === 'Pagado'
                ? 'bg-green-300'
                : 'bg-red-300'
            }`}
          >
            {`Estado: ${booking.estado}`}
          </span>
        )}
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

      <div className="flex gap-2 justify-center w-full">
        {booking.estado !== 'Cancelado' && (
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
            <button
              size="icon"
              className="rounded-[4px] bg-blue-600 hover:bg-naranja/90 text-white p-2 transition-colors duration-200"
              onClick={() => navigate(`/editar-turno/${booking.id}`)}
              disabled={verificandoCaja}
            >
              <PenSquare className="h-4 w-4" /> 
            </button>
          </div>
        )}
        {/* SOLO mostrar el botón si NO está pagado (para eventos) */}
        {booking.estado !== 'Pagado' &&
          booking.estado !== 'Cancelado' &&
          fecha_turno > fecha_modificacion &&
          booking.tipo !== 'fijo' &&
          (!eventoPagado || booking.tipo !== 'evento') && (
            <button
              onClick={() => {
                if (booking.tipo === 'evento') {
                  setShowPagoEvento(true);
                } else {
                  verificarCajaAbierta();
                }
              }}
              disabled={verificandoCaja}
              className="flex rounded-[4px] flex-row gap-2 items-center bg-emerald-500 hover:bg-emerald-600 text-white p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign className="h-4 w-4" />
              {verificandoCaja ? 'Verificando caja...' : 'Registrar Pago'}
            </button>
        )}
      </div>

      {/* Modal para registrar pago */}
      <RegistrarPagoTurnoDialog
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setVerificandoCaja(false);
        }}
        turno={booking}
        onPagoRegistrado={handlePagoRegistrado}
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