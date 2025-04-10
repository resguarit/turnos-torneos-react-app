import { useState, useEffect } from 'react';

export default function PostergarFechasModal({ fechas, onSave, onClose }) {
  const [selectedFechaId, setSelectedFechaId] = useState('');

  useEffect(() => {
    if (fechas && fechas.length > 0) {
      setSelectedFechaId(fechas[0].id);
    }
  }, [fechas]);

  const handleSave = () => {
    onSave(selectedFechaId);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-[8px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Postergar Fechas</h2>
        <label className="block mb-2">
          Seleccionar Fecha:
          <select
            value={selectedFechaId}
            onChange={(e) => setSelectedFechaId(e.target.value)}
            className="border border-gray-300 rounded-[6px] p-2 w-full"
          >
            {fechas && fechas.length > 0 ? (
              fechas.map((fecha) => (
                <option key={fecha.id} value={fecha.id}>
                  {fecha.nombre} - {fecha.fecha_inicio}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No hay fechas disponibles
              </option>
            )}
          </select>
        </label>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-[6px]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-[6px]"
            disabled={!selectedFechaId}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}