import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '@/lib/axiosConfig';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Loading from '@/components/loading';
import { useNavigate } from 'react-router-dom';

export default function VerGrilla() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [grid, setGrid] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [courts, setCourts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const formattedDate = currentDate.toISOString().split('T')[0];
        const response = await api.get(`/grilla?fecha=${formattedDate}`);
        setGrid(response.data.grid);

        const times = Object.keys(response.data.grid);
        const courts = Object.keys(response.data.grid[times[0]]).map(court => ({
          nro: court,
          tipo: response.data.grid[times[0]][court].tipo
        }));
        
        setTimeSlots(times);
        setCourts(courts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching grid:', error);
      }
    };

    fetchGrid();
  }, [currentDate]);

  if (loading) {
    return <Loading />;
  }

  const handlePrevDay = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
    setIsOpen(false); // Cerrar el calendario después de seleccionar una fecha
  };

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNavigationTurno = (id) => () => {
    navigate(`/editar-turno/${id}`);
  };


  const exportToPDF = () => {
    const input = document.getElementById('grilla-table');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 width in mm
      const pageHeight = 105; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const dateStr = new Date().toLocaleString().replace(/[/,: ]/g, '-');
      pdf.save(`grilla-${dateStr}.pdf`);
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Grilla de Turnos</h2>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex gap-2 items-center">
            <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={toggleCalendar}
              className="px-4 py-2 bg-white rounded-lg text-sm lg:text-lg font-medium text-black"
              style={{ borderRadius: '8px' }}
            >
              {currentDate ? format(currentDate, 'PPP', { locale: es }) : <CalendarDays className='w-48' />}
            </button>
            <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
            </div>
            <button
            onClick={exportToPDF}
            className=" px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Exportar a PDF
          </button>
          </div>

          {isOpen && (
            <div className="absolute z-10 bg-white shadow-lg rounded-lg">
              <DayPicker selected={currentDate} onDayClick={handleDateChange} />
            </div>
          )}

          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-blue-500 rounded"></div>
              <span>Turnos fijos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-green-500 rounded"></div>
              <span>Turnos únicos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-orange-500 rounded"></div>
              <span>Torneos</span>
            </div>
          </div>

          <div className="overflow-x-auto bg-white" id="grilla-table">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2"></th>
                  {timeSlots.map((time) => (
                    <th key={time} className="border p-2 min-w-[60px]">
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courts.map((court, courtIndex) => (
                  <tr key={court.nro}>
                    <td className="border p-2 font-medium">{`Cancha ${court.nro} - ${court.tipo.toUpperCase()}`}</td>
                    {timeSlots.map((time) => {
                      const key = `${time}-${court.nro}`;
                      const reservation = grid[time]?.[court.nro]?.turno;
                      return (
                        <td key={key} className="border max-w-20 p-2 h-12">
                          {reservation ? (
                            <div 
                            onClick={handleNavigationTurno(reservation.id)}
                            className=" w-full h-full rounded p-1 hover:cursor-pointer" style={{ backgroundColor: reservation.tipo === "fijo" ? "#1E90FF" : reservation.tipo === "unico" ? "#32CD32" : "#FFA500" }}>
                              <p className="text-xs font-bold">{reservation.usuario.nombre}</p>
                              <p className="text-xs">{reservation.estado}</p>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}