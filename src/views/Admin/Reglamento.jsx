import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { DownloadIcon } from 'lucide-react'


function Reglamento(){


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
      ]


    return (
        <div className="min-h-screen flex flex-col font-inter">
            <Header />
            <main className="grow bg-gray-100 max-w-2xl lg:max-w-full lg:mx-0 mx-auto p-6" >
                <div className="max-w-4xl lg:max-w-full mx-auto">
                  <h1 className="text-2xl font-bold mb-2 lg:text-4xl">Reglamento</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-28 mx-80">
                    {downloadButtons.map((button, index) => (
                      <a
                        key={index}
                        href={button.url}
                        target="_blank"
                        style={{ borderRadius: '8px' }}
                        className="flex items-center justify-between bg-naranja text-white px-6 py-4 rounded-lg hover:bg-naranja/90 transition-colors lg:text-2xl"
                      >
                        <span>{button.title}</span>
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