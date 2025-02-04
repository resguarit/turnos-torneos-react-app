import React from 'react';
import { ArrowDown, ArrowUp, Minus, Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

export const TarjetaMetrica = ({ metrica }) => {
  const obtenerIconoTendencia = () => {
    if (!metrica.tendencia) return null;
    
    const clasesComunes = "w-4 h-4";
    
    switch (metrica.tendencia) {
      case 'subida':
        return <ArrowUp className={`${clasesComunes} text-green-500`} />;
      case 'bajada':
        return <ArrowDown className={`${clasesComunes} text-red-500`} />;
      case 'neutral':
        return <Minus className={`${clasesComunes} text-gray-500`} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{metrica.etiqueta}</h3>
        <div className="absolute top-2 right-2">
        <Info 
            className="w-4 h-4 text-gray-400" 
            data-tooltip-id="info-tooltip" 
            data-tooltip-content={metrica.descripcion} 
          />
          <Tooltip id="info-tooltip" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-gray-900">{metrica.valor}</p>
        {metrica.cambio && (
          <div className="flex flex-row items-center gap-2">
            <span className={`text-sm ${
              metrica.tendencia === 'subida' ? 'text-green-500' : 
              metrica.tendencia === 'bajada' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {metrica.cambio > 0 ? '+' : ''}{metrica.cambio}%
            </span>
            {obtenerIconoTendencia()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaMetrica;