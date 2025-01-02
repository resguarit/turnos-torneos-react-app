import { useNavigate } from 'react-router';
import Carrusel from './Carrusel';
import video from '../assets/rng.mp4';

function Hero(){
    const navigate = useNavigate();

    const handleReservarClick = () => {
        navigate("calendario-admi");
    }

    return (
        <>
            <div className="relative min-h-screen-full w-full">
                {/* Video de fondo */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover z-10"
                    src={video}
                    autoPlay
                    loop
                    muted
                ></video>

                {/* Overlay para oscurecer el video si es necesario */}
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>

                {/* Contenido principal */}
                <div className="relative z-30 flex flex-col justify-center items-center h-full space-y-8 lg:space-y-16 text-center px-4">
                    <h1
                        className="font-inter tracking-wide font-bold text-3xl md:text-4xl lg:text-6xl text-white"
                        style={{ textShadow: "1px 2px 2px rgba(0, 0, 0, 0.4)" }}
                    >
                        VOS ELEGÍS DONDE JUGAR
                    </h1>
                    <h2 className="font-inter tracking-wide font-medium text-sm md:text-xl lg:text-2xl text-white">
                        Descubrí las mejores canchas de fútbol y unite a la comunidad más grande de jugadores
                    </h2>
                    <button
                        onClick={handleReservarClick}
                        className="bg-naranja rounded-xl text-white p-2 font-inter font-medium text-xs md:text-sm lg:text-lg tracking-wide w-full md:w-1/2"
                    >
                        QUIERO RESERVAR UN TURNO
                    </button>
                </div>
            </div>
        </>
    );
}
export default Hero;