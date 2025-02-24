import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin, ChevronRight, Check, CreditCard, ArrowRight } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { format, addDays, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import ReservationModal from '@/components/Reserva/ReservationModal'; // Importa el modal
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
  const [loadingCancha, setLoadingCancha] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar la visibilidad del modal

  // Generar fechas para el próximo mes
  const generateCalendarDates = () => {
    const today = startOfToday();
    const nextMonth = Array(30)
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

  // Estado para las fechas del calendario
  const [calendarDates] = useState(generateCalendarDates());

  // Modificar el efecto que maneja la selección de fecha
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection
    setSelectedCourt(null); // Reset court selection
    
    try {
      setLoadingHorario(true);
      const response = await api.get(`/disponibilidad/fecha?fecha=${date.full}`);
      const horarios = response.data.horarios
        .filter(horario => horario.disponible)
        .map((horario) => ({
          id: horario.id,
          time: `${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`
        }));
      
      setAvailability(horarios);
      
      // Autoseleccionar el primer horario disponible
      if (horarios.length > 0) {
        setSelectedTime(horarios[0].id);
        // Buscar canchas disponibles para el primer horario
        const canchasResponse = await api.get(`/disponibilidad/cancha?fecha=${date.full}&horario_id=${horarios[0].id}`);
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
        const response = await api.get(`/disponibilidad/cancha?fecha=${selectedDate.full}&horario_id=${timeId}`);
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
    setIsOpen(true); // Abre el modal
  };

  // Handler para cerrar el modal
  const handleCancel = () => {
    setIsOpen(false); // Cierra el modal
  };

  // Obtener slot completo seleccionado
  const selectedSlot = courts.find(court => court === selectedCourt);

  // Formatear la fecha al formato "dd/MM/yyyy"
  const formattedDate = selectedDate ? format(new Date(selectedDate.full), "dd/MM/yyyy") : '';

  // Obtener el nombre del tiempo seleccionado
  const selectedTimeName = availability.find(time => time.id === selectedTime)?.time || '';

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <Header />
      <main className="flex-grow p-6 bg-gray-100">
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <button className="flex items-center text-naranja">
          <ChevronLeft size={20} />
          <span className="ml-1">Volver</span>
        </button>
        <h1 className="text-lg font-bold">Reserva tu cancha</h1>
        <div className="w-6"></div>
      </div>

      {/* Selector de Fechas */}
      <div className="bg-white p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Calendar size={18} className="text-naranja mr-2" />
            <h2 className="font-medium">Fecha</h2>
          </div>
        </div>
        
        <div className="flex overflow-x-auto py-2 -mx-2 scrollbar-hide">
          {calendarDates.map((date, index) => (
            <div 
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`flex-shrink-0 w-16 mx-2 rounded-xl p-2 flex flex-col items-center cursor-pointer ${
                selectedDate?.full === date.full 
                  ? 'bg-naranja text-white' 
                  : 'bg-gray-100'
              }`}
            >
              <span className="text-xs capitalize">{date.day}</span>
              <span className="text-xl font-bold">{date.date}</span>
              <span className="text-xs capitalize">{date.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selector de Horarios */}
      {selectedDate && (
        <div className="bg-white p-4 mb-4">
          <div className="flex items-center mb-3">
            <Clock size={18} className="text-naranja mr-2" />
            <h2 className="font-medium">Horario</h2>
          </div>
          
          <div className="flex overflow-x-auto py-2 -mx-2 scrollbar-hide">
            {availability.map((horario, index) => (
              <button
                key={index}
                onClick={() => handleTimeSelect(horario.id)}
                className={`flex-shrink-0 mx-2 rounded-[6px] p-2 px-4 ${
                  selectedTime === horario.id
                    ? 'bg-naranja text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {horario.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Canchas */}
      {selectedTime && (
        <div className="bg-white p-4 mb-4">
          <div className="flex items-center mb-3">
            <MapPin size={18} className="text-naranja mr-2" />
            <h2 className="font-medium">Cancha</h2>
          </div>
          
          <div className="flex overflow-x-auto py-2 -mx-2 scrollbar-hide">
            {courts.map((court, index) => (
              <button
                key={index}
                onClick={() => setSelectedCourt(court)}
                className={`flex-shrink-0 mx-2 rounded-[6px] p-2 px-4 ${
                  selectedCourt === court
                    ? 'bg-naranja text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {court.nro} - {court.tipo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resumen y Confirmación */}
      {selectedCourt && (
        <div className="p-4">
          <button 
            onClick={handleConfirm}
            className="w-full bg-naranja text-white font-medium py-3 rounded-[8px] flex items-center justify-center"
          >
            Confirmar Reserva
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      )}

      
      {isOpen && (
      <ReservationModal
        showModal={isOpen}
        onCancel={handleCancel}
        selectedDate={formattedDate}
        selectedTimeName={selectedTimeName}
        selectedCourt={selectedCourt}
      />
   
      )
}
</main>
<Footer />
</div>
  );
};

export default ReservaMobile;