import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from "lucide-react"
import CheckoutLayout from './layout'; 
import api from '@/lib/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { parseISO, format } from 'date-fns';
import es from 'date-fns/locale/es';
import { DollarSign, MapPin, Calendar } from "lucide-react"
import { formatearFechaCompleta, calcularDuracion, formatearRangoHorario } from '@/utils/dateUtils';


const CheckoutPending = () => {
  const [turno, setTurno] = useState(null);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(window.location.search);
  const payment_id = query.get('payment_id');
  const external_reference = query.get('external_reference');
  console.log(payment_id, external_reference);
  const navigate = useNavigate();

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = parseISO(fechaStr);
    return format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
      .replace(/^\w/, (c) => c.toUpperCase());
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

  useEffect(() => {
    setLoading(true);

    const verifyPayment = async () => {
      try {
        const response = await api.post('/mercadopago/verify-payment', {
          payment_id,
          external_reference
        });
        setTurno(response.data.turno);
        setEstado(response.data.estado);
        if (response.data.estado != 'in_process') {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();

  }, []);

  if (loading) {
    return (
      <CheckoutLayout status="pending">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100"></div>
        </div>
      </CheckoutLayout>
    )
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
        <CheckoutLayout status="pending">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 text-center relative overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-transparent mix-blend-overlay"></div>
            <div className="absolute -inset-1 bg-grid-white/10 opacity-20"></div>
            <h1 className="text-2xl font-bold relative z-10">Pago Pendiente</h1>
          </div>
    
          <div className="p-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-amber-600">Pago en Proceso</h2>
              <p className="text-gray-600 text-center mt-2">
                Tu reserva está pendiente de pago. Tienes 30 minutos para realizar el pago de la seña.
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
                  {formatearRangoHorario(turno.horario.hora_inicio, turno.horario.hora_fin)} ({calcularDuracion(turno.horario.hora_inicio, turno.horario.hora_fin)})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Monto seña</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(turno.monto_seña)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Monto total</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(turno.monto_total)}
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

    
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Información importante:</p>
                  <p>Si no realizas el pago de la seña en los próximos 30 minutos, tu turno se liberará automáticamente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </CheckoutLayout>
      )
    }

export default CheckoutPending;
