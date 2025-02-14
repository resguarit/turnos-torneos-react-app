import React, { useState } from 'react';
import VerTurnos from './VerTurnos';
import VerGrilla from './VerGrilla';
import { Button } from '@/components/ui/button';

const PestanaTurnos = () => {
  const [activeView, setActiveView] = useState('turnos'); // 'turnos' or 'grilla'

  return (
    <div className="">
      <div className="flex gap-4 justify-end mt-6">
        <Button
          onClick={() => setActiveView('turnos')}
          variant={activeView === 'turnos' ? 'default' : 'outline'}
          className={`px-4 py-2 rounded-[8px] ${activeView === 'turnos' ? 'bg-orange-500 hover:bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Ver Turnos
        </Button>
        <Button
          onClick={() => setActiveView('grilla')}
          variant={activeView === 'grilla' ? 'default' : 'outline'}
          className={`px-4 py-2 rounded-[8px] ${activeView === 'grilla' ? 'bg-orange-500 hover:bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Ver Grilla
        </Button>
      </div>
      {activeView === 'turnos' ? <VerTurnos /> : <VerGrilla />}
    </div>
  );
};

export default PestanaTurnos;