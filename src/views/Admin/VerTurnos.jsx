import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CalendarDays } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { Phone } from 'lucide-react'
import { PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'; // Usando el componente Button de ShadCN
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import { useState } from 'react';  // Asegúrate de agregar esto


const bookings = [
    {
      id: 1,
      name: "Matias Rodriguez",
      time: "18:00 - 19:00",
      court: "Cancha 1",
      type: "regular"
    },
    {
      id: 2,
      name: "Juan Perez",
      time: "18:00 - 19:00",
      court: "Cancha 2",
      type: "regular"
    },
    {
      id: 3,
      name: "Torneo MARTES",
      time: "18:00 - 20:00",
      courts: ["Cancha 3", "Cancha 4"],
      type: "tournament"
    },
    {
      id: 4,
      name: "Martin Gonzalez",
      time: "20:00 - 21:00",
      court: "Cancha 5",
      type: "regular"
    }
  ]

function VerTurnos({ selectedDate, onDateChange }){
    const [isOpen, setIsOpen] = useState(false);

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDateChange = (date) => {
    onDateChange(date);
    setIsOpen(false); // Cerrar el calendario después de seleccionar una fecha
  };
    
    return(
        <>
        <div className="min-h-screen flex flex-col font-inter">
            <Header />
                <main className="flex-1 p-6 bg-[#dddcdc]">
                <div className="flex justify-between mb-8">
                <div className="space-y-4">
                <h1 className="text-2xl font-bold">Turnos</h1>
                <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Selecciona el Día:</span>
                </div>
                <div className='w-full items-center justify-center'>
                <div className='relative'>
                    <button
                        onClick={toggleCalendar}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-black" style={{borderRadius: '8px'}}
                    >
                        {selectedDate ? selectedDate.toLocaleDateString() : <CalendarDays className='w-48'/>}
                    </button>

                    {isOpen && (
                        <div className="absolute mt-2 z-10 bg-white shadow-lg rounded-lg">
                        <DayPicker selected={selectedDate} onDayClick={handleDateChange} />
                        </div>
                    )}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm p-4 space-y-3 "
                style={{borderRadius: '8px'}}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{booking.name}</h3>
                  <p className="text-sm text-gray-500">{booking.time}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {booking.courts ? (
                  booking.courts.map((court, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {court}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {booking.court}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#FF5533] hover:bg-[#FF5533]/90 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#FF5533] hover:bg-[#FF5533]/90 text-white"
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
                {booking.type === "regular" && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
                
                </div>
                </div>
                
                </main>
            <Footer />
        </div>
        </>
    )
}
export default VerTurnos;