import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FaTrophy, FaMedal, FaFutbol, FaHandPaper } from "react-icons/fa";
import heroImage from "@/assets/hero-foto.png"; // Cambiado a imagen estática
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

export default function Premios() {
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const detectSize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', detectSize);

    // Stop confetti after 8 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);

    return () => {
      window.removeEventListener('resize', detectSize);
      clearTimeout(timer);
    };

    // Ya no necesitamos la lógica del video, pero mantenemos el useEffect
    // por si necesitamos agregar alguna inicialización futura
  }, []);

  const prizes = [
    {
      title: "Campeón",
      subtitle: "Copa",
      description: "Pata para 10 personas de @livinlapataloca",
      subtext: "Un turno gratis en complejo RNG para la semana",
      icon: FaTrophy,
    },
    {
      title: "Subcampeón",
      subtitle: "Copa",
      description: "Opción para 6 personas de @livinlapataloca",
      subtext: "(ribs, carré o bondiola)",
      icon: FaMedal,
    },
    {
      title: "Goleador",
      subtitle: "Trofeo",
      description: "Una pelota de Eliggi",
      icon: FaFutbol,
    },
    {
      title: "Valla Menos Vencida",
      subtitle: "Trofeo",
      description: "Un par de guantes de arquero",
      icon: FaHandPaper,
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col font-inter">
      {showConfetti && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          numberOfPieces={200}
          recycle={true}
          colors={['#FF6B00', '#FFD700', '#FF69B4', '#4CAF50', '#2196F3']}
        />
      )}
      
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
          <img
              className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover"
              src={heroImage}
              alt="RG Turnos Background"
          />
      {/* Div para bloquear interacción en iPhone */}
          <div className="absolute inset-0 bg-transparent pointer-events-auto">  
          </div>
      </div>

      {/* Superposición oscura */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

      {/* Contenido principal */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <Header />
        <main className="relative grow max-w-full lg:mx-0 p-6">
          <h1 className="z-40 relative text-2xl font-bold text-white lg:text-3xl mb-6">
            Premios
          </h1>
          
          <div className="flex items-center justify-center w-full h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[12px] p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <prize.icon className="h-12 w-12 mb-2 text-naranja" />
                    <h3 className="text-base font-semibold mb-1 lg:text-xl">
                      {prize.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1 lg:text-base">
                      {prize.subtitle}
                    </p>
                    <p className="text-sm text-gray-600 lg:text-base">
                      {prize.description}
                    </p>
                    {prize.subtext && (
                      <p className="text-sm text-gray-600 lg:text-base">
                        {prize.subtext}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
