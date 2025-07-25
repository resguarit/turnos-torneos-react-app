import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin, ChevronRight, Check, CreditCard, ArrowRight } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import { format, addDays, startOfToday, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import ReservationModal from '@/components/Reserva/ReservationModal';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import BtnLoading from '@/components/BtnLoading';
import { useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';

const ReservaMobile = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [inactiveDays, setInactiveDays] = useState([]);
  const [loadingInactive, setLoadingInactive] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [courts, setCourts] = useState([]);
  const [user, setUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loadingCancha, setLoadingCancha] = useState(false);
  const [expandedCourt, setExpandedCourt] = useState(null);
  const { deporteId } = useParams();
  const [deporte, setDeporte] = useState(null);
  const [loadingDeporte, setLoadingDeporte] = useState(false);
  const [isTodaySelected, setIsTodaySelected] = useState(false);

  const navigate = useNavigate(); // Inicializa useNavigate

  // Generar fechas para el próximo mes
  const generateCalendarDates = () => {
    const today = startOfToday();
    const nextMonth = Array(15)
      .fill(null)
      .map((_, index) => {
        const date = addDays(today, index);
        return {
          full: format(date, 'yyyy-MM-dd'),
          day: format(date, 'EEE', { locale: es }),
          date: format(date, 'd'),
          month: format(date, 'MMM', { locale: es }),
          dateObj: date
        };
      });
    return nextMonth;
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const response = await api.get(`/usuarios/${userId}`);
          const userData = response.data.user;
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };
    const fetchDeporte = async () => {
      setLoadingDeporte(true);
      try {
        const response = await api.get(`/deportes/${deporteId}`);
        setDeporte(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching sport details:', error);
      } finally {
        setLoadingDeporte(false);
      }
    };

    fetchUserDetails();
    fetchDeporte();
  }, []);

  // Estado para las fechas del calendario
  const [calendarDates] = useState(generateCalendarDates());

  // Modificar el efecto que maneja la selección de fecha
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection
    setSelectedCourt(null); // Reset court selection

    const todayForComparison = new Date(); // Hora actual local para comparación
    console.log(todayForComparison);
    const selectedDateObj = new Date(date.dateObj.getFullYear(), date.dateObj.getMonth(), date.dateObj.getDate());

    const calculatedIsToday = selectedDateObj.getFullYear() === todayForComparison.getFullYear() &&
                            selectedDateObj.getMonth() === todayForComparison.getMonth() &&
                            selectedDateObj.getDate() === todayForComparison.getDate();
    setIsTodaySelected(calculatedIsToday);

    try {
      setLoadingHorario(true);
      const response = await api.get(`/disponibilidad/fecha?fecha=${date.full}`, {
        params: {
          deporte_id: deporteId
        }
      });
      
      let horariosFiltrados = response.data.horarios
        .filter(horario => horario.disponible)
        .map((horario) => ({
          id: horario.id,
          time: `${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`,
          hora_inicio: horario.hora_inicio // Mantener hora_inicio para la lógica de filtrado
        }));

      if (calculatedIsToday) {
        const ahora = new Date(); // Hora actual local del cliente
        horariosFiltrados = horariosFiltrados.filter(horario => {
          const [hours, minutes] = horario.hora_inicio.split(':').map(Number);
          // Construir la fecha/hora del turno usando los componentes de selectedDateObj para asegurar que es la fecha correcta sin corrupciones de zona horaria
          const fechaHoraTurno = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate(), hours, minutes);
          return fechaHoraTurno > ahora;
        });
      }
      
      setAvailability(horariosFiltrados);
      
      if (horariosFiltrados.length > 0) {
        const primerHorarioDisponible = horariosFiltrados[0];
        setSelectedTime(primerHorarioDisponible.id);
        const canchasResponse = await api.get(`/disponibilidad/cancha?fecha=${date.full}&horario_id=${primerHorarioDisponible.id}`, {
          params: {
            deporte_id: deporteId
          }
        });
        const canchasDisponibles = canchasResponse.data.canchas.filter(court => court.disponible);
        setCourts(canchasDisponibles);
        
        // Autoseleccionar la primera cancha disponible
        if (canchasDisponibles.length > 0) {
          setSelectedCourt(canchasDisponibles[0]);
        }
      } else {
        setCourts([]); // Reset courts if no times are available
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Error al cargar los horarios disponibles');
    } finally {
      setLoadingHorario(false);
    }
  };

  // Modificar el efecto que maneja la selección de horario
  const handleTimeSelect = async (timeId) => {
    setSelectedTime(timeId);
    setSelectedCourt(null); // Reset court selection
    
    try {
      setLoadingCancha(true);
      // Ensure selectedDate is not null before accessing its properties
      if (selectedDate) {
        const response = await api.get(`/disponibilidad/cancha?fecha=${selectedDate.full}&horario_id=${timeId}`, {
          params: {
            deporte_id: deporteId
          }
        });
        const canchasDisponibles = response.data.canchas.filter(court => court.disponible);
        setCourts(canchasDisponibles);
        
        // Autoseleccionar la primera cancha disponible
        if (canchasDisponibles.length > 0) {
          setSelectedCourt(canchasDisponibles[0]);
        }
      } else {
        console.error('selectedDate is null');
        toast.error('Por favor, selecciona una fecha primero.');
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
      toast.error('Error al cargar las canchas disponibles');
    } finally {
      setLoadingCancha(false);
    }
  };

  // Handler para confirmar la reserva
  const handleConfirm = () => {
    const token = localStorage.getItem('token');
    
    if (!selectedDate?.dateObj || !isValid(selectedDate?.dateObj)) {
      console.error('Invalid selectedDate:', selectedDate);
      toast.error('Por favor, selecciona una fecha válida.');
      return;
    }

    if (!token) {
      localStorage.setItem('reservaTemp', JSON.stringify({
        fecha: format(selectedDate.dateObj, 'yyyy-MM-dd'),
        horario_id: selectedTime,
        cancha_id: selectedCourt.id,
        monto_total: selectedCourt.precio_por_hora,
        monto_seña: selectedCourt.seña
      }));
      navigate(`/confirmar-turno?time=${selectedTime}&date=${format(selectedDate.dateObj, 'yyyy-MM-dd')}&court=${selectedCourt.id}`);
      return;
    }
  
    setConfirmLoading(true);
    try {
      const formattedDate = format(selectedDate.dateObj, 'yyyy-MM-dd');
      
      api.post('/turnos/bloqueotemporal', {
        fecha: formattedDate,
        horario_id: selectedTime,
        cancha_id: selectedCourt.id
      })
      .then(response => {
        if (response.status === 201) {
          localStorage.setItem('reservaTemp', JSON.stringify({
            fecha: formattedDate,
            horario_id: selectedTime,
            cancha_id: selectedCourt.id,
            monto_total: selectedCourt.precio_por_hora,
            monto_seña: selectedCourt.seña
          }));
          
          navigate(`/bloqueo-reserva`);
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 409) {
          toast.error('Otra persona está reservando este turno');
        } else {
          console.error('Error completo:', error);
          toast.error(error.response?.data?.message || 'Error al crear el bloqueo temporal');
        }
      })
      .finally(() => {
        setConfirmLoading(false);
      });
    } catch (error) {
      setConfirmLoading(false);
      console.error('Error inesperado:', error);
      toast.error('Error inesperado al procesar la reserva');
    }
  };

  // Obtener slot completo seleccionado
  const selectedSlot = courts.find(court => court === selectedCourt);

  // Formatear la fecha al formato "dd/MM/yyyy"
  const formattedDate = selectedDate ? format(new Date(selectedDate.full), "dd/MM/yyyy") : '';

  // Obtener el nombre del tiempo seleccionado
  const selectedTimeName = availability.find(time => time.id === selectedTime)?.time || '';

  const formatDeporteName = (deporte) => {
    if (!deporte) {
      return 'Cargando...'
    }

    if (deporte.nombre.toLowerCase().includes("futbol") || deporte.nombre.toLowerCase().includes("fútbol")) {
      return `${deporte.nombre} ${deporte.jugadores_por_equipo}`
    }
    return deporte.nombre
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <Header />
      <div className='flex items-start justify-start p-4'>
        <BackButton ruta="/select-deporte" />
      </div>
      <main className="flex-grow p-6 bg-gray-100">
        {/* Selector de Fechas */}
        <div className="bg-white md:mx-40 lg:mx-60 p-4 mb-4 shadow-sm rounded-[8px]">
          <h1 className="text-xl md:text-2xl text-center font-semibold mb-4">Reserva tu cancha para <span className='text-green-600'>{formatDeporteName(deporte)}</span></h1>
          <div className="flex flex-col items-start justify-start mb-3">
            <div className="flex items-center">
              <Calendar size={18} className="text-naranja mr-2" />
              <h2 className="font-medium">Fecha</h2>
            </div>
            <p className='text-xs md:text-sm text-gray-400 mt-1'>Seleccione la fecha en la que desea sacar un turno</p>

          </div>
          
          <div className="flex overflow-x-auto py-2 -mx-2 scrollbar-hide">
            {calendarDates.map((date, index) => {
              const today = startOfToday();
              const isToday = format(date.dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              return (
                <div 
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`flex-shrink-0 w-12 md:w-16 mx-1  rounded-xl p-2 flex flex-col items-center cursor-pointer ${
                    selectedDate?.full === date.full 
                      ? 'bg-naranja text-white' 
                      : 'bg-gray-100'
                  }`}
                >
                  <span className="text-sm md:text-base uppercase">{isToday ? 'HOY' : date.day}</span>
                  <span className="text-lg md:text-xl font-bold">{date.date}</span>
                  <span className="text-xs md:text-sm capitalize">{date.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selector de Horarios */}
        {selectedDate && (
          <div className="bg-white p-4 md:mx-40 lg:mx-60 mb-4 shadow-sm rounded-[8px] ">
            <div className="flex items-center mb-1">
              <Clock size={18} className="text-naranja mr-2" />
              <h2 className="font-medium">Horario</h2>
            </div>
            <p className='text-xs md:text-sm text-gray-400 mb-3'>Seleccione el horario disponible en el que desea sacar un turno</p>

            {loadingHorario ? (
              <div className='w-full flex justify-center'>
              <BtnLoading />
              </div>
            ) : (
              availability.length === 0 ? (
                <p className="text-center text-gray-500 py-2">
                  {isTodaySelected && selectedDate 
                    ? "No hay más horarios disponibles para hoy."
                    : "No hay horarios disponibles para la fecha seleccionada."}
                </p>
              ) : (
                <div className="flex overflow-x-auto py-2 -mx-2 scrollbar-hide">
                  {availability.map((horario, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelect(horario.id)}
                      className={`flex-shrink-0 text-sm md:text-base mx-1 rounded-[6px] p-1 px-2 ${
                        selectedTime === horario.id
                          ? 'bg-naranja text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {horario.time}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Selector de Canchas */}
        {selectedTime && (
          <div className="bg-white md:mx-40 lg:mx-60 p-4 mb-4 shadow-sm rounded-[8px]">
            <div className="flex items-center mb-1">
              <MapPin size={18} className="text-naranja mr-2" />
              <h2 className="font-medium">Cancha</h2>
            </div>
            <p className='text-xs md:text-sm text-gray-400 mb-3'>Seleccione la cancha disponible en la que desea sacar un turno</p>

            {loadingCancha ? (
              <div className='w-full flex justify-center'>
              <BtnLoading />
              </div>
            ) : (
              <div className="flex flex-col">
                {courts.map((court, index) => (
                  <div key={index}>
                    <button
                      onClick={() => {
                        setSelectedCourt(court);
                        setExpandedCourt(expandedCourt === court.id ? null : court.id);
                      }}
                      className={`flex-shrink-0 mb-2 text-start items-center justify-between flex rounded-[6px] p-2 px-3 w-full ${
                        selectedCourt === court ? 'bg-naranja text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className='flex flex-col text-sm md:text-base'>
                        Cancha {court.nro} - {court.tipo}
                        <span className='text-xs md:text-sm'>{court.descripcion}</span>
                      </div>
                      <ChevronDown size={18} />
                    </button>
                    {expandedCourt === court.id && (
                      <div className="mb-2 p-4 bg-gray-100 rounded-[6px]">
                        <p className="text-sm md:text-base text-gray-800">Precio: <span className="text-naranja">${court.precio_por_hora}</span></p>
                        <p className="text-sm md:text-base text-gray-800">Seña: <span className="text-naranja">${court.seña}</span></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resumen y Confirmación */}
        {selectedCourt && (
          <div className="p-4 md:mx-40 lg:mx-60">
            <button 
              onClick={handleConfirm}
              disabled={confirmLoading}
              className="w-full bg-naranja text-white py-2 rounded-[8px] flex items-center justify-center"
            >
              {confirmLoading ? 'Cargando...' : 'Continuar Reserva'}
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        )}
        
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
};

export default ReservaMobile;