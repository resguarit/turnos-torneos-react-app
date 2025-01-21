import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export const TarjetaMetrica = ({ metrica }) => {
  const obtenerIconoTendencia = () => {
    if (!metrica.tendencia) return null;
    
    const clasesComunes = "w-4 h-4 ml-2";
    
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{metrica.etiqueta}</h3>
        {obtenerIconoTendencia()}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{metrica.valor}</p>
        {metrica.cambio && (
          <span className={`ml-2 text-sm ${
            metrica.tendencia === 'subida' ? 'text-green-500' : 
            metrica.tendencia === 'bajada' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {metrica.cambio > 0 ? '+' : ''}{metrica.cambio}%
          </span>
        )}
      </div>
    </div>
  );
};