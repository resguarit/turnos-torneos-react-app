import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '@/lib/axiosConfig';

export default function AsignarHoraYCanchaModal({ zonaId, horarios, onClose }) {
  const [partidosALaVez, setPartidosALaVez] = useState(1);
  const [horarioInicio, setHorarioInicio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsignarHoraYCancha = async () => {
    try {
      setLoading(true);

      // Asegúrate de que el horario_inicio esté en el formato correcto
      const formattedHorarioInicio = horarioInicio.trim(); // Elimina espacios en blanco

      // Transforma el formato si es necesario (por ejemplo, si el backend requiere hh:mm)
      const [hours, minutes] = formattedHorarioInicio.split(':');
      const transformedHorarioInicio = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

      const response = await api.post(`/zonas/${zonaId}/asignar-hora-cancha`, {
        partidos_a_la_vez: partidosALaVez,
        horario_inicio: transformedHorarioInicio, // Asegúrate de que esté en formato hh:mm
      });

      if (response.status === 200) {
        toast.success('Horarios y canchas asignados correctamente');
        onClose();
      }
    } catch (error) {
      console.error('Error assigning hora y cancha:', error);
      if (error.response?.data?.errors?.horario_inicio) {
        toast.error('El horario de inicio debe estar en el formato HH:mm');
      } else {
        toast.error('Error al asignar horarios y canchas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-[8px] shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Asignar Cancha y Hora</h2>
        <div className='w-full bg-blue-200 border-l-blue-500 border-l-2 p-2 rounded-md mb-4 flex items-center'>
          <p className="text-sm text-blue-700 ">Esta función permite asignar automáticamente horarios y canchas para todos los partidos de una zona, definiendo cuántos partidos se jugarán simultáneamente y el horario de inicio</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Partidos a la vez</label>
          <input
            type="number"
            min="1"
            value={partidosALaVez}
            onChange={(e) => setPartidosALaVez(e.target.value)}
            className="mt-1 block w-full border py-1 px-2 border-gray-300 rounded-[6px] shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Horario de Inicio</label>
          <select
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className="mt-1 block w-full border py-1 px-2 border-gray-300 rounded-[6px] shadow-sm"
          >
            <option value="">Seleccionar horario</option>
            {horarios.length > 0 ? (
              horarios.map((horario) => (
                <option key={horario.id} value={horario.hora_inicio}>
                  {horario.hora_inicio}
                </option>
              ))
            ) : (
              <option value="" disabled>No hay horarios disponibles</option>
            )}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleAsignarHoraYCancha}
            className={`py-2 px-4 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
            disabled={loading}
          >
            {loading ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
}