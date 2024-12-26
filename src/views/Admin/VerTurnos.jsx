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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-center">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm p-4 space-y-3 "
                style={{borderRadius: '8px'}}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{booking.name}</h3>
                  <p className="text-sm font-medium text-gray-500">{booking.time}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {booking.courts ? (
                  booking.courts.map((court, index) => (
                    <span
                      key={index}
                      className="text-center px-3 py-1 bg-gray-300 rounded-full text-xs w-3/4"
                    >
                      {court}
                    </span>
                  ))
                ) : (
                  <span className="text-center px-3 py-1 bg-gray-300 rounded-full text-xs  w-3/4">
                    {booking.court}
                  </span>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  style={{ borderRadius: '4px' }}
                  size="icon"
                  className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  style={{ borderRadius: '4px' }}
                  size="icon"
                  className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
                >
                  <PenSquare className="h-4 w-4" />
                </button>
                {booking.type === "regular" && (
                  <button
                  style={{ borderRadius: '4px' }}
                    size="icon"
                    className="bg-green-500 hover:bg-green-600 text-white p-2"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
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