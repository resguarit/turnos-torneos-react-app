import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom'; // Añadir useLocation
import { Button } from '@/components/ui/button';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Clock, User, CreditCard, Loader2, Check } from "lucide-react";

export default function ContadorBloqueo() {
  // 3 minutos (180 segundos)
  const TOTAL_TIME = 180; 
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reservaData, setReservaData] = useState(null);
  const [horarioDetails, setHorarioDetails] = useState(null);
  const [canchaDetails, setCanchaDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [timerExpired, setTimerExpired] = useState(false); // Nuevo estado para controlar cuando expira el timer
  
  const navigate = useNavigate();
  const location = useLocation(); // Obtener la ubicación actual
  
  // Función auxiliar para limpiar localStorage
  const cleanupStorage = () => {
    localStorage.removeItem('reservaStartTime');
    localStorage.removeItem('reservaTemp');
  };

  useEffect(() => {
    // Cargar datos de la reserva
    const reservaTempString = localStorage.getItem('reservaTemp');
    if (!reservaTempString) {
      navigate('/select-deporte');
      return;
    }

    const reservaTemp = JSON.parse(reservaTempString);
    setReservaData(reservaTemp);
    
    // Cargar detalles adicionales
    const loadDetalles = async () => {
      setLoadingDetails(true);
      try {
        // Obtener detalles del horario
        const horarioResponse = await api.get(`/horarios/${reservaTemp.horario_id}`);
        setHorarioDetails(horarioResponse.data.horario);
        
        // Obtener detalles de la cancha
        const canchaResponse = await api.get(`/canchas/${reservaTemp.cancha_id}`);
        setCanchaDetails(canchaResponse.data.cancha);
        
        // Si hay un usuario logueado, obtener sus datos
        const userId = localStorage.getItem('user_id');
        if (userId) {
          const userResponse = await api.get(`/usuarios/${userId}`);
          setUserDetails(userResponse.data.user);
        }
      } catch (error) {
        console.error('Error al cargar detalles:', error);
        toast.error('Error al cargar los detalles de la reserva');
        setTimeout(() => navigate('/select-deporte'), 2000);
      } finally {
        setLoadingDetails(false);
        // Iniciar el contador solo cuando se hayan cargado los detalles
        initializeTimer();
      }
    };
    
    loadDetalles();

    return () => {
      // No cancelamos el bloqueo automáticamente al desmontar
      // Ya que ahora queremos que el contador "siga corriendo"
    };
  }, [navigate]);

  // Función para inicializar el timer
  const initializeTimer = () => {
    const reservaStartTime = localStorage.getItem('reservaStartTime');
    const now = new Date().getTime();
    
    // Si no hay tiempo de inicio, establecer uno nuevo
    if (!reservaStartTime) {
      localStorage.setItem('reservaStartTime', now.toString());
    }
    
    // Tiempo máximo en milisegundos (10 minutos)
    const maxTime = TOTAL_TIME * 1000;
    
    // Configurar el intervalo para actualizar el contador
    const timer = setInterval(() => {
      const startTime = parseInt(localStorage.getItem('reservaStartTime'), 10);
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - startTime;
      const remainingTime = Math.max(0, maxTime - elapsedTime);
      
      // Convertir a segundos (usando Math.floor en lugar de Math.ceil)
      const remainingSeconds = Math.floor(remainingTime / 1000);
      
      setTimeLeft(remainingSeconds);
      
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        handleTimeOut();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  };

  const handleTimeOut = async () => {
    // Validación adicional para reservaData
    if (!reservaData) {
      toast.error('No se encontraron datos de la reserva');
      cleanupStorage();
      
      // Solo navegamos si estamos en la página del contador
      if (location.pathname === '/bloqueo-reserva') {
        navigate('/select-deporte');
      }
      return;
    }

    // Marcamos que el timer ha expirado
    setTimerExpired(true);
    
    // Mostramos el mensaje de error - esto aparecerá como toast en cualquier página
    toast.error('El tiempo para realizar el pago ha expirado');
    
    // NO hacemos el POST a cancelarbloqueo, ya que expira automáticamente en el backend
    
    // Limpiamos localStorage - esto ocurre independientemente de la página
    cleanupStorage();
    
    // Redireccionamos SOLO si estamos en la página del contador
    if (location.pathname === '/bloqueo-reserva') {
      setTimeout(() => navigate('/select-deporte'), 2000);
    }
  };

  const handlePagarClick = async () => {
    setLoading(true);
    try {
      if (!reservaData) {
        toast.error('No se encontraron datos de la reserva.');
        cleanupStorage();
        setTimeout(() => navigate('/select-deporte'), 2000);
        return;
      }
      
      // Crear la reserva
      const response = await api.post('/turnos/turnounico', {
        fecha_turno: reservaData.fecha,
        horario_id: reservaData.horario_id,
        cancha_id: reservaData.cancha_id,
        monto_total: reservaData.monto_total,
        monto_seña: reservaData.monto_seña,
        estado: 'Pendiente'
      });

      if (response.status === 201) {
        toast.success('Reserva creada exitosamente');
        cleanupStorage();
        setTimeout(() => navigate('/user-profile'), 2000);
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      toast.error(error.response?.data?.message || 'Error al crear la reserva');
      // No limpiamos localStorage en caso de error para permitir intentar de nuevo
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarClick = async () => {
    setIsCancelling(true);
    try {
      if (!reservaData) {
        toast.error('No se encontraron datos de la reserva.');
        cleanupStorage();
        navigate('/select-deporte');
        return;
      }
      
      await api.post('/turnos/cancelarbloqueo', {
        fecha: reservaData.fecha,
        horario_id: reservaData.horario_id,
        cancha_id: reservaData.cancha_id
      });
      
      toast.success('Reserva cancelada exitosamente');
      cleanupStorage();
      navigate('/select-deporte');
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar la reserva');
      // En caso de error al cancelar, redirigimos de todas formas
      cleanupStorage();
      setTimeout(() => navigate('/select-deporte'), 2000);
    } finally {
      setIsCancelling(false);
    }
  };

  // Formatear la fecha correctamente
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = parseISO(fechaStr);
    return format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  // Convertir segundos a formato mm:ss
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Calcular porcentaje para seña
  const señaPercentage = reservaData && reservaData.monto_seña && reservaData.monto_total 
    ? (reservaData.monto_seña / reservaData.monto_total) * 100 
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-center mb-8">Confirmar Reserva</h1>
        
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden relative">
          {/* Mostramos el overlay de carga cuando está cargando detalles o cuando el timer ha expirado */}
          {(loadingDetails || timerExpired) && (
            <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-naranja animate-spin mb-3" />
              <p className="text-lg font-medium">
                {timerExpired 
                  ? 'El tiempo ha expirado. Redirigiendo...' 
                  : 'Cargando detalles de la reserva...'}
              </p>
            </div>
          )}
          
          <div className="md:flex">
            {/* Detalles de la reserva (lado izquierdo) */}
            <div className="md:w-1/2 border-r p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  Resguar IT, Calle 47 entre 5 y 6 nro 676.
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div className="w-full">
                      <p className="text-sm text-gray-500">Fecha y Hora</p>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm capitalize">
                          {formatFecha(reservaData?.fecha)}
                        </p>
                        <p className="font-medium text-sm">
                          {horarioDetails?.hora_inicio?.slice(0, 5)} - {horarioDetails?.hora_fin?.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div className="w-full">
                      <p className="text-sm text-gray-500">Duración y Cancha</p>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">60 min</p>
                        <p className="font-medium text-sm">
                          Cancha {canchaDetails?.nro} - {canchaDetails?.tipo_cancha}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {userDetails && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Reservado por</p>
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">{userDetails.persona?.name}</p>
                            <p className="text-gray-500 text-sm">DNI: {userDetails.dni}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Resumen de pago</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <p className="text-sm">Total</p>
                            <p className="font-medium text-sm">${reservaData?.monto_total}</p>
                          </div>
                          <div className="flex justify-between text-naranja">
                            <p className="text-sm">Seña ({señaPercentage.toFixed(0)}%)</p>
                            <p className="font-medium text-sm">${reservaData?.monto_seña}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cuadro verde con información del pago */}
                  <div className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center text-green-800 font-medium mb-2">
                      <Check className="h-5 w-5 mr-2 text-green-600" />
                      <span>Cómo realizar el pago</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>1. Al confirmar, el pago se coordina por WhatsApp. 2215607115</li>
                      <li>2. Puedes pagar con transferencia o MercadoPago</li>
                      <li>3. Envía el comprobante para confirmar tu reserva</li>
                      <li>4. El saldo restante se abona al momento de jugar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contador y avisos (lado derecho) */}
            <div className="md:w-1/2 p-6">
              <div className="flex flex-col h-full">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Tiempo restante para confirmar</h2>
                  <div className="text-5xl font-bold text-naranja my-4">
                    {formattedTime}
                  </div>
                  <p className="text-gray-600">
                    Tu reserva se cancelará automáticamente si no confirmas antes de que termine el contador
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-auto">
                  <p className="font-semibold text-orange-800">Información importante:</p>
                  <ul className="text-sm text-orange-700 space-y-2 mt-2">
                    <li>• El pago de la seña se hace a través de WhatsApp, una vez se confirme el pago la reserva estará señada.</li>
                    <li>• Tienes 30 minutos después de hacer la reserva para cancelarla sin costo.</li>
                    <li>• Pasados los 30 minutos hay un cargo por cancelación del 10% del total.</li>
                    <li>• La seña debe ser pagada para confirmar la reserva.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botones en la parte inferior - actualizamos la condición disabled */}
          <div className="p-6 bg-gray-50 border-t flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleCancelarClick}
              disabled={loading || isCancelling || !timeLeft || timeLeft <= 0 || loadingDetails || timerExpired}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl text-lg w-full md:w-auto order-2 md:order-1"
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
            </Button>
            <Button 
              onClick={handlePagarClick}
              disabled={loading || isCancelling || !timeLeft || timeLeft <= 0 || loadingDetails || timerExpired}
              className="bg-naranja hover:bg-naranja/90 text-white px-8 py-3 rounded-xl text-lg w-full md:w-auto order-1 md:order-2"
            >
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}