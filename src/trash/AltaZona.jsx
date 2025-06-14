import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trash2, Shuffle } from 'lucide-react';
import { Liga } from '@/components/Liga'
import { Eliminacion } from '@/components/Eliminacion'
import { Grupos } from '../../components/Grupos';
import { generarTorneo } from '@/functions/sortearFechas'
import BackButton from '@/components/BackButton';


const teams = [
  { id: 1, name: 'KIRICOCHO', color: '#FF6347' },
  { id: 2, name: 'LA 95 FC', color: '#4682B4' },
  { id: 3, name: 'DEP. ALFILERES', color: '#32CD32' },
  { id: 4, name: 'EL PELIGRO', color: '#FFD700' },
  { id: 5, name: 'CHICAGO', color: '#8A2BE2' },
  { id: 6, name: 'CUCHARA FC', color: '#DC143C' },
  { id: 7, name: 'E.E.N', color: '#FF4500' },
  { id: 8, name: 'COCOS FC', color: '#6A5ACD' },
];

const zona = [
  { id: 1, name: 'DOMINGO', format: 'Liga', diaProximo: 'Domingo 21', horarioProximo: '21:00hs', count: 12 },
];

export default function AltaZona() {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [tournamentData, setTournamentData] = useState(null)
  const [zoneName, setZoneName] = useState('')


  const handleDelete = (teamId) => {
    console.log('Delete team:', teamId);
    // Implementar la funcionalidad para borrar un equipo
  };

  const handleSortearFechas = () => {
    if (selectedFormat) {
      const data = generarTorneo(teams, selectedFormat)
      setTournamentData(data)
    }
  }
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6  bg-gray-100">
        <BackButton />
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex flex-col justify-between items-start mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">{zona[0].name}</h1>
            <h2 className="text-xl lg:text-3xl font-bold mt-2">Crear Nueva Zona</h2>
            <p className="text-gray-500 text-xs lg:text-lg">Complete los datos para crear una nueva zona</p>
            <label className="font-bold mt-4 lg:text-xl">Nombre de la Zona:</label>
            <input 
            className="bg-white w-full lg:w-1/2 lg:h-8" style={{ borderRadius: '6px' }}
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            ></input>
            <label className="font-bold mt-4 lg:text-xl">Seleccionar Formato:</label>
            <select
              className="bg-white w-full lg:w-1/2 lg:h-8 h-6 text-sm lg:text-lg"
              value={selectedFormat}
              style={{ borderRadius: '6px' }}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="">Seleccione un formato</option>
              <option value="Liga">Liga</option>
              <option value="Eliminacion Directa">Eliminación Directa</option>
              <option value="Fase de Grupos">Fase de Grupos</option>
            </select>
            
            <button
              className="bg-black hover:bg-black/80 text-white p-3 mt-4 lg:text-[1.4rem] font-inter"
              style={{ borderRadius: '8px' }}
            >
              Cargar Equipo +
            </button>
            <div className='justify-start w-full'>
            <div className="mt-4 mx-0 w-full bg-white rounded-lg shadow " style={{ borderRadius: '8px' }}>
              <ul className="divide-y divide-gray-200">
                {teams.map((team, index) => (
                  <li
                    key={team.id}
                    className={`flex items-center justify-between p-4 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-6 h-6">
                        <div
                          className="absolute inset-0"
                          style={{
                            background: team.color,
                          }}
                        />
                      </div>
                      <span className="font-medium text-sm lg:text-lg">{team.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="text-naranja hover:text-gray-600 transition-colors "
                      aria-label={`Delete ${team.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            </div>
            <button
              className="mt-4 text-sm bg-naranja text-white p-2 flex items-center lg:text-lg "
              style={{ borderRadius: '8px' }}
              onClick={handleSortearFechas}
              disabled={!selectedFormat}
            >
              Sortear fechas <Shuffle className="h-4 lg:h-5" />
            </button>
            {tournamentData && (
              <div className="w-full mt-4">
                {selectedFormat === 'Liga' && (
                  <Liga
                    matches={tournamentData} 
                    date="18/12/2024" 
                  />
                )}
                {selectedFormat === 'Eliminacion Directa' && (
                  <Eliminacion teams={tournamentData} />
                )}
                {selectedFormat === 'Fase de Grupos' && (
                  <Grupos teams={tournamentData} />
                )}
              </div>
            )}
            <div className='w-full flex justify-end'>
            <Button
              variant="default"
              className="bg-black hover:bg-black/90 text-white py-0 h-8 mt-4 text-sm lg:text-xl lg:p-6"
              style={{ borderRadius: '8px' }}
            >
              Guardar
            </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
