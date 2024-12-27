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
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'  

function VerTurnos() {
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewOption, setViewOption] = useState('day'); // 'day' or 'range'

  useEffect(() => {
    // Aca vamos a construir la URL para la consulta a la api en la que depende de si se quiere ver por dia o por rango de fechas o ver todas las reservas
    let url = 'http://127.0.0.1:8000/api/reservas';
    if (viewOption === 'day' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // aca se formatea la fecha para que pase de Fri Dec 31 2021 00:00:00 GMT-0300 (hora de verano de Argentina) a 2021-12-31
      url += `?fecha=${formattedDate}`;
    } else if (viewOption === 'range' && startDate && endDate) {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      url += `?fecha_inicio=${formattedStartDate}&fecha_fin=${formattedEndDate}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Aca se agrupan todas las reservas por fecha
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
    setSelectedDate(date);
    // Cerrar el calendario después de seleccionar una fecha con 200ms de delay
    setTimeout(() => {
      setIsOpen(false);
    }, 100); 
  };

  const handleRangeChange = (range) => {
    setStartDate(range?.from || null);
    setEndDate(range?.to || null);

    // si se eligio un rango de fechas entonces se cierra el calendario con 200ms de delay
    if (range?.from && range?.to) {
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-[#dddcdc]">
          <div className="flex justify-between mb-8">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Turnos</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Selecciona el Día o Intervalo:</span>
                <Button onClick={() => setViewOption('day')} variant={viewOption === 'day' ? 'default' : 'outline'} className={`px-4 py-2 ${viewOption === 'day' ? 'bg-naranja text-white' : 'bg-white text-black'}`} style={{ borderRadius: '8px' }}>Día</Button>
                <Button onClick={() => setViewOption('range')} variant={viewOption === 'range' ? 'default' : 'outline'} className={`px-4 py-2 ${viewOption === 'range' ? 'bg-naranja text-white' : 'bg-white text-black'}`} style={{ borderRadius: '8px' }}>Intervalo</Button>
              </div>
              <div className='w-full items-center justify-center'>
                <div className='relative'>
                  {viewOption === 'day' ? (
                    <>
                      <button
                        onClick={toggleCalendar}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-black" style={{ borderRadius: '8px' }}
                      >
                        {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : <CalendarDays className='w-48' />}
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
                        {startDate && endDate ? `${format(startDate, 'PPP', { locale: es })} - ${format(endDate, 'PPP', { locale: es })}` : 'Seleccionar Intervalo'}
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
                      <h1 className='text-lg font-bold pb-3'>{format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: es })}</h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center items-center">
                        {groupedBookings[date].map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-white rounded-lg shadow-sm p-4 space-y-3 "
                            style={{ borderRadius: '8px' }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{booking.usuario.nombre}</h3>
                                <p className="text-sm font-medium text-gray-500">{`${booking.horario.horaInicio} - ${booking.horario.horaFin}`}</p>
                                <p className='text-sm font-medium text-gray-800'>{`Monto total: $${booking.monto_total}`}</p>
                                <p className='text-sm font-medium text-gray-800'>{`Monto seña: $${booking.monto_seña}`}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="text-center px-3 py-1 bg-gray-300 rounded-full text-xs w-3/4">
                                {`Estado: ${booking.estado}`}
                              </span>
                              <span className="text-center px-3 py-1 bg-gray-300 rounded-full text-xs w-3/4">
                                {`Cancha ${booking.cancha.nro} - ${booking.cancha.tipoCancha}`}
                              </span>
                              <span className="text-center px-3 py-1 bg-gray-300 rounded-full text-xs w-3/4">
                                {`Id ${booking.id}`}
                              </span>
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
                              <button
                                style={{ borderRadius: '4px' }}
                                size="icon"
                                className="bg-green-500 hover:bg-green-600 text-white p-2"
                              >
                                <Phone className="h-4 w-4" />
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