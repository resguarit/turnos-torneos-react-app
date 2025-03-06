import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, parse, isValid, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Clock, User, CreditCard } from "lucide-react";

export default function ContadorBloqueo() {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutos en segundos
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reservaData, setReservaData] = useState(null);
  const [horarioDetails, setHorarioDetails] = useState(null);
  const [canchaDetails, setCanchaDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar datos de la reserva
    const reservaTempString = localStorage.getItem('reservaTemp');
    if (!reservaTempString) {
      navigate('/reserva-mobile');
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
      } finally {
        setLoadingDetails(false);
      }
    };
    
    loadDetalles();

    // Configurar el temporizador
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Manejadores de eventos para limpieza
    const handleBeforeUnload = async (e) => {
      e.preventDefault();
      await cancelarBloqueo();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cancelarBloqueo();
    };
  }, [navigate]);

  const cancelarBloqueo = async () => {
    if (!reservaData) return;
    
    try {
      await api.post('/turnos/cancelarbloqueo', {
        fecha: reservaData.fecha,
        horario_id: reservaData.horario_id,
        cancha_id: reservaData.cancha_id
      });
    } catch (error) {
      console.error('Error al cancelar el bloqueo:', error);
    }
  };

  const handleTimeOut = async () => {
    if (reservaData) {
      toast.error('El tiempo para realizar el pago ha expirado');
      localStorage.removeItem('reservaTemp');
      setTimeout(() => navigate('/reserva-mobile'), 2000);
    }
  };

  const handlePagarClick = async () => {
    setLoading(true);
    try {
      if (!reservaData) {
        toast.error('No se encontraron datos de la reserva.');
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
        localStorage.removeItem('reservaTemp');
        setTimeout(() => navigate('/user-profile'), 2000);
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      toast.error(error.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarClick = async () => {
    setIsCancelling(true);
    try {
      if (!reservaData) return;
      
      const response = await api.post('/turnos/cancelarbloqueo', {
        fecha: reservaData.fecha,
        horario_id: reservaData.horario_id,
        cancha_id: reservaData.cancha_id
      });
      
      toast.success('Reserva cancelada exitosamente');
      localStorage.removeItem('reservaTemp');
      navigate('/reserva-mobile');
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setIsCancelling(false);
    }
  };

  // Formatear la fecha correctamente
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    // Usar parseISO para interpretar correctamente la fecha ISO
    const fecha = parseISO(fechaStr);
    return format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
      .replace(/^\w/, (c) => c.toUpperCase()); // Capitaliza la primera letra del día
  };

  // Convertir segundos a formato mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
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
        
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Detalles de la reserva (lado izquierdo) */}
            <div className="md:w-1/2 border-r p-6">
              {loadingDetails ? (
                <div className="flex justify-center items-center h-full">
                  <p>Cargando detalles de la reserva...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    Rock & Gol 520 esq. 20
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
                              <p className="font-medium text-sm">{userDetails.name}</p>
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
                  </div>
                </div>
              )}
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
                    <li>• El pago de la seña se hace a traves de whatsapp, una vez se confirme el pago la reserva estara señada.</li>
                    <li>• Tienes 30 minutos después de hacer la reserva para cancelarla sin costo.</li>
                    <li>• Pasados los 30 minutos hay un cargo por cancelación del 10% del total.</li>
                    <li>• La seña debe ser pagada para confirmar la reserva.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botones en la parte inferior */}
          <div className="p-6 bg-gray-50 border-t flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleCancelarClick}
              disabled={loading || isCancelling || timeLeft === 0}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl text-lg w-full md:w-auto order-2 md:order-1"
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
            </Button>
            <Button 
              onClick={handlePagarClick}
              disabled={loading || isCancelling || timeLeft === 0}
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