import React, { useEffect, useState } from 'react';
import api from '@/lib/axiosConfig';
import { ChevronRight, Plus } from 'lucide-react';

export default function ArañaEliminacion({ fechaId }) {
  const [partidos, setPartidos] = useState([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const response = await api.get(`/fechas/${fechaId}/partidos`);
        setPartidos(response.data);
      } catch (error) {
        console.error('Error fetching partidos:', error);
      }
    };

    fetchPartidos();
  }, [fechaId]);

  const handleMatchSelect = (index) => {
    setSelectedMatchIndex(index === selectedMatchIndex ? null : index);
  };

  const renderMatchSlot = (partido, index) => {
    const isSelected = selectedMatchIndex === index;
    const isHovered = hoveredIndex === index;

    return (
      <div 
        className={`
          relative flex items-center justify-between border-2 
          ${partido ? 'bg-white border-blue-500' : 'bg-gray-100 border-dashed border-gray-300'}
          rounded-lg p-2 cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-blue-300' : ''}
          ${isHovered ? 'scale-105' : ''}
        `}
        onClick={() => index !== undefined && handleMatchSelect(index)}
        onMouseEnter={() => index !== undefined && setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {partido ? (
          <div className="flex-grow">
            <p className="font-semibold text-sm">
              {partido.equipo_local?.nombre || 'TBD'} 
              <span className="mx-2 text-gray-400">vs</span> 
              {partido.equipo_visitante?.nombre || 'TBD'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(partido.fecha).toLocaleDateString()} - {partido.hora}
            </p>
          </div>
        ) : (
          <div className="flex items-center text-gray-400">
            <Plus className="mr-2" size={16} />
            Añadir partido
          </div>
        )}
        {partido && <ChevronRight className="text-gray-400" size={20} />}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[12px] p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Araña de Eliminación</h2>
      {partidos.length === 0 ? (
        <p className="text-center text-gray-500">No hay partidos programados.</p>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {/* First Round */}
          <div className="col-span-1 space-y-4">
            {renderMatchSlot(partidos[0], 0)}
            {renderMatchSlot(partidos[1], 1)}
            {renderMatchSlot(partidos[2], 2)}
            {renderMatchSlot(partidos[3], 3)}
          </div>

          {/* Quarter Finals Space */}
          <div className="col-span-1 flex flex-col justify-around space-y-4">
            {renderMatchSlot()}
            {renderMatchSlot()}
          </div>

          {/* Semi-Finals Space */}
          <div className="col-span-1 flex flex-col justify-center space-y-4">
            {renderMatchSlot()}
            {renderMatchSlot()}
          </div>

          {/* Final Space */}
          <div className="col-span-1 flex flex-col justify-center">
            {renderMatchSlot()}
          </div>

          {/* Champion Space */}
          <div className="col-span-1 flex flex-col justify-center">
            <div className="bg-yellow-500 text-white rounded-full p-4 text-center font-bold">
              Campeón
            </div>
          </div>
        </div>
      )}
    </div>
  );
}