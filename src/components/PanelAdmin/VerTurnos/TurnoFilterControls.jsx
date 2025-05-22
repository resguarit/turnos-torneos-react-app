import React, { useEffect, useRef } from 'react';
import { TurnoEstado } from '@/constants/estadoTurno';

const tiposTurno = [
  { value: 'torneo', label: 'Torneo' },
  { value: 'evento', label: 'Evento' },
  { value: 'unico', label: 'Único' },
  { value: 'fijo', label: 'Fijo' },
];

const FilterControls = ({ selectedCourt, setSelectedCourt, selectedStatus, setSelectedStatus, courts, handleStatusChange, onClose, selectedTipos, setSelectedTipos }) => {
  const estados = Object.values(TurnoEstado);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const formatDeporteName = (deporte) => {
    if (!deporte) return '';
    if (deporte.nombre.toLowerCase().includes("futbol") || deporte.nombre.toLowerCase().includes("fútbol")) {
      return `${deporte.nombre} ${deporte.jugadores_por_equipo}`;
    }
    return deporte.nombre;
  };

  const handleTipoChange = (tipo) => {
    if (selectedTipos.includes(tipo)) {
      setSelectedTipos(selectedTipos.filter(t => t !== tipo));
    } else {
      setSelectedTipos([...selectedTipos, tipo]);
    }
  };

  return (
    <div 
      ref={filterRef} 
      className="p-4 px-10 bg-white rounded-[6px] shadow-lg border border-gray-200"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold pb-4 text-gray-700">Seleccionar Cancha</label>
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="w-full text-sm p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las canchas</option>
            {courts.map(court => (
              <option key={court.id} value={court.nro}>Cancha {court.nro} - {formatDeporteName(court.deporte)}</option>
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
        {/* Filtro por tipo de turno con checkboxes */}
        <div className="flex-1">
          <label className="block text-sm font-bold pb-4 text-gray-700">Tipo de Turno</label>
          <div className="grid grid-cols-2 gap-2">
            {tiposTurno.map(tipo => (
              <div key={tipo.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`tipo-${tipo.value}`}
                  checked={selectedTipos.includes(tipo.value)}
                  onChange={() => handleTipoChange(tipo.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor={`tipo-${tipo.value}`} className="ml-2 text-sm font-medium text-gray-700">
                  {tipo.label}
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