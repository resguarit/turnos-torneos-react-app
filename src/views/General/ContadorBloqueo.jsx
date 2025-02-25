import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ContadorBloqueo() {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minuto en segundos (según backend)
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();

  // Función para cancelar el bloqueo
  /* const cancelarBloqueo = async () => {
    const bloqueoData = JSON.parse(localStorage.getItem('bloqueoTemp'));
    if (bloqueoData?.id) {
      try {
        await api.delete(`/turnos/cancelarbloqueo/${bloqueoData.id}`);
        localStorage.removeItem('bloqueoTemp');
        localStorage.removeItem('reservaTemp');
      } catch (error) {
        console.error('Error al cancelar el bloqueo:', error);
      }
    }
  }; */

  useEffect(() => {
    // Verificar si existen datos del bloqueo
    const bloqueoData = localStorage.getItem('bloqueoTemp');
    if (!bloqueoData) {
      navigate('/reserva-mobile');
      return;
    }

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

    // Manejador para cuando el usuario sale de la página
    const handleBeforeUnload = async (e) => {
      e.preventDefault();
      await cancelarBloqueo();
    };

    // Manejador para cuando el componente se desmonta
    const handleUnmount = async () => {
      await cancelarBloqueo();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleUnmount();
    };
  }, [navigate]);

  const handleTimeOut = async () => {
    const bloqueoData = JSON.parse(localStorage.getItem('bloqueoTemp'));
    console.log('Datos del bloqueo al expirar:', bloqueoData); // Debug log

    if (bloqueoData?.id) {
      try {
        // Usar el ID correcto del bloqueo temporal
        await api.delete(`/turnos/cancelarbloqueo/${bloqueoData.id}`);
        toast.error('El tiempo para realizar el pago ha expirado');
        localStorage.removeItem('bloqueoTemp');
        localStorage.removeItem('reservaTemp');
        setTimeout(() => navigate('/reserva-mobile'), 2000);
      } catch (error) {
        console.error('Error al cancelar el bloqueo:', error);
        toast.error('Error al cancelar el bloqueo temporal');
      }
    }
  };

  const handlePagarClick = async () => {
    setLoading(true);
    try {
      const reservaDataString = localStorage.getItem('reservaTemp');
      if (!reservaDataString) {
        toast.error('No se encontraron datos de la reserva.');
        return;
      }
      const reservaData = JSON.parse(reservaDataString);
      const bloqueoData = JSON.parse(localStorage.getItem('bloqueoTemp'));
      
      console.log('Datos de la reserva:', reservaData); // Debug log
      console.log('Datos del bloqueo:', bloqueoData); // Debug log

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
        // Cancelar el bloqueo temporal después de crear la reserva exitosamente
        if (bloqueoData?.id) {
          try {
            await api.delete(`/turnos/cancelarbloqueo/${bloqueoData.id}`);
          } catch (cancelError) {
            console.error('Error al cancelar el bloqueo:', cancelError);
          }
        }

        toast.success('Reserva creada exitosamente');
        localStorage.removeItem('bloqueoTemp');
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
      const bloqueoData = JSON.parse(localStorage.getItem('bloqueoTemp'));
      if (bloqueoData?.id) {
        await api.delete(`/turnos/cancelarbloqueo/${bloqueoData.id}`);
        toast.success('Reserva cancelada exitosamente');
        localStorage.removeItem('bloqueoTemp');
        localStorage.removeItem('reservaTemp');
        navigate('/reserva-mobile');
      }
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setIsCancelling(false);
    }
  };

  // Convertir segundos a formato mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <ToastContainer position="bottom-right" />
        <div className="text-center space-y-8">
          <h1 className="text-2xl font-semibold mb-8">Tiempo restante para realizar el pago</h1>
          <div className="text-7xl font-bold text-naranja">
            {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </div>
          <p className="text-gray-600 mt-4">
            Tu reserva se cancelará automáticamente si no realizas el pago antes de que termine el contador
          </p>
          <div className="flex flex-row-reverse md:flex-row gap-4 justify-center mt-8">
            <Button 
              onClick={handleCancelarClick}
              disabled={loading || isCancelling || timeLeft === 0}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl text-lg order-2 md:order-1"
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
            </Button>
            <Button 
              onClick={handlePagarClick}
              disabled={loading || isCancelling || timeLeft === 0}
              className="bg-naranja hover:bg-naranja/90 text-white px-8 py-3 rounded-xl text-lg order-1 md:order-2"
            >
              {loading ? 'Procesando...' : 'Pagar'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}