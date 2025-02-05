import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FaTrophy, FaMedal, FaFutbol, FaHandPaper } from "react-icons/fa";
import rngBlack from "@/assets/rngBlack.mp4";

export default function Premios() {
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
      {/* Video de fondo */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src={rngBlack}
        autoPlay
        loop
        muted
      ></video>

      {/* Superposición oscura */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

      {/* Contenido principal */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-6">
        <h1 className="relative text-2xl font-bold text-white lg:text-3xl mb-2">
              Premios
            </h1>
          <div className="max-w-6xl items-center flex flex-col justify-center lg:max-w-full mx-auto">
            

            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  style={{ borderRadius: "12px" }}
                  className="bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
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
