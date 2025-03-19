/* import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';

export default function AsignarHoraYCanchaModal({ fechaId, fecha, onSave, onClose }) {
  const [partidosALaVez, setPartidosALaVez] = useState(1);
  const [horarios, setHorarios] = useState([]);
  const [selectedHorarioId, setSelectedHorarioId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const response = await api.get('/disponibilidad/fecha', {
          params: { fecha }
        });
        if (Array.isArray(response.data.horarios)) {
          setHorarios(response.data.horarios.filter(horario => horario.disponible));
        } else {
          setHorarios([]);
        }
        console.log(response.data.horarios); // Verificar la respuesta de la API
      } catch (error) {
        setError('Error al cargar los horarios');
      }
    };

    fetchHorarios();
  }, [fecha]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/partidos/asignar-hora-cancha', {
        partidos_a_la_vez: partidosALaVez,
        horario_id: selectedHorarioId,
        fecha_id: fechaId,
      });
      if (response.status === 200) {
        onSave();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Error al asignar hora y cancha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Asignar Hora y Cancha</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-2">
          Partidos a la vez:
          <input
            type="number"
            value={partidosALaVez}
            onChange={(e) => setPartidosALaVez(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
            min="1"
          />
        </label>
        <label className="block mb-2">
          Seleccionar Horario:
          <select
            value={selectedHorarioId}
            onChange={(e) => setSelectedHorarioId(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            <option value="" disabled>
              Seleccionar Horario
            </option>
            {horarios.map((horario) => (
              <option key={horario.id} value={horario.id}>
                {horario.hora_inicio} - {horario.hora_fin}
              </option>
            ))}
          </select>
        </label>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            disabled={loading}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
} */