import React, { useEffect, useState } from "react";
import api from "@/lib/axiosConfig";
import TarjetaGrupoClasesFijas from "./TarjetaGrupoClasesFijas";
import BtnLoading from "@/components/BtnLoading";
import { Info } from "lucide-react";

// Utilidades para obtener días y horas
const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const todasLasHoras = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00:00`);

const colorClase = (tipo) => tipo === "fija" ? "bg-naranja" : "bg-green-100 border-green-400";

const CalendarioClases = () => {
  const [grilla, setGrilla] = useState({});
  const [clasesFijas, setClasesFijas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los selectores de hora con configuración guardada
  const [horaInicio, setHoraInicio] = useState(() => 
    localStorage.getItem('calendario-hora-inicio') || '08:00:00'
  );
  const [horaFin, setHoraFin] = useState(() => 
    localStorage.getItem('calendario-hora-fin') || '00:00:00'
  );

  // Calcular horas filtradas basadas en la selección
  const horasFiltradas = React.useMemo(() => {
    const inicioIndex = todasLasHoras.indexOf(horaInicio);
    let finIndex = todasLasHoras.indexOf(horaFin);
    
    // Si horaFin es 00:00:00, incluir hasta el final del día
    if (horaFin === '00:00:00') {
      finIndex = 23;
    }
    
    if (inicioIndex <= finIndex) {
      return todasLasHoras.slice(inicioIndex, finIndex + 1);
    } else {
      // Caso especial: atraviesa medianoche (ej: 22:00 a 02:00)
      return [...todasLasHoras.slice(inicioIndex), ...todasLasHoras.slice(0, finIndex + 1)];
    }
  }, [horaInicio, horaFin]);

  // Guardar configuración en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('calendario-hora-inicio', horaInicio);
  }, [horaInicio]);

  useEffect(() => {
    localStorage.setItem('calendario-hora-fin', horaFin);
  }, [horaFin]);

  useEffect(() => {
    const fetchGrilla = async () => {
      setLoading(true);
      try {
        const response = await api.get("/clases/fijas/grilla");
        console.log('response:', response.data);
        setGrilla(response.data);
        console.log('grilla:', response.data);
        setClasesFijas(response.data.clases_fijas || []);
      } catch (error) {
        console.error('Error al cargar la grilla de clases fijas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrilla();
  }, []);

  if (loading) {
    return <BtnLoading />;
  }

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex items-center justify-start mb-2">
        <Info className="w-4 h-4 mr-2" />
        <p className="text-gray-500 text-sm">
          Solo se muestran las <span className="font-bold">clases fijas</span> en el calendario
        </p>
      </div>
      
      {/* Selectores de hora */}
      <div className="flex gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Desde:</label>
          <select
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {todasLasHoras.map(hora => (
              <option key={hora} value={hora}>
                {hora.slice(0, 5)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Hasta:</label>
          <select
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {todasLasHoras.map(hora => (
              <option key={hora} value={hora}>
                {hora === '00:00:00' ? '00:00 (Medianoche)' : hora.slice(0, 5)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="min-w-full border rounded-lg bg-white mb-8">
        <thead className="bg-naranja">
          <tr>
            <th className="border-b border-gray-300 px-2 py-2 text-xs text-white w-16">Hora</th>
            {diasSemana.map(dia => (
              <th key={dia} className="border-b border-gray-300 px-2 py-2 bg-naranja text-xs text-white w-32">
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horasFiltradas.map(hora => (
            <tr key={hora}>
              <td className="border-b border-gray-200 text-center py-1 text-xs text-black bg-secundario w-16">
                {hora.slice(0, 5)}
              </td>
              {diasSemana.map(dia => {
                const clasesCelda = grilla?.[hora]?.[dia] || [];
                return (
                  <td key={dia + hora} className="border-b border-gray-200 px-1 py-1 h-8 align-top w-32">
                    {clasesCelda.length > 0 ? (
                      clasesCelda.map(clase => (
                        <div
                          key={clase.id}
                          className={`border ${colorClase("fija")} text-white rounded p-1 px-2 text-sm`}
                          title={`${clase.nombre} (${clase.hora_inicio} - ${clase.hora_fin})`}
                        >
                          <span className="font-semibold">{clase.nombre}</span>
                          <br />
                          <span className="text-xs">{clase.profesor?.nombre || ""}</span>
                          <br />
                          <span className="text-xs">{clase.cancha ? `Cancha ${clase.cancha}` : ""}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {clasesFijas.map((grupo, idx) => (
          <div
            key={idx}
            className="border rounded bg-blue-50 p-2 text-xs shadow-sm flex flex-col items-start"
          >
            <span className="font-bold">{grupo.nombre}</span>
            <span className="text-gray-600">{grupo.descripcion || ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarioClases;