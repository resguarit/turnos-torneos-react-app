import { useState } from 'react'
import { useNavigate } from 'react-router-dom'  // Importar useNavigate de react-router-dom
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

const timeSlots = [
  { time: "17:00 - 18:00", status: "libre" },
  { time: "18:00 - 19:00", status: "ocupado" },
  { time: "19:00 - 20:00", status: "libre" },
  { time: "20:00 - 21:00", status: "libre" },
  { time: "21:00 - 22:00", status: "ocupado" },
  { time: "22:00 - 23:00", status: "libre" },
]

export default function TimeSlots() {
  const navigate = useNavigate()  // Usar useNavigate para navegación
  const [selectedTime, setSelectedTime] = useState(null)

  const handleReserve = (time) => {
    setSelectedTime(time)
    navigate(`/reservas/2024-12-01/${encodeURIComponent(time)}`)  // Usar navigate para cambiar la ruta
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Reservas</h1>
        <h2 className="text-lg mb-6">Lunes - 01/12/2024</h2>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {timeSlots.map((slot, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-4 ${
                index !== timeSlots.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span 
                  className={`px-3 py-1 rounded-full text-sm ${
                    slot.status === 'libre' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {slot.status}
                </span>
                <span className="text-sm font-medium">{slot.time}</span>
              </div>
              <Button
                onClick={() => handleReserve(slot.time)}
                disabled={slot.status === 'ocupado'}
                className="bg-[#FF5533] hover:bg-[#FF5533]/90 text-white"
              >
                Reservar
              </Button>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}  // Cambiado a navigate(-1) para ir hacia atrás
          className="bg-black text-white hover:bg-black/90"
        >
          Atrás
        </Button>
      </main>
    </div>
  )
}

