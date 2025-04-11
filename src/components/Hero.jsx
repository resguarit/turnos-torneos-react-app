import { Link, useNavigate } from "react-router-dom";
import Carrusel from "./Carrusel";
import { useEffect, useState } from "react";
import rngBlack from "../assets/rngBlack.mp4";
import video from "../assets/rngBlack.mp4";
import { ArrowLeftCircle } from "lucide-react";

function Hero() {
  const navigate = useNavigate();
  const [hasActiveReservation, setHasActiveReservation] = useState(false);

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

  const handleReturnToReservation = () => {
    const token = localStorage.getItem('token');
    const reservaTemp = JSON.parse(localStorage.getItem('reservaTemp'));
    
    if (!token) {
      navigate(`/confirmar-turno?time=${reservaTemp.horario_id}&date=${reservaTemp.fecha}&court=${reservaTemp.cancha_id}`);
    } else {
      navigate("/bloqueo-reserva");
    }
  };

  useEffect(() => {
    const videoElement = document.querySelector("video");

    if (videoElement) {
      videoElement.addEventListener("contextmenu", (e) => e.preventDefault());
      videoElement.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      // Prevenir la interacción en iOS
      videoElement.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }
  }, []);

  return (
    <>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Contenedor del video con un div transparente encima para bloquear toques */}
        <div className="absolute inset-0">
          <video
            className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover "
            src={rngBlack}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          ></video>
          {/* Div para bloquear interacción en iPhone */}
          <div className="absolute inset-0 bg-transparent pointer-events-auto"></div>
        </div>

        {/* Overlay para oscurecer el video si es necesario */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Contenido principal */}
        <div className="relative z-30 flex flex-col justify-center items-center h-full space-y-8 lg:space-y-12 text-center px-4">
          <h1
            className="font-inter tracking-wide font-bold text-3xl md:text-4xl lg:text-5xl text-white"
            style={{ textShadow: "1px 2px 2px rgba(0, 0, 0, 0.4)" }}
          >
            VOS ELEGÍS DONDE JUGAR
          </h1>
          <h2 className="font-inter tracking-wide font-medium text-sm md:text-lg lg:text-xl text-white">
            Descubrí las mejores canchas de fútbol y unite a la comunidad más grande de jugadores
          </h2>
          {!hasActiveReservation && (
            <Link to="/reserva-mobile">
              <button className="bg-naranja rounded-xl text-white p-2 font-inter font-medium text-xs md:text-sm tracking-wide w-full">
                QUIERO RESERVAR UN TURNO
              </button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Hero;
