import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function VerGrilla() {
  const [currentDate, setCurrentDate] = useState("2025/01/03");

  const timeSlots = Array.from({ length: 10 }, (_, i) => i + 14);
  const courts = Array.from({ length: 7 }, (_, i) => `cancha ${i + 1}`);

  const reservations = {
    "cancha 1-14": "turnos",
    "cancha 1-15": "turnos",
    "cancha 1-16": "turnos-fijos",
    "cancha 1-20": "turnos",
    "cancha 1-21": "turnos",
    "cancha 1-22": "turnos",
    "cancha 2-16": "torneo",
    "cancha 2-17": "torneo",
    "cancha 2-18": "torneo",
    "cancha 4-14": "turnos",
    "cancha 4-15": "turnos",
    "cancha 4-16": "turnos",
  };

  // const reservations2 = {
  //   "timeSlots": [
  //     "14",
  //     "15",
  //     "16",
  //   ],
  //   "canchas": [
  //     "cancha 1",
  //     "cancha 2",
  //     "cancha 3",
  //     "cancha 4",
  //   ],
  //   "14": {
  //     "cancha 1": {
  //       "id": 1,
  //       "usuario": {
  //         "usuarioID": 1,
  //         "nombre": "Mariano Salas",
  //         "telefono": "2215607115"
  //       },
  //       "monto_total": "100.00",
  //       "monto_seña": "50.00",
  //       "estado": "pendiente",
  //       "tipo": "turno"
  //     }
  //   },
  //   "17": {
  //     "cancha 1": {
  //       "id": 1,
  //     "usuario": {
  //       "usuarioID": 1,
  //       "nombre": "Mariano Salas",
  //       "telefono": "2215607115"
  //     },
  //     "monto_total": "100.00",
  //     "monto_seña": "50.00",
  //     "estado": "pendiente"
  //     }
  //   },
  //     "cancha 2": {
  //       "id": 2,
  //       "usuario": {
  //         "usuarioID": 2,
  //         "nombre": "Juan Perez",
  //         "telefono": "2215607115"
  //       },
  //       "monto_total": "100.00",
  //       "monto_seña": "50.00",
  //       "estado": "pendiente"
  //     }
  //   },
  // }

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

      pdf.save('grilla.pdf');
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Grilla de Turnos</h2>

          <div className="flex items-center gap-4 mb-4">
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg">{currentDate}</span>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-blue-500 rounded"></div>
              <span>Turnos fijos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-green-500 rounded"></div>
              <span>Turnos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-orange-500 rounded"></div>
              <span>Torneos</span>
            </div>
          </div>

          <button
            onClick={exportToPDF}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Exportar a PDF
          </button>

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
                {courts.map((court) => (
                  <tr key={court}>
                    <td className="border p-2 font-medium">{court}</td>
                    {timeSlots.map((time) => {
                      const key = `${court}-${time}`;
                      const reservation = reservations[key];
                      return (
                        <td key={key} className="border p-2 h-12">
                          {reservation && (
                            <div
                              className={`w-full h-full rounded ${
                                reservation === "turnos-fijos"
                                  ? "bg-blue-500"
                                  : reservation === "turnos"
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                              }`}
                            />
                          )}
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