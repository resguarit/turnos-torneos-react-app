import React from 'react';
import { TurnoEstado } from '@/constants/estadoTurno';

const FilterControls = ({ selectedCourt, setSelectedCourt, selectedStatus, setSelectedStatus, courts, handleStatusChange }) => {
  const estados = Object.values(TurnoEstado);

  return (
    <div className="fixed sm:absolute sm:top-60 sm:right-20 md:right-4 sm:mt-12 md:mt-4 p-4 px-10 bg-white rounded-[6px] shadow-lg">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold pb-4 text-gray-700">Seleccionar Cancha</label>
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="w-full  text-sm p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las canchas</option>
            {courts.map(court => (
              <option key={court.id} value={court.nro}>Cancha {court.nro} - {court.tipo_cancha}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold pb-4 text-gray-700">Seleccionar Estado</label>
          <div className="grid grid-cols-2 gap-2">
            {estados.map(estado => (
              <div key={estado} className="flex items-center">
                <input
                  type="checkbox"
                  id={estado}
                  checked={selectedStatus.includes(estado)}
                  onChange={() => handleStatusChange(estado)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor={estado} className="ml-2 text-sm font-medium text-gray-700">
                  {estado}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;