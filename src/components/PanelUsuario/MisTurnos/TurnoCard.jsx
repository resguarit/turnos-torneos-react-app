import React, { useState } from "react";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CreditCard, Clock, User, DollarSign, CheckCircle, XCircle, MinusCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CancelacionTurnoDialog from "./CancelacionTurnoDialog";
import SolicitudCambioTurnoDialog from "./SolicitudCambioTurnoDialog";
import api from "@/lib/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { TurnoEstado } from '@/constants/estadoTurno';
import CoordinarPagoDialog from "./CoordinarPagoDialog";

const TurnoCard = ({ turno, onTurnoCanceled, showCancelButton, showModifyButton }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  // Fix date formatting by using parseISO
  const fechaFormateada = format(parseISO(turno.fecha_turno), "EEEE, d 'de' MMMM 'de' yyyy", { 
    locale: es 
  });
  const señaPorcentaje = turno.cancha ? (turno.monto_seña / turno.monto_total) * 100 : 0;
  const navigate = useNavigate();

  const handleCancelTurno = async (cancelReason) => {
    setIsCancelling(true);
    try {
      const response = await api.post(`/turnos/cancelar/${turno.id}`, {
        motivo: cancelReason === "" ? "No especificado" : cancelReason
      });

      if (response.status === 200) {
        toast.success('Turno cancelado exitosamente');
        setShowCancelModal(false);
        
        // Call the callback to refresh the list
        if (onTurnoCanceled) {
          onTurnoCanceled();
        }
      }
    } catch (error) {
      console.error('Error al cancelar el turno:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar el turno');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    // Número de teléfono al que se enviará el mensaje (sin espacios ni caracteres especiales)
    const phoneNumber = "542214567890"; // Reemplazar con el número real
    
    // Mensaje predefinido para WhatsApp
    const message = `Hola, quisiera coordinar el pago de la seña para mi turno a nombre de ${turno.usuario.nombre} del ${fechaFormateada} a las ${turno.horario.hora_inicio}. El monto de la seña es $${turno.monto_seña}. Gracias!`;
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear el enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Cerrar el modal después de redirigir
    setShowPaymentModal(false);
  };

  const getMontoColor = (tipo) => {
    switch (turno.estado) {
      case 'Pagado':
        return 'text-green-500';
      case 'Señado':
        return tipo === 'seña' ? 'text-green-500' : 'text-gray-900';
      case 'Pendiente':
        return 'text-red-500';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="mb-4 p-4 border rounded-[8px] shadow w-full md:w-1/2 bg-white">
        <CardContent className="p-2 md:p-6">
          <h2 className="md:text-lg font-bold text-center md:text-left">Detalles de la Reserva</h2>
          <p className="text-sm text-center text-gray-600 mb-4">{turno.ubicacion}</p>

          <hr className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div>
              <div className="flex items-center gap-2 pb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-xs md:text-sm font-semibold">Fecha y Hora del Turno</p>
              </div>
              <p className="text-xs md:text-sm capitalize">{fechaFormateada}</p>
              <p className="text-xs md:text-sm">{turno.horario.hora_inicio} - {turno.horario.hora_fin}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 pb-1">
                <Clock className="w-4 h-4" />
                <p className="text-xs md:text-sm font-semibold">Duración y Cancha</p>
              </div>
              <p className="text-xs md:text-sm">60 min | {turno.cancha.tipo_cancha} #{turno.cancha.nro}</p>
            </div>
          </div>

          <hr className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 pb-1">
                <User className="w-4 h-4" />
                <p className="text-xs md:text-sm font-semibold">Reservado por</p>
              </div>
              <p className="text-xs md:text-sm">{turno.usuario.nombre} - DNI: {turno.usuario.dni}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {turno.estado === TurnoEstado.CANCELADO ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : turno.estado === TurnoEstado.PENDIENTE ? (
                  <MinusCircle className="w-4 h-4 text-yellow-500" />
                ) : turno.estado === TurnoEstado.SEÑADO ? (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <p className="text-xs md:text-sm font-semibold">Estado</p>
              </div>
              <p className="text-xs md:text-sm pt-1">{turno.estado}</p>
            </div>
          </div>

          {turno.motivo_cancelacion && (
            <>
              <hr className="my-2" />
              <div className="flex items-left pb-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs md:text-sm font-semibold">Motivo de Cancelación</p>
                </div>
              </div>
              <p className="text-xs md:text-sm">{turno.motivo_cancelacion}</p>
            </>
          )}

          <hr className="my-2" />
          <div className="flex items-left pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <h4 className="text-sm font-semibold">Resumen de Pago</h4>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Total</p>
              </div>
              <p className={`text-sm font-bold ${getMontoColor('total')}`}>
                ${turno.monto_total}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Seña ({señaPorcentaje.toFixed(0)}%)</p>
              </div>
              <p className={`text-sm font-bold ${getMontoColor('seña')}`}>
                ${turno.monto_seña}
              </p>
            </div>
          </div>

          {/* Contenedor para los botones - ahora en columna */}
          <div className="flex flex-col gap-2 mt-4">
            {/* Primera fila de botones */}
            <div className="flex flex-col lg:flex-row gap-2 w-full">
              {turno.estado !== TurnoEstado.CANCELADO && showCancelButton && (
                <Button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-500 text-white hover:bg-red-600"
                >
                  Cancelar Turno
                </Button>
              )}
              {showModifyButton && turno.estado !== TurnoEstado.CANCELADO && (
                <Button
                  onClick={() => setShowChangeModal(true)}
                  className="w-full bg-yellow-400 text-white hover:bg-yellow-500"
                >
                  Solicitar Cambio del Turno  
                </Button>
              )}
            </div>
            
            {/* Segunda fila - botón de pago solo cuando está pendiente */}
            {turno.estado === TurnoEstado.PENDIENTE && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-green-500 text-white hover:bg-green-600"
              >
                Coordinar Pago
              </Button>
            )}
          </div>
        </CardContent>
        
        {/* Modales */}
        <CancelacionTurnoDialog
          showCancelModal={showCancelModal}
          setShowCancelModal={setShowCancelModal}
          turno={turno}
          handleCancelTurno={handleCancelTurno}
          isCancelling={isCancelling}
        />
        <SolicitudCambioTurnoDialog
          showChangeModal={showChangeModal}
          setShowChangeModal={setShowChangeModal}
          turno={turno}
          isSubmitting={isCancelling}
        />
        <CoordinarPagoDialog
          showPaymentModal={showPaymentModal}
          setShowPaymentModal={setShowPaymentModal}
          turno={turno}
          handleWhatsAppRedirect={handleWhatsAppRedirect}
        />
      </Card>
    </div>
  );
};

export default TurnoCard;