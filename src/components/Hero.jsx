import { Link, useNavigate } from "react-router-dom";
import Carrusel from "./Carrusel";
import { useEffect, useState } from "react";
import heroImage from "../assets/hero-foto.png"; // Cambiado a imagen estática
import { ArrowLeftCircle } from "lucide-react";
import { useConfiguration } from '@/context/ConfigurationContext';

function Hero() {
  const navigate = useNavigate();
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const { config, loading: isLoadingConfig } = useConfiguration();
  // Estado para controlar si estamos en mobile o no
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si hay subdominio
  const hasSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Para localhost con subdominio: subdominio.localhost
    if (hostname.includes('localhost')) {
      return parts.length > 1 && parts[0] !== 'localhost';
    }
    
    // Para dominio principal con subdominio: subdominio.rgturnos.com.ar
    if (hostname.includes('rgturnos.com.ar')) {
      return parts.length > 3; // subdominio.rgturnos.com.ar tiene 4 partes
    }
    
    return false;
  };

  useEffect(() => {
    const checkActiveReservation = () => {
      const reservaTemp = localStorage.getItem("reservaTemp");
      setHasActiveReservation(!!reservaTemp);
    };

    checkActiveReservation();

    window.addEventListener("storage", checkActiveReservation);

    const interval = setInterval(checkActiveReservation, 1000);

    return () => {
      window.removeEventListener("storage", checkActiveReservation);
      clearInterval(interval);
    };
  }, []);

  // Detectar si estamos en mobile para aplicar la animación
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // consideramos mobile si es menor a 768px
    };
    
    // Verificar al inicio
    checkIfMobile();
    
    // Y también cuando cambia el tamaño de la ventana
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleReturnToReservation = () => {
    const token = localStorage.getItem('token');
    const reservaTemp = JSON.parse(localStorage.getItem('reservaTemp'));
    
    if (!token) {
      navigate(`/confirmar-turno?time=${reservaTemp.horario_id}&date=${reservaTemp.fecha}&court=${reservaTemp.cancha_id}`);
    } else {
      navigate("/bloqueo-reserva");
    }
  };

  // Determinar el nombre del complejo a mostrar
  const getNombreComplejo = () => {
    if (isLoadingConfig) return '...';
    if (!config) return 'RG Turnos';
    return config.nombre_complejo || 'RG Turnos';
  };

  return (
    <>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Contenedor de la imagen de fondo */}
        <div className="absolute inset-0">
          <img
            className={`pointer-events-none select-none absolute inset-0 w-full h-full object-cover ${isMobile ? 'hero-pan-animation' : ''}`}
            src={heroImage}
            alt="RG Turnos Background"
            style={{
              objectPosition: isMobile ? 'center center' : 'center center'
            }}
          />
          {/* Div para bloquear interacción en iPhone */}
          <div className="absolute inset-0 bg-transparent pointer-events-auto"></div>
        </div>

        {/* Overlay para oscurecer el video si es necesario */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* Contenido principal */}
        <div className="relative z-30 flex flex-col justify-center items-center h-full space-y-8 lg:space-y-12 text-center px-4">
          <h1
            className="font-inter tracking-wide font-bold text-3xl md:text-4xl lg:text-5xl text-white"
            style={{ textShadow: "1px 2px 2px rgba(0, 0, 0, 0.4)" }}
          >
            Sistema de Reservas y Torneos de {getNombreComplejo()}
          </h1>
          <h2 className="font-inter tracking-wide font-medium text-sm md:text-lg lg:text-xl text-white">
            Descubrí las mejores canchas de fútbol y unite a la comunidad más grande de jugadores
          </h2>
          {!hasActiveReservation && (
            <>
              {hasSubdomain() ? (
                <Link to="/select-deporte">
                  <button className="bg-naranja rounded-xl text-white p-2 font-inter font-medium text-xs md:text-sm tracking-wide w-full">
                    QUIERO RESERVAR UN TURNO
                  </button>
                </Link>
              ) : (
                <a href="https://wa.me/5492216914649" target="_blank" rel="noopener noreferrer">
                  <button className="bg-naranja rounded-xl text-white p-2 font-inter font-medium text-xs md:text-sm tracking-wide w-full">
                    SOLICITAR DEMO
                  </button>
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Estilos CSS para la animación del fondo en mobile */}
      <style jsx>{`
        @media (max-width: 767px) {
          @keyframes panBackground {
            0% {
              object-position: left center;
            }
            25% {
              object-position: center center;
            }
            50% {
              object-position: right center;
            }
            75% {
              object-position: center center;
            }
            100% {
              object-position: left center;
            }
          }
          
          .hero-pan-animation {
            animation: panBackground 25s ease-in-out infinite;
          }
        }
      `}</style>
    </>
  );
}

export default Hero;
