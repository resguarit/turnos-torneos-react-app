import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';
import BtnNegro from '@/components/BtnNegro';
import useTimeout from '@/components/useTimeout';
import { decryptRole } from '@/lib/getRole';
const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const combineConsecutiveTimeSlots = (horarios) => {
  if (!horarios || horarios.length === 0) return [];
  
  // Ordenar horarios por hora de inicio
  const sortedHorarios = [...horarios].sort((a, b) => {
    const timeA = a.split(' - ')[0];
    const timeB = b.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

  const combinedHorarios = [];
  let currentRange = {
    start: sortedHorarios[0].split(' - ')[0],
    end: sortedHorarios[0].split(' - ')[1]
  };

  for (let i = 1; i < sortedHorarios.length; i++) {
    const [start, end] = sortedHorarios[i].split(' - ');
    
    if (currentRange.end === start) {
      // Horarios consecutivos, actualizar final del rango
      currentRange.end = end;
    } else {
      // No son consecutivos, guardar el rango actual y empezar uno nuevo
      combinedHorarios.push(`${currentRange.start} - ${currentRange.end}`);
      currentRange = { start, end };
    }
  }
  
  // Agregar el último rango
  combinedHorarios.push(`${currentRange.start} - ${currentRange.end}`);
  
  return combinedHorarios;
};

export default function Calendar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [reservations, setReservations] = useState({});
  const userRoleEncrypted = localStorage.getItem('user_role');
  const userRole = decryptRole(userRoleEncrypted);

  useEffect(() => {
    api.get('/disponibilidad')
      .then(response => {
        const horariosNoDisponibles = response.data.horarios_no_disponibles;
        const formattedReservations = {};
        
        Object.keys(horariosNoDisponibles).forEach(fecha => {
          const horarios = horariosNoDisponibles[fecha].map(horario => 
            `${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`
          );
          formattedReservations[fecha] = combineConsecutiveTimeSlots(horarios);
        });
        
        setReservations(formattedReservations);
      })
      .catch(error => console.error('Error fetching reservations:', error))
      .finally(() => setLoading(false));
  }, []);

  useTimeout(() => {
    if (loading) {
      navigate('/error');
    }
  }, 15000);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Adjust to Monday-based week
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }

    return days;
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getReservationsForDate = (date) => {
    const formattedDate = formatDate(date);
    return reservations[formattedDate] || [];
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = prev + direction;
      if (newMonth > 11) {
        setCurrentYear(currentYear + 1);
        return 0;
      }
      if (newMonth < 0) {
        setCurrentYear(currentYear - 1);
        return 11;
      }
      return newMonth;
    });
  };

  if (loading) {
    return <div><Loading /></div>;
  }

  const handleTurnosClick = () => {
    navigate('/ver-turnos');
  };

  const handleDayClick = (date) => {
    const formattedDate = formatDate(date);  // Convertir la fecha al formato 'YYYY-MM-DD'
    navigate(`/horariosReserva/${formattedDate}`);  // Redirigir a la ruta dinámica con la fecha
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col font-inter">
        <Header />
        <div className="w-full p-6 grow font-inter">
          <div className=" rounded-lg  ">
            <div className="flex  justify-between items-center mb-6">
              <h2 className="text-2xl font-bold lg:text-4xl">Reservas</h2>
              {(userRole === 'admin' || userRole === 'moderador') && (
                <BtnNegro ruta="/ver-turnos" texto="Ver turnos" />
              )}
            </div>

            <div className="flex justify-center gap-8 items-center mb-4 lg:px-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl lg:text-3xl font-medium">
                {new Date(currentYear, currentMonth).toLocaleString('es', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-8 mb-4 lg:text-xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-naranja rounded"></div>
                <span>Turnos no disponibles</span>
              </div>
            </div>

            <div className="overflow-x-auto ">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="bg-white p-2 text-sm font-medium text-center">
                    {day}
                  </div>
                ))}

                {generateCalendarDays().map((day, index) => {
                  const reservationsForDay = getReservationsForDate(day.date);
                  return (
                    <div
                      key={index}
                      className={`bg-white min-h-[100px] hover:cursor-pointer p-2 ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}
                      onClick={() => handleDayClick(day.date)}
                    >
                      <span className={`block text-sm mb-1`}>
                        {day.day}
                      </span>
                      {reservationsForDay.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {reservationsForDay.map((horario, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-naranja text-white p-1 rounded"
                            >
                              {horario}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}