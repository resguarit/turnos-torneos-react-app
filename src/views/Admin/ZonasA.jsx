import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router'

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
      <main className="flex-1 p-6 bg-[#dddcdc]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Zonas</h1>
            <Button onClick={handleNuevaZonaClick} variant="default" className="bg-black hover:bg-black/90 text-white" style={{borderRadius: '8px'}}>
              + Nueva Zona
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zonas.map((zona) => (
              <Card className="bg-white" key={zona.id} style={{borderRadius: '8px'}}>
                <CardContent className="p-6">
                  <div className="flex flex-col justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">{zona.name}</h2>
                    <span className="text-gray-500">{zona.format} - {zona.count} equipos</span>
                    <span className="text-black font-medium">Próximo Partido: {zona.diaProximo}  ({zona.horarioProximo})</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-naranja" style={{borderRadius: '8px'}}>Ver Detalles</Button>
                    <Button variant="outline" className="flex-1 border-naranja" style={{borderRadius: '8px'}}>Editar</Button>
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

