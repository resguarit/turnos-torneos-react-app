import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const PestanaHorario = () => {
  const [schedules, setSchedules] = useState([
    { id: 1, day: "Lunes", start: "09:00", end: "21:00" },
    { id: 2, day: "Martes", start: "09:00", end: "21:00" },
    { id: 3, day: "Miércoles", start: "09:00", end: "21:00" },
    { id: 4, day: "Jueves", start: "09:00", end: "21:00" },
    { id: 5, day: "Viernes", start: "09:00", end: "21:00" },
    { id: 6, day: "Sábado", start: "09:00", end: "23:00" },
    { id: 7, day: "Domingo", start: "09:00", end: "21:00" },
  ]);

  const timeOptions = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  return (
    <div>
      <div className="flex justify-end mb-4 mt-2">
        <button className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-600 transition-colors">
          Configurar Horarios
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Día
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="px-6 py-4 whitespace-nowrap">{schedule.day}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={schedule.start}
                    onChange={(e) => {
                      const updatedSchedules = schedules.map((s) =>
                        s.id === schedule.id ? { ...s, start: e.target.value } : s,
                      )
                      setSchedules(updatedSchedules)
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={schedule.end}
                    onChange={(e) => {
                      const updatedSchedules = schedules.map((s) =>
                        s.id === schedule.id ? { ...s, end: e.target.value } : s,
                      )
                      setSchedules(updatedSchedules)
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-gray-400 hover:text-gray-500">
                    <Edit2 size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-500">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PestanaHorario;