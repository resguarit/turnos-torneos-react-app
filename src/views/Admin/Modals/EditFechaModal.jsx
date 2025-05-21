import { useState, useEffect } from 'react';

export default function EditFechaModal({ fecha, equipos, onSave, onClose }) {
  const [nombre, setNombre] = useState(fecha.nombre);
  const [fechaInicio, setFechaInicio] = useState(fecha.fecha_inicio);
  const [fechaFin, setFechaFin] = useState(fecha.fecha_fin);
  const [estado, setEstado] = useState(fecha.estado);
  const [partidos, setPartidos] = useState(fecha.partidos);

  const handleSave = () => {
    onSave({
      ...fecha,
      nombre,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado,
      partidos,
    });
  };

  const estados = ['Pendiente', 'En Curso', 'Finalizada', 'Suspendida', 'Cancelada'];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 w-1/3 rounded-[8px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Editar Fecha</h2>
        <label className="block text-sm text-gray-500">
          Nombre:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border mb-2 border-gray-300 rounded-[6px] p-1 w-full"
          />
        
        <label className="block text-sm text-gray-500">
          Fecha Inicio:        </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border mb-2 border-gray-300 rounded-[6px] p-1 w-full"
          />

        <label className="block text-sm text-gray-500">
          Fecha Fin:        </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border mb-2 border-gray-300 rounded-[6px] p-1 w-full"
          />

        <label className="block text-sm text-gray-500">
          Estado:         </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="border mb-2 border-gray-300 rounded-[6px] p-1 w-full"
          >
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

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
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}