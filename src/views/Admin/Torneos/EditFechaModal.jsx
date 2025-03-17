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

  const estados = ['Pendiente', 'En curso', 'Finalizada', 'Suspendida', 'Cancelada'];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Editar Fecha</h2>
        <label className="block mb-2">
          Nombre:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </label>
        <label className="block mb-2">
          Fecha Inicio:
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </label>
        <label className="block mb-2">
          Fecha Fin:
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </label>
        <label className="block mb-2">
          Estado:
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
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
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}