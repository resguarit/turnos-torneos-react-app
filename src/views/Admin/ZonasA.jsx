import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router'
import BackButton from '@/components/BackButton'

const zonas = [
  { id: 1, name: 'LIGA A 2024', format: 'Liga', diaProximo: 'Domingo 21', horarioProximo: '21:00hs', count: 12 },
  { id: 2, name: 'LIGA B 2024', format: 'Eliminacion Directa', diaProximo: 'Domingo 21', horarioProximo: '20:00hs', count: 12 },
  { id: 3, name: 'LIGA C 2024', format: 'Liga', diaProximo: 'Domingo 21', horarioProximo: '19:00hs', count: 12 },
  { id: 4, name: 'LIGA D 2024', format: 'Fase de Grupos', diaProximo: 'Domingo 21', horarioProximo: '18:00hs', ount: 12 },
]

export default function ZonasA() {

    const navigate = useNavigate();

    const handleNuevaZonaClick = () => {
      navigate('/alta-zona');
    }

  return (
    <div className="min-h-screen flex flex-col font-inter ">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <BackButton />
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">Zonas</h1>
            <button onClick={handleNuevaZonaClick} className="bg-black hover:bg-black/80 p-3 lg:text-[1.4rem] font-inter text-white" style={{borderRadius: '8px'}}>
              + Nueva Zona
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zonas.map((zona) => (
              <Card className="bg-white" key={zona.id} style={{borderRadius: '8px'}}>
                <CardContent className="p-6 lg:p-8">
                  <div className="flex flex-col justify-between items-start mb-4">
                    <h2 className="text-xl lg:text-2xl font-bold">{zona.name}</h2>
                    <span className="text-gray-500 lg:text-lg">{zona.format} - {zona.count} equipos</span>
                    <span className="text-black font-semibold lg:text-lg">Próximo Partido: {zona.diaProximo}  ({zona.horarioProximo})</span>
                  </div>
                  <div className="flex gap-3 text-sm lg:text-lg">
                    <button variant="outline" className="flex-1 border border-naranja p-1 hover:bg-naranja hover:text-white" style={{borderRadius: '8px'}}>Ver Detalles</button>
                    <button variant="outline" className="flex-1 border border-naranja p-1 hover:bg-naranja hover:text-white" style={{borderRadius: '8px'}}>Editar</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

