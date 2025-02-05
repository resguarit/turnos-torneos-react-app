import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { DownloadIcon } from 'lucide-react';
import rngBlack from '@/assets/rngBlack.mp4';

function Reglamento() {
  const downloadButtons = [
    {
      title: 'Descargar Reglamento',
      url: 'http://www.torneorockandgol.com.ar/descargas/reglamento.pdf'
    },
    {
      title: 'Descargar Sanciones',
      url: 'http://www.torneorockandgol.com.ar/descargas/sanciones.pdf'
    },
    {
      title: 'Descargar Planilla Equipo',
      url: 'http://www.torneorockandgol.com.ar/descargas/planillas_equipos.pdf'
    },
    {
      title: 'Descargar Planilla Jugador',
      url: 'http://www.torneorockandgol.com.ar/descargas/planillas_jugador.pdf'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="relative grow max-w-full lg:mx-0 p-6">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-10"
          src={rngBlack}
          autoPlay
          loop
          muted
        ></video>
        <h1 className="z-40 relative text-2xl font-bold text-white lg:text-3xl">Reglamento</h1>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>
        
        <div className="relative z-30 max-w-4xl lg:max-w-full mx-auto h-[65vh] items-center flex flex-col justify-center">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6  ">
            {downloadButtons.map((button, index) => (
              <a
                key={index}
                href={button.url}
                target="_blank"
                className="flex items-center rounded-[8px] justify-between bg-naranja text-white px-6 py-4 hover:bg-naranja/90 transition-colors lg:text-xl"
              >
                <span className="text-sm md:text-base lg:text-lg">{button.title}</span>
                <DownloadIcon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Reglamento;