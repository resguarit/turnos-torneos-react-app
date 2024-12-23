import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router'

const tournaments = [
  { id: 1, name: 'DOMINGO', count: 5 },
  { id: 2, name: 'MARTES', count: 3 },
  { id: 3, name: 'SABADO', count: 4 },
  { id: 4, name: 'SENIOR', count: 2 },
  { id: 5, name: 'FEMENINO', count: 3 },
  { id: 6, name: 'VIERNES', count: 4 },
]

export default function Torneos() {

  const navigate = useNavigate();

  const handleZonasClick = () => {
    navigate('/zonas-admi');
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-[#dddcdc]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Torneos</h1>
            <Button variant="default" className="bg-black hover:bg-black/90 text-white" style={{borderRadius: '8px'}}>
              + Nuevo Torneo
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card className="bg-white" key={tournament.id} style={{borderRadius: '8px'}}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{tournament.name}</h2>
                    <span className="text-gray-500">{tournament.count} zonas</span>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleZonasClick} variant="outline" className="flex-1 border-naranja" style={{borderRadius: '8px'}}>Ver Zonas</Button>
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

