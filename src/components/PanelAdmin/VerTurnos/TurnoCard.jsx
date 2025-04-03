import React, { useState } from 'react';
import { Trash2, PenSquare, Phone, DollarSign, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RegistrarPagoTurnoDialog from './RegistrarPagoTurnoDialog';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const TurnoCard = ({ booking, handleDeleteSubmit, onPagoRegistrado }) => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [verificandoCaja, setVerificandoCaja] = useState(false);
  const [cajaError, setCajaError] = useState(false);

  const handlePagoRegistrado = (data) => {
    if (onPagoRegistrado) {
      onPagoRegistrado(data);
    }
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
          <h3 className="font-semibold text-lg capitalize">{booking.usuario.nombre}</h3>
          <p className="text-sm font-medium text-gray-500">{`${booking.horario.hora_inicio} - ${booking.horario.hora_fin}`}</p>
          <p className="text-sm font-medium text-gray-800">{`Monto total: $${booking.monto_total}`}</p>
          <p className="text-sm font-medium text-gray-800">{`Monto seña: $${booking.monto_seña}`}</p>
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
            className={`text-center px-3 py-1 rounded-xl text-sm ${
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
        <span className="text-center px-3 py-1 bg-gray-300 rounded-xl text-sm">
          {`Cancha ${booking.cancha.nro} - ${booking.cancha.tipo_cancha}`}
        </span>
      </div>

      <div className="flex gap-2 justify-center w-full">
        <button
          onClick={() => handleDeleteSubmit(booking)}
          size="icon"
          className="bg-red-600 hover:bg-naranja/90 text-white p-2 transition-colors duration-200"
          disabled={verificandoCaja}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          size="icon"
          className="bg-blue-600 hover:bg-naranja/90 text-white p-2 transition-colors duration-200"
          onClick={() => navigate(`/editar-turno/${booking.id}`)}
          disabled={verificandoCaja}
        >
          <PenSquare className="h-4 w-4" />
        </button>
        <button
          onClick={() => window.open(`https://api.whatsapp.com/send?phone=549${booking.usuario.telefono}`, '_blank')}
          size="icon"
          className="bg-green-500 hover:bg-green-600 text-white p-2 transition-colors duration-200"
          disabled={verificandoCaja}
        >
          <Phone className="h-4 w-4" />
        </button>
        {booking.estado !== 'Pagado' && booking.estado !== 'Cancelado' && fecha_turno > fecha_modificacion && booking.tipo !== 'fijo' && (
          <button
            onClick={verificarCajaAbierta}
            disabled={verificandoCaja}
            className="flex flex-row gap-2 items-center bg-emerald-500 hover:bg-emerald-600 text-white p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default TurnoCard;