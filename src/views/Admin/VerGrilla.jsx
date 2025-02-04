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
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import useTimeout from '@/components/useTimeout';
import * as XLSX from 'xlsx';
import LoadingSinHF from '@/components/LoadingSinHF';

export default function VerGrilla() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [grid, setGrid] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [courts, setCourts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchGrid = async (signal) => {
      try {
        const formattedDate = currentDate.toISOString().split('T')[0];
        const response = await api.get(`/grilla?fecha=${formattedDate}`, {signal});
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
        if (!signal?.aborted) {
          console.error('Error fetching grid:', error);
        }
      } finally {
        if (!signal?.aborted){
          setLoading(false);
        }
      }
    };

    fetchGrid(signal);

    return () => {
      controller.abort();
    };
  }, [currentDate]);

  useTimeout(() => {
    if (loading) {
      navigate('/error');
    }
  }, 20000);

  if (loading) {
    return <LoadingSinHF />;
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

  const exportToExcel = () => {
    // Crear el encabezado con las fechas dinámicamente
    const headers = ['Cancha', ...timeSlots];
  
    // Construir las filas de datos
    const rows = courts.map((court) => {
      const row = [`Cancha ${court.nro} - ${court.tipo}`]; // Primera celda con la cancha
      timeSlots.forEach((time) => {
        const reservation = grid[time]?.[court.nro]?.turno;
        row.push(
          reservation
            ? `${reservation.usuario.nombre || ''}\n(${reservation.estado || ''})\n${reservation.tipo || ''}`
            : ''
        );
      });
      return row;
    });
  
    // Combinar encabezados y filas
    const data = [headers, ...rows];
  
    // Crear la hoja de cálculo a partir del arreglo bidimensional
    const worksheet = XLSX.utils.aoa_to_sheet(data);
  
    // Aplicar estilos a la hoja de cálculo
    const range = XLSX.utils.decode_range(worksheet['!ref']);
  
    // Configuración de las columnas (ancho inicial)
    worksheet['!cols'] = Array(range.e.c + 1).fill({ wpx: 120 }); // Ajustar ancho inicial
  
    // Configurar filas y aplicar la propiedad de ajustar texto
    worksheet['!rows'] = []; // Inicializar las filas
    for (let R = range.s.r; R <= range.e.r; ++R) {
      worksheet['!rows'][R] = { hpx: 50 }; // Ajustar la altura inicial de las filas
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (worksheet[cellRef]) {
          if (!worksheet[cellRef].s) worksheet[cellRef].s = {}; // Asegurarse de inicializar estilos
          worksheet[cellRef].s.alignment = {
            wrapText: true, // Activar ajustar texto
            vertical: 'center', // Alinear verticalmente al centro
            horizontal: 'center', // Alinear horizontalmente al centro
          };
          worksheet[cellRef].s.font = { name: 'Arial', sz: 12 }; // Configurar la fuente
        }
      }
    }
  
    // Crear el libro y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grilla de Turnos');
  
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    XLSX.writeFile(workbook, `grilla-${dateStr}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <main className="flex-1 p-6 bg-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 lg:text-4xl">Grilla de Turnos</h2>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex gap-2 items-center">
            <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 rounded ">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={toggleCalendar}
              className="px-4 py-2 bg-white rounded-lg text-sm lg:text-xl font-medium text-black"
              style={{ borderRadius: '8px' }}
            >
              {currentDate ? format(currentDate, 'PPP', { locale: es }) : <CalendarDays className='w-48' />}
            </button>
            <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={exportToPDF}
                style={{ borderRadius: '8px' }}
                className=" p-3 bg-blue-500 text-white  hover:bg-blue-600 lg:text-xl "
              >
                Exportar a PDF
              </button>
              <button
                onClick={exportToExcel}
                style={{ borderRadius: '8px' }}
                className="p-3 bg-green-500 text-white lg:text-xl hover:bg-green-600"
              >
                Exportar a Excel
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-10 bg-white shadow-lg rounded-lg">
              <DayPicker selected={currentDate} onDayClick={handleDateChange} />
            </div>
          )}

          <div className="flex gap-8 mb-4 lg:text-xl">
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
                    <th key={time} className="border p-2 min-w-[60px] lg:text-xl">
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courts.map((court, courtIndex) => (
                  <tr key={court.nro}>
                    <td className="border p-2 font-medium lg:text-xl">{`Cancha ${court.nro} - ${court.tipo.toUpperCase()}`}</td>
                    {timeSlots.map((time) => {
                      const key = `${time}-${court.nro}`;
                      const reservation = grid[time]?.[court.nro]?.turno;
                      return (
                        <td key={key} className="border max-w-20 p-2 h-12">
                          {reservation ? (
                            <div 
                            onClick={handleNavigationTurno(reservation.id)}
                            className=" w-full h-full rounded p-1 hover:cursor-pointer" style={{ backgroundColor: reservation.tipo === "fijo" ? "#1E90FF" : reservation.tipo === "unico" ? "#32CD32" : "#FFA500" }}>
                              <p className="text-xs lg:text-base font-bold">{reservation.usuario.nombre}</p>
                              <p className="text-xs lg:text-base">{reservation.estado}</p>
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