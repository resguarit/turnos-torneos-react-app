import React, { useState } from 'react';
import VerTurnos from './VerTurnos';
import VerGrilla from './VerGrilla';

const PestanaTurnos = () => {
  const [activeView, setActiveView] = useState('turnos');

  return (
    <div className="w-full">
      <div className="flex justify-center mb-2 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveView('turnos')}
              className={`py-2 px-8 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeView === 'turnos'
                  ? 'border-naranja text-naranja'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Ver Turnos
            </button>
            <button
              onClick={() => setActiveView('grilla')}
              className={`py-2 px-8 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeView === 'grilla'
                  ? 'border-naranja text-naranja'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Ver Grilla
            </button>
          </nav>
        </div>
      </div>
      
      {activeView === 'turnos' ? <VerTurnos /> : <VerGrilla />}
    </div>
  );
};

export default PestanaTurnos;