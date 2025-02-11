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
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si existen datos del bloqueo
    const bloqueoData = localStorage.getItem('bloqueoTemp');
    if (!bloqueoData) {
      navigate('/nueva-reserva');
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

    return () => {
      clearInterval(timer);

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
        setTimeout(() => navigate('/nueva-reserva'), 2000);
      } catch (error) {
        console.error('Error al cancelar el bloqueo:', error);
        toast.error('Error al cancelar el bloqueo temporal');
      }
    }
  };

  const handlePagarClick = async () => {
    setLoading(true);
    try {
      const reservaData = JSON.parse(localStorage.getItem('reservaTemp'));
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
          <Button 
            onClick={handlePagarClick}
            disabled={loading || timeLeft === 0}
            className="bg-naranja hover:bg-naranja/90 text-white px-8 py-3 rounded-xl text-lg mt-8"
          >
            {loading ? 'Procesando...' : 'Pagar'}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}