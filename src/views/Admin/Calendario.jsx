import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useNavigate } from 'react-router-dom'

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Calendar() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(11) // 0-based, 7 = August
  const [currentYear, setCurrentYear] = useState(2024)
  const [reservations, setReservations] = useState({})

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/disponibilidad')
      .then(response => response.json())
      .then(data => setReservations(data))
      .catch(error => console.error('Error fetching reservations:', error))
  }, [])

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Adjust to Monday-based week
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const days = []

    // Previous month days
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1)
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      })
    }

    // Next month days
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      })
    }

    return days
  }

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getReservationsForDate = (date) => {
    const formattedDate = formatDate(date)
    return reservations[formattedDate] || []
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = prev + direction
      if (newMonth > 11) {
        setCurrentYear(currentYear + 1)
        return 0
      }
      if (newMonth < 0) {
        setCurrentYear(currentYear - 1)
        return 11
      }
      return newMonth
    })
  }

  const handleTurnosClick = () => {
    navigate('/ver-turnos')
  }
  
  const handleDayClick = (date) => {
    const formattedDate = formatDate(date);  // Convertir la fecha al formato 'YYYY-MM-DD'
    navigate(`/horariosReserva/${formattedDate}`);  // Redirigir a la ruta dinámica con la fecha
  }

  return (
    <>
    <Header />
    
    <div className="w-full  bg-gray-100 font-inter">
      <div className="bg-white rounded-lg shadow ">
        <div className="flex mx-5 lg:p-6 mt-4 justify-between items-center mb-6">
          <h2 className="text-2xl font-bold lg:text-4xl">Reservas</h2>
          <button onClick={handleTurnosClick} className=" text-sm tracking-wide h-8 px-2 items-center bg-black text-white hover:bg-black/90" style={{borderRadius: '6px'}}>
            Ver Turnos
          </button>
        </div>

        <div className="flex justify-between items-center mb-4 lg:px-6">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-medium">
            {new Date(currentYear, currentMonth).toLocaleString('es', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto lg:px-6">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="bg-white p-2 text-sm font-medium text-center">
              {day}
            </div>
          ))}
          
          {generateCalendarDays().map((day, index) => {
            const reservations = getReservationsForDate(day.date)
            return (
              <div 
                key={index}
                className={`bg-white min-h-[100px] hover:cursor-pointer p-2 ${
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}
                onClick={() => handleDayClick(day.date)}
              >
                <span className="block text-sm mb-1">{day.day}</span>
                {reservations.map((reservation, idx) => (
                  <div 
                    key={idx}
                    className="text-xs bg-[#FF5533] text-white p-1 mb-1 rounded"
                  >
                    {reservation}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}