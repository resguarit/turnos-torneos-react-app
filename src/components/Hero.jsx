import { Link } from "react-router-dom";
import Carrusel from "./Carrusel";
import video from "../assets/rng.mp4";
import { useEffect } from "react";

function Hero() {
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
            src={video}
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
          <Link to="/reserva-mobile">
            <button className="bg-naranja rounded-xl text-white p-2 font-inter font-medium text-xs md:text-sm tracking-wide w-full">
              QUIERO RESERVAR UN TURNO
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Hero;
