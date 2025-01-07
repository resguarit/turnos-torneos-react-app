import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CalendarDays } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { Eye } from 'lucide-react'
import { Phone } from 'lucide-react'
import { PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'; 
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton'
import ModalConfirmation from '@/components/ModalConfirmation';

function VerTurnos() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewOption, setViewOption] = useState('day'); // 'day' or 'range'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [courts, setCourts] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

    api.get(url)
      .then(response => {
        const grouped = response.data.reservas.reduce((acc, booking) => {
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
    api.get('/canchas')
      .then(response => setCourts(response.data.canchas))
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

  const handleNavigationGrid = () => {
    navigate('/grilla-turnos');
  };
    
  const handleVerTurno = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleStatusChange = (e) => {
    setSelectedBooking({ ...selectedBooking, estado: e.target.value });
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


  const handleDeleteSubmit = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    console.log("Turno seleccionado:", booking);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
  };

  const confirmDeleteSubmit = async () => {
    setShowModal(false);
    try {
      const response = await api.delete(`/reservas/${selectedBooking.id}`);
      if (response.status === 200) {
        console.log("Reserva eliminada correctamente:", response.data);
        // Actualiza el estado para reflejar la eliminación
        setGroupedBookings(prev => {
          const updated = { ...prev };
          const date = selectedBooking.fecha_turno.split('T')[0];
          updated[date] = updated[date].filter(booking => booking.id !== selectedBooking.id);
          if (updated[date].length === 0) {
            delete updated[date];
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-[#dddcdc]">
          <div className=" mb-8">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold lg:text-4xl">Turnos</h1>
              <div className='flex justify-between'>
              <div className="flex flex-col gap-4 items-start lg:flex-row lg:items-center lg:gap-2">
                <span className="text-sm font-semibold lg:text-xl">Selecciona el Día o Intervalo:</span>
                <Button onClick={() => setViewOption('day')} variant={viewOption === 'day' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-lg hover:bg-naranja hover:opacity-70  hover:text-white ${viewOption === 'day' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Día</Button>
                <Button onClick={() => setViewOption('range')} variant={viewOption === 'range' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-lg hover:bg-naranja hover:opacity-70 hover:text-white ${viewOption === 'range' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Intervalo</Button>
                <input
                  type="text"
                  placeholder="Buscar por nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-white rounded-lg text-sm lg:text-lg font-medium text-black"
                  style={{ borderRadius: '8px' }}
                />
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="px-4 py-3 bg-white rounded-lg text-sm lg:text-lg font-medium text-black"
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
                  className="px-4 py-3 bg-white rounded-lg text-sm lg:text-lg font-medium text-black"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Señada">Señada</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="flex gap-4 items-center">
                <Button
                  variant="default"
                  onClick={handleNavigationGrid}
                  className="px-4 py-3 bg-black text-white lg:text-lg hover:bg-black"
                  style={{ borderRadius: '8px' }}
                >
                  Ver Grilla
                </Button>
              </div>
            </div>

              <div className='w-full items-center justify-center'>
                <div className='relative'>
                  {viewOption === 'day' ? (
                    <>
                      <button
                        onClick={toggleCalendar}
                        className="px-4 py-2 bg-white rounded-lg text-sm lg:text-lg font-medium text-black" style={{ borderRadius: '8px' }}
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
                    <div key={date} className='pt-6 w-3/4'>
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
                              <span
                                className={`text-center px-3 py-1 rounded-full text-xs lg:text-base w-3/4 ${
                                  booking.estado === 'Pendiente'
                                    ? 'bg-yellow-300'
                                    : booking.estado === 'Señada'
                                    ? 'bg-blue-300'
                                    : booking.estado === 'Pagada'
                                    ? 'bg-green-300'
                                    : 'bg-red-300'
                                }`}
                              >
                                {`Estado: ${booking.estado}`}
                              </span>
                              <span className="text-center px-3 py-1 bg-gray-300 rounded-full lg:text-base text-xs w-3/4">
                                {`Cancha ${booking.cancha.nro} - ${booking.cancha.tipoCancha}`}
                              </span>
                            </div>

                            <div className="flex gap-2 justify-center">
                              <button
                                style={{ borderRadius: '4px' }}
                                onClick={() => handleDeleteSubmit(booking)}
                                size="icon"
                                className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
                              >
                                <Trash2 className="h-4 w-4 lg:h-6 lg:w-6" />
                              </button>
                              <button
                                style={{ borderRadius: '4px' }}
                                size="icon"
                                className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
                                onClick={() => navigate(`/editar-turno/${booking.id}`)}
                              >
                                <PenSquare className="h-4 w-4 lg:h-6 lg:w-6" />
                              </button>
                              <button
                                style={{ borderRadius: '4px' }}
                                onClick={() => window.open(`https://api.whatsapp.com/send?phone=549${booking.usuario.telefono}`, '_blank')}
                                size="icon"
                                className="bg-green-500 hover:bg-green-600 text-white p-2"
                              >
                                <Phone className="h-4 w-4 lg:h-6 lg:w-6" />
                              </button>
                              {/* <button
                                style={{ borderRadius: '4px' }}
                                size="icon"
                                className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
                                onClick={() => handleVerTurno(booking)}
                              >
                                <Eye className="h-4 w-4 lg:h-6 lg:w-6" />
                              </button> */}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {showModal && <ModalConfirmation onConfirm={confirmDeleteSubmit} onCancel={closeDeleteModal} title="Eliminar Turno" subtitle={"Desea Eliminar el turno?"} botonText1={"Cancelar"} botonText2={"Eliminar"} />}
        </main>
        <Footer />
      </div>

      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md lg:max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold lg:text-3xl">Detalles del Turno</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 lg:text-2xl">
              <p><strong>Nombre:</strong> {selectedBooking.usuario.nombre}</p>
              <p><strong>Teléfono:</strong> {selectedBooking.usuario.telefono}</p>
              <p><strong>Horario:</strong> {selectedBooking.horario.horaInicio} - {selectedBooking.horario.horaFin}</p>
              <p><strong>Monto Total:</strong> ${selectedBooking.monto_total}</p>
              <p><strong>Monto Seña:</strong> ${selectedBooking.monto_seña}</p>
              <p><strong>Cancha:</strong> {selectedBooking.cancha.nro} - {selectedBooking.cancha.tipoCancha}</p>
              <div>
                <strong><label htmlFor="estado" className=" lg:text-2xl">Estado:</label></strong>
                <select
                  id="estado"
                  value={selectedBooking.estado}
                  onChange={handleStatusChange}
                  className="px-3 items-center bg-white rounded-lg text-sm lg:text-2xl  text-black"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Señada">Señada</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button style={{ borderRadius: '8px' }} onClick={handleCloseModal} className="bg-naranja text-white lg:text-2xl font-semibold px-4 py-2 hover:bg-[#FF5533]/90">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default VerTurnos;