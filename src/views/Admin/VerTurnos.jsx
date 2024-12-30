import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CalendarDays } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { Phone } from 'lucide-react'
import { PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'; 
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 

function VerTurnos({ selectedDate, onDateChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewOption, setViewOption] = useState('day'); // 'day' or 'range'

  useEffect(() => {
    let url = 'http://127.0.0.1:8000/api/reservas';
    if (viewOption === 'day' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      url += `?fecha=${formattedDate}`;
    } else if (viewOption === 'range' && startDate && endDate) {
      const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      url += `?fecha_inicio=${formattedStartDate}&fecha_fin=${formattedEndDate}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const grouped = data.reservas.reduce((acc, booking) => {
          const date = booking.fecha_turno.split('T')[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(booking);
          return acc;
        }, {});
        setGroupedBookings(grouped);
      })
      .catch(error => console.error('Error fetching reservations:', error));
  }, [selectedDate, startDate, endDate, viewOption]);

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDateChange = (date) => {
    onDateChange(date);
    setIsOpen(false); // Cerrar el calendario después de seleccionar una fecha
  };

  const handleRangeChange = (range) => {
    setStartDate(range?.from || null);
    setEndDate(range?.to || null);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-[#dddcdc]">
          <div className="flex justify-between mb-8">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold lg:text-4xl">Turnos</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold lg:text-xl">Selecciona el Día o Intervalo:</span>
                <Button onClick={() => setViewOption('day')} variant={viewOption === 'day' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-lg hover:bg-naranja hover:opacity-70  hover:text-white ${viewOption === 'day' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Día</Button>
                <Button onClick={() => setViewOption('range')} variant={viewOption === 'range' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-lg hover:bg-naranja hover:opacity-70 hover:text-white ${viewOption === 'range' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Intervalo</Button>
              </div>
              <div className='w-full items-center justify-center'>
                <div className='relative'>
                  {viewOption === 'day' ? (
                    <>
                      <button
                        onClick={toggleCalendar}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-black" style={{ borderRadius: '8px' }}
                      >
                        {selectedDate ? selectedDate.toLocaleDateString() : <CalendarDays className='w-48' />}
                      </button>

                      {isOpen && (
                        <div className="absolute mt-2 z-10 bg-white shadow-lg rounded-lg">
                          <DayPicker selected={selectedDate} onDayClick={handleDateChange} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={toggleCalendar}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-black" style={{ borderRadius: '8px' }}
                      >
                        {startDate && endDate ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : 'Seleccionar Intervalo'}
                      </button>

                      {isOpen && (
                        <div className="absolute mt-2 z-10 bg-white shadow-lg rounded-lg">
                          <DayPicker
                            mode="range"
                            selected={{ from: startDate, to: endDate }}
                            onSelect={handleRangeChange}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {Object.keys(groupedBookings)
                  .sort((a, b) => new Date(a) - new Date(b)) // Ordenar las fechas de menor a mayor
                  .map(date => (
                    <div key={date} className='pt-6'>
                      <h1 className='text-lg font-bold pb-3 lg:text-xl'>{new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-center">
                        {groupedBookings[date].map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-white rounded-lg shadow-sm p-4 space-y-3 "
                            style={{ borderRadius: '8px' }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold lg:text-xl">{booking.usuario.nombre}</h3>
                                <p className="text-sm font-medium text-gray-500 lg:text-lg">{`${booking.horario.horaInicio} - ${booking.horario.horaFin}`}</p>
                                <p className='text-sm font-medium text-gray-800 lg:text-lg'>{`Monto total: $${booking.monto_total}`}</p>
                                <p className='text-sm font-medium text-gray-800 lg:text-lg'>{`Monto seña: $${booking.monto_seña}`}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="text-center px-3 py-1 bg-gray-300 rounded-full text-xs lg:text-base w-3/4">
                                {`Estado: ${booking.estado}`}
                              </span>
                              <span className="text-center px-3 py-1 bg-gray-300 rounded-full lg:text-base text-xs w-3/4">
                                {`Cancha ${booking.cancha.nro} - ${booking.cancha.tipoCancha}`}
                              </span>
                            </div>

                            <div className="flex gap-2 justify-center">
                              <button
                                style={{ borderRadius: '4px' }}
                                size="icon"
                                className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
                              >
                                <Trash2 className="h-4 w-4 lg:h-6 lg:w-6" />
                              </button>
                              <button
                                style={{ borderRadius: '4px' }}
                                size="icon"
                                className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
                              >
                                <PenSquare className="h-4 w-4 lg:h-6 lg:w-6" />
                              </button>
                              <button
                                style={{ borderRadius: '4px' }}
                                size="icon"
                                className="bg-green-500 hover:bg-green-600 text-white p-2"
                              >
                                <Phone className="h-4 w-4 lg:h-6 lg:w-6" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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