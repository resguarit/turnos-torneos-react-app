import React, { useEffect, useState } from 'react';
import { Check, Calendar, Clock, MapPin, DollarSign } from "lucide-react"
import CheckoutLayout from './layout';
import api from '@/lib/axiosConfig';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import BtnLoading from '@/components/BtnLoading';

const CheckoutSuccess = () => {
  const [turno, setTurno] = useState(null);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(window.location.search);
  const payment_id = query.get('payment_id');
  const external_reference = query.get('external_reference');
  console.log(payment_id, external_reference);
  const navigate = useNavigate();

  useEffect(() => {

    const verifyPayment = async () => {
      try {
        setLoading(true);
        const response = await api.post('/mercadopago/verify-payment', {
          payment_id,
          external_reference
        });
        console.log(response);
        setTurno(response.data.turno);
        setEstado(response.data.estado);
        if (response.data.estado != 'approved') {
          setError(true);
        }
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();

    
  }, []);

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = parseISO(fechaStr);
    return format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const obtenerDuracion = (horaInicio, horaFin) => {
    // Convert HH:MM:SS format to minutes
    const horaInicioMinutos = horaInicio.split(':')[0] * 60 + parseInt(horaInicio.split(':')[1]);
    const horaFinMinutos = horaFin.split(':')[0] * 60 + parseInt(horaFin.split(':')[1]);
    const duracionMinutos = horaFinMinutos - horaInicioMinutos;
    
    return `${duracionMinutos} min`;
  };

  const calcularMonto = (montoTotal, montoSeña) => {
    return formatCurrency(montoTotal - montoSeña);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return <CheckoutLayout status="success">   
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100"></div>
      </div>
    </CheckoutLayout>;
  }

  if (error) {
    return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>Error al obtener verificacion del pago del turno #{external_reference}. Por favor vuelve e intenta nuevamente.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Volver
        </button>
      </div>
    </div>
    )
  }

    return (
        <CheckoutLayout status="success">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden font-inter">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-transparent mix-blend-overlay"></div>
        <div className="absolute -inset-1 bg-grid-white/10 opacity-20"></div>
        <h1 className="text-2xl font-bold relative z-10">Reserva Confirmada</h1>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 shadow-md">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-600">¡Turno Confirmado!</h2>
          <p className="text-gray-600 text-center mt-2">
            Tu reserva ha sido confirmada exitosamente. Te esperamos en la cancha.
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">Detalles de la reserva #{turno.id}:</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Fecha</p>
                <p className="text-sm text-gray-600">{formatFecha(turno.fecha_turno)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Horario y Duración</p>
                <p className="text-sm text-gray-600">
                  {turno.horario.hora_inicio} - {turno.horario.hora_fin} ({obtenerDuracion(turno.horario.hora_inicio, turno.horario.hora_fin)})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Monto a pagar en el complejo</p>
                <p className="text-sm text-gray-600">
                  {calcularMonto(turno.monto_total, turno.monto_seña)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-gray-500 mt-0.5">
                <span className="text-xs font-bold">F5</span>
              </div>
              <div>
                <p className="text-sm font-medium">Cancha</p>
                <p className="text-sm text-gray-600">#{turno.cancha.nro} {turno.cancha.tipo_cancha}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm text-gray-600">Calle 47 Nº 537 entre 5 y 6, La Plata, Buenos Aires</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <span className="font-medium">Información importante:</span> Recibirás un comprobante por email. El saldo
            restante se abona al momento de jugar.
          </p>
        </div>
      </div>

      <div className="p-4 flex justify-center">
        <button className="bg-black text-white px-6 py-2 rounded-[8px] font-medium transition-colors" onClick={() => navigate('/user-profile')}>
          Ir a Mis Turnos
        </button>
      </div>
    </div>
    </CheckoutLayout>
  )
}

export default CheckoutSuccess;
