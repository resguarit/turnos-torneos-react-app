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
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function VerTurnos() {
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewOption, setViewOption] = useState('day'); // 'day' or 'range'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [courts, setCourts] = useState([]);

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

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/canchas')
      .then(response => response.json())
      .then(data => setCourts(data.canchas))
      .catch(error => console.error('Error fetching courts:', error));
  }, []);

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsOpen(false); // Cerrar el calendario después de seleccionar una fecha
  };

  const handleRangeChange = (range) => {
    setStartDate(range?.from || null);
    setEndDate(range?.to || null);

    if (range?.from && range?.to) {
      setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  const filteredBookings = Object.keys(groupedBookings).reduce((acc, date) => {
    const filtered = groupedBookings[date].filter(booking => {
      const matchesSearch = booking.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourt = selectedCourt ? booking.cancha.nro === selectedCourt : true;
      const matchesStatus = selectedStatus ? booking.estado === selectedStatus : true;
      return matchesSearch && matchesCourt && matchesStatus;
    });
    if (filtered.length > 0) {
      acc[date] = filtered;
    }
    return acc;
  }, {});

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-[#dddcdc]">
          <div className="flex justify-between mb-8">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold lg:text-4xl">Turnos</h1>
              <div className="flex flex-col gap-4 items-start lg:flex-row lg:items-center lg:gap-2">
                <span className="text-sm font-semibold lg:text-sm">Selecciona el Día o Intervalo:</span>
                <Button onClick={() => setViewOption('day')} variant={viewOption === 'day' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-sm hover:bg-naranja hover:opacity-70  hover:text-white ${viewOption === 'day' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Día</Button>
                <Button onClick={() => setViewOption('range')} variant={viewOption === 'range' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-sm hover:bg-naranja hover:opacity-70 hover:text-white ${viewOption === 'range' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Intervalo</Button>
                <input
                  type="text"
                  placeholder="Buscar por nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-black"
                  style={{ borderRadius: '8px' }}
                />
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-black"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="">Todas las canchas</option>
                  {courts.map(court => (
                    <option key={court.id} value={court.nro}>Cancha {court.nro}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-black"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Señada">Señada</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
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

                {Object.keys(filteredBookings)
                  .sort((a, b) => new Date(a) - new Date(b)) // Ordenar las fechas de menor a mayor
                  .map(date => (
                    <div key={date} className='pt-6'>
                      <h1 className='text-lg font-bold pb-3'>{format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: es })}</h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center items-center">
                        {filteredBookings[date].map((booking) => (
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