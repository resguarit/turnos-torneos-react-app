import React, { useEffect, useState } from "react";
import api from "@/lib/axiosConfig";
import TarjetaGrupoClasesFijas from "./TarjetaGrupoClasesFijas";
import BtnLoading from "@/components/BtnLoading";

// Utilidades para obtener días y horas
const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const horas = Array.from({ length: 17 }, (_, i) => {
  const hour = (8 + i) % 24;
  return `${hour.toString().padStart(2, "0")}:00:00`;
}); // 08:00:00 a 00:00:00

const colorClase = (tipo) => tipo === "fija" ? "bg-naranja" : "bg-green-100 border-green-400";

// Ahora 'grilla' es el objeto recibido del backend
const CalendarioClases = () => {
  const [grilla, setGrilla] = useState({});
  const [clasesFijas, setClasesFijas] = useState([]);
  const [loading, setLoading] = useState(true);

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
          {horas.map(hora => (
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
                        >{console.log('clase:', clase)}
                          <span className="font-semibold">{clase.nombre}</span>
                          <br />
                          <span className="text-xs">{clase.profesor.nombre || ""} {clase.profesor.apellido || ""}</span>
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