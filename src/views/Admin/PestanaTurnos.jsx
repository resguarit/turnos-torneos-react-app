import React, { useState } from 'react';
import VerTurnos from './VerTurnos';
import VerGrilla from './VerGrilla';
import { Button } from '@/components/ui/button';

const PestanaTurnos = () => {
  const [activeView, setActiveView] = useState('turnos'); // 'turnos' or 'grilla'

  return (
    <div className="">
      <div className="flex gap-4 justify-end mt-4">
        <Button
          onClick={() => setActiveView('turnos')}
          variant={activeView === 'turnos' ? 'default' : 'outline'}
          className={`px-4 py-2 rounded-[8px] ${activeView === 'turnos' ? 'bg-naranja hover:bg-naranja/90 text-white' : 'bg-white text-gray-700 border-gay-300'}`}
        >
          Ver Turnos
        </Button>
        <Button
          onClick={() => setActiveView('grilla')}
          variant={activeView === 'grilla' ? 'default' : 'outline'}
          className={`px-4 py-2 rounded-[8px] ${activeView === 'grilla' ? 'bg-naranja hover:bg-naranja/90 text-white' : 'bg-white text-gray-700 border-gray-300'}`}
        >
          Ver Grilla
        </Button>
      </div>
      {activeView === 'turnos' ? <VerTurnos /> : <VerGrilla />}
    </div>
  );
};

export default PestanaTurnos;