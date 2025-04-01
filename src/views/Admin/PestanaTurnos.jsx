import React, { useState } from 'react';
import VerTurnos from './VerTurnos';
import VerGrilla from './VerGrilla';
import { CalendarDays, Grid } from 'lucide-react';

const PestanaTurnos = () => {
  const [activeView, setActiveView] = useState('turnos');

  return (
    <div className="w-full py-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeView === 'turnos'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveView('turnos')}
        >
          <span className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Ver Turnos
          </span>
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeView === 'grilla'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveView('grilla')}
        >
          <span className="flex items-center">
            <Grid className="mr-2 h-4 w-4" />
            Ver Grilla
          </span>
        </button>
      </div>
      
      {activeView === 'turnos' ? <VerTurnos /> : <VerGrilla />}
    </div>
  );
};

export default PestanaTurnos;