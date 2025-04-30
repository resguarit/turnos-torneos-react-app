import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ChevronLeft, ChevronRight, CalendarDays, User, Phone, AlertCircle } from 'lucide-react';
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
import BtnLoading from '@/components/BtnLoading';
import ModalTurno from '@/components/PanelAdmin/VerGrilla/ModalTurno';

export default function VerGrilla() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [grid, setGrid] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [courts, setCourts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [showTurnoModal, setShowTurnoModal] = useState(false);
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

  /* useTimeout(() => {
    if (loading) {
      navigate('/error');
    }
  }, 20000); */

  if (loading) {
    return (<div className='flex justify-center items-center h-[50vh]'>
    <BtnLoading />
    </div>)
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

  const handleTurnoClick = (turno) => {
    setSelectedTurno(turno);
    setShowTurnoModal(true);
  };

  const handleCloseTurnoModal = () => {
    setShowTurnoModal(false);
    setSelectedTurno(null);
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
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-4 ">
            <div className="flex gap-2 items-center">
            <button onClick={handlePrevDay} className="p-1 hover:bg-gray-100 rounded ">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={toggleCalendar}
              className="px-4 py-2 bg-white rounded-[6px] text-xs sm:text-sm  font-medium text-black"
            >
              {currentDate ? format(currentDate, 'PPP', { locale: es }) : <CalendarDays className='w-48' />}
            </button>
            <button onClick={handleNextDay} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={exportToPDF}
                
                className=" p-2 bg-blue-500 text-white text-xs sm:text-sm rounded-[6px]  hover:bg-blue-600  "
              >
                Exportar a PDF
              </button>
              <button
                onClick={exportToExcel}
                
                className="p-2 bg-green-600 text-white text-xs sm:text-sm rounded-[6px] hover:bg-green-600"
              >
                Exportar a Excel
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-10 bg-white shadow-lg rounded-lg ">
              <DayPicker selected={currentDate} onDayClick={handleDateChange} />
            </div>
          )}

          <div className="flex gap-2 sm:gap-2 md:gap-8 mb-4  text-xs sm:text-base">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-blue-500 rounded "></div>
              <span>Turnos fijos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-green-600 rounded "></div>
              <span>Turnos únicos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-[#FFA500] rounded "></div>
              <span>Torneos</span>
            </div>
          </div>

          <div className="overflow-x-auto bg-white" id="grilla-table">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 "></th>
                  {timeSlots.map((time) => (
                    <th key={time} className="border p-2 sm:text-base text-sm">
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courts.map((court, courtIndex) => (
                  <tr key={court.nro}>
                    <td className="border p-1 font-medium sm:text-base text-sm">{`Cancha ${court.nro} - ${court.tipo.toUpperCase()}`}</td>
                    {timeSlots.map((time) => {
                      const key = `${time}-${court.nro}`;
                      const reservation = grid[time]?.[court.nro]?.turno;
                      return (
                        <td key={key} className="border max-w-14 p-2 h-12">
                          {reservation ? (
                            <div
                              onClick={handleNavigationTurno(reservation.id)}
                              className="w-full h-full rounded p-2 hover:cursor-pointer text-white"
                              style={{
                                backgroundColor:
                                  reservation.tipo === "fijo"
                                    ? "#1E90FF"
                                    : reservation.tipo === "unico"
                                    ? "#16a34a"
                                    : "#FFA500",
                              }}
                            >
                              {reservation.tipo === "torneo" ? (
                                <>
                                  <p className="text-xs lg:text-base font-semibold">
                                    {reservation.partido.torneo} - {reservation.partido.zona}
                                  </p>
                                  <p className="text-xs lg:text-sm font-semibold">
                                    {reservation.partido.fecha}
                                  </p>
                                  <p className="text-xs lg:text-sm">
                                    {reservation.partido.equipos.local} vs {reservation.partido.equipos.visitante}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs lg:text-base font-semibold md:flex items-center hidden">
                                    <User className="w-4 h-4 mr-1" />
                                    {reservation.usuario.nombre}
                                  </p>
                                  <p className="text-xs lg:text-sm md:flex items-center hidden">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {reservation.usuario.telefono}
                                  </p>
                                  <p className="text-xs lg:text-sm md:flex items-center hidden">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {reservation.estado}
                                  </p>
                                </>
                              )}
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

        {/* Modal de Turno */}
        <ModalTurno
          isOpen={showTurnoModal}
          onClose={handleCloseTurnoModal}
          turno={selectedTurno}
        />
      </main>
    </div>
  );
}