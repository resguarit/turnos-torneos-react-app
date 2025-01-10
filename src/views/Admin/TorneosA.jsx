import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { X } from 'lucide-react'

const tournaments = [
  { id: 1, name: 'DOMINGO', count: 5 },
  { id: 2, name: 'MARTES', count: 3 },
  { id: 3, name: 'SABADO', count: 4 },
  { id: 4, name: 'SENIOR', count: 2 },
  { id: 5, name: 'FEMENINO', count: 3 },
  { id: 6, name: 'VIERNES', count: 4 },
]

export default function Torneos() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleZonasClick = () => {
    navigate('/zonas-admi');
  }

  const handleNuevoTorneo = (e) => {
    e.preventDefault();
    setShowModal(true); // Mostrar modal de confirmación
};

const confirmSubmit = async () => {
    setShowModal(false); // Cierra el modal
    // Lógica para reservar la cancha
};


const Modal = ({ onConfirm, onCancel }) => (
  <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center font-inter">
      <div className="bg-white text-black z-20 p-4 rounded-xl  shadow-lg w-11/12 lg:w-1/2">
      <div className="flex justify-between">
          <h2 className="text-xl lg:text-3xl font-bold mb-4">Crear Nuevo Torneo</h2>
          <X onClick={onCancel}/>
          </div>
          <p className="font-semibold mb-6 text-xs lg:text-base text-gray-500">Complete los datos para crear un nuevo torneo</p>
          <div className='flex flex-col space-y-8'>
          <div>
          <label className="font-bold mt-4 lg:text-xl">Nombre del Torneo:</label>
          <input className='bg-gray-300 w-full lg:h-9 p-1' style={{ borderRadius: '6px' }}></input>
          </div>
          <div className="flex justify-center">
              <button
                  onClick={onConfirm}
                  className="px-4 py-2 lg:text-xl font-medium bg-naranja text-white"
              style={{ borderRadius: '6px' }}
              >
                  Crear
              </button>
          </div>
          </div>
      </div>
  </div>
);

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">Torneos</h1>
            <button variant="default" className="bg-black hover:bg-black/80 p-3 lg:text-[1.4rem] font-inter text-white" style={{borderRadius: '8px'}} onClick={handleNuevoTorneo}>
              + Nuevo Torneo
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card className="bg-white" key={tournament.id} style={{borderRadius: '8px'}}>
                <CardContent className="p-6 lg:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl lg:text-2xl font-semibold">{tournament.name}</h2>
                    <span className="text-gray-500 lg:text-lg">{tournament.count} zonas</span>
                  </div>
                  <div className="flex gap-3 text-sm lg:text-lg">
                    <button onClick={handleZonasClick} className="flex-1 border border-naranja p-1 hover:bg-naranja hover:text-white" style={{borderRadius: '8px'}}>Ver Zonas</button>
                    <button className="flex-1 border border-naranja p-1 hover:bg-naranja hover:text-white" style={{borderRadius: '8px'}}>Editar</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {showModal && <Modal onConfirm={confirmSubmit} onCancel={() => setShowModal(false)} />}
      </main>
      <Footer />
    </div>
  )
}

