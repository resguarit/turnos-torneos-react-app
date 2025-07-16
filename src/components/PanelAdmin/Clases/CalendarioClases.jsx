import React from "react";

// Utilidades para obtener días y horas
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const horas = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`); // 08:00 a 21:00

// Helper para saber si una clase está en ese día y hora
function clasesEnCelda(clases, dia, hora) {
  return clases.filter(clase => {
    // clase.fecha_inicio es tipo "YYYY-MM-DD"
    // clase.hora_inicio es tipo "HH:mm"
    // clase.dia es tipo "lunes", "martes", etc.
    const diaClase = clase.dia?.toLowerCase();
    const diaGrid = dia.toLowerCase();
    // Rango horario
    const horaInicio = clase.hora_inicio?.slice(0, 5);
    const horaFin = clase.hora_fin?.slice(0, 5);
    // La celda representa el rango [hora, hora+1)
    const horaInt = parseInt(hora.slice(0, 2), 10);
    return (
      diaClase === diaGrid &&
      horaInicio &&
      horaFin &&
      horaInt >= parseInt(horaInicio.slice(0, 2), 10) &&
      horaInt < parseInt(horaFin.slice(0, 2), 10)
    );
  });
}

const colorClase = (tipo) => tipo === "fija" ? "bg-blue-100 border-blue-400" : "bg-green-100 border-green-400";

const CalendarioClases = ({ clases }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border  rounded-lg bg-white">
        <thead className="bg-naranja">
          <tr>
            <th className="border-b border-gray-300 px-2 py-2 text-xs text-white w-16">Hora</th>
            {diasSemana.map(dia => (
              <th key={dia} className="border-b border-gray-300 px-2 py-2 bg-naranja text-xs text-white">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map(hora => (
            <tr key={hora}>
              <td className="border-b border-gray-200 text-center py-1 text-xs text-black bg-secundario">{hora}</td>
              {diasSemana.map(dia => {
                const clasesCelda = clasesEnCelda(clases, dia, hora);
                return (
                  <td key={dia + hora} className="border-b border-gray-200 px-1 py-1 h-12 align-top">
                    {clasesCelda.length > 0 ? (
                      clasesCelda.map(clase => (
                        <div
                          key={clase.id}
                          className={`border ${colorClase(clase.tipo)} rounded p-1 mb-1 text-xs`}
                          title={`${clase.nombre} (${clase.hora_inicio} - ${clase.hora_fin})`}
                        >
                          <span className="font-semibold">{clase.nombre}</span>
                          <br />
                          <span>{clase.profesor?.nombre || ""} {clase.profesor?.apellido || ""}</span>
                          <br />
                          <span>{clase.cancha?.nro ? `Cancha ${clase.cancha.nro}` : clase.cancha?.nombre || ""}</span>
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
    </div>
  );
};

export default CalendarioClases;