import { useState } from 'react';

export default function SortearFechasModal({ onSave, onClose }) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await onSave(fechaInicio);
    } catch (error) {
      setError('Error al sortear fechas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Sortear Fechas</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-2">
          Seleccionar Primera Fecha de Inicio:
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
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
}