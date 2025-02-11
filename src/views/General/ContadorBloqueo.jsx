import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ContadorBloqueo() {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Aquí puedes agregar la lógica para cuando el tiempo se acabe
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Convertir segundos a formato mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePagarClick = () => {
    // Aquí puedes agregar la lógica para el botón de pagar
    navigate('/pagar'); // O la ruta que corresponda
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
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
            className="bg-naranja hover:bg-naranja/90 text-white px-8 py-3 rounded-xl text-lg mt-8"
          >
            Pagar
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}