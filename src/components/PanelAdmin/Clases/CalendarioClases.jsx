import React, { useEffect, useState } from "react";
import api from "@/lib/axiosConfig";
import TarjetaGrupoClasesFijas from "./TarjetaGrupoClasesFijas";

// Utilidades para obtener días y horas
const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const horas = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00:00`); // 08:00:00 a 21:00:00

const colorClase = (tipo) => tipo === "fija" ? "bg-blue-100 border-blue-400" : "bg-green-100 border-green-400";

// Ahora 'grilla' es el objeto recibido del backend
const CalendarioClases = () => {
  const [grilla, setGrilla] = useState({});
  const [clasesFijas, setClasesFijas] = useState([]);

  useEffect(() => {
    const fetchGrilla = async () => {
      const response = await api.get("/clases/fijas/grilla");
      console.log('response:', response.data);
      setGrilla(response.data);
      setClasesFijas(response.data.clases_fijas || []);
    };
    fetchGrilla();
  }, []);

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border rounded-lg bg-white mb-8">
        <thead className="bg-naranja">
          <tr>
            <th className="border-b border-gray-300 px-2 py-2 text-xs text-white w-16">Hora</th>
            {diasSemana.map(dia => (
              <th key={dia} className="border-b border-gray-300 px-2 py-2 bg-naranja text-xs text-white">
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map(hora => (
            <tr key={hora}>
              <td className="border-b border-gray-200 text-center py-1 text-xs text-black bg-secundario">
                {hora.slice(0, 5)}
              </td>
              {diasSemana.map(dia => {
                const clasesCelda = grilla?.[hora]?.[dia] || [];
                return (
                  <td key={dia + hora} className="border-b border-gray-200 px-1 py-1 h-12 align-top">
                    {clasesCelda.length > 0 ? (
                      clasesCelda.map(clase => (
                        <div
                          key={clase.id}
                          className={`border ${colorClase("fija")} rounded p-1 mb-1 text-xs`}
                          title={`${clase.nombre} (${clase.hora_inicio} - ${clase.hora_fin})`}
                        >
                          <span className="font-semibold">{clase.nombre}</span>
                          <br />
                          <span>{clase.profesor || ""}</span>
                          <br />
                          <span>{clase.cancha ? `Cancha ${clase.cancha}` : ""}</span>
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