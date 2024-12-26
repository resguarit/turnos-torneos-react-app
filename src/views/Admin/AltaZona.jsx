import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Trash2, Shuffle } from 'lucide-react';
import { Liga } from '@/components/Liga'
import { Eliminacion } from '@/components/Eliminacion'
import { Grupos } from '../../components/Grupos';
import { generarTorneo } from '@/functions/sortearFechas'


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
      <main className="flex-1 p-6 bg-[#dddcdc]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">{zona[0].name}</h1>
            <h2 className="text-xl font-bold mt-2">Crear Nueva Zona</h2>
            <p className="text-gray-500 text-xs">Complete los datos para crear una nueva zona</p>
            <label className="font-bold mt-4">Nombre de la Zona:</label>
            <input 
            className="bg-white w-full" style={{ borderRadius: '6px' }}
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            ></input>
            <label className="font-bold mt-4">Seleccionar Formato:</label>
            <select
              className="bg-white w-full h-6 text-sm"
              value={selectedFormat}
              style={{ borderRadius: '6px' }}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="">Seleccione un formato</option>
              <option value="Liga">Liga</option>
              <option value="Eliminacion Directa">Eliminación Directa</option>
              <option value="Fase de Grupos">Fase de Grupos</option>
            </select>
            
            <Button
              variant="default"
              className="bg-black hover:bg-black/90 text-white py-0 h-8 mt-4 text-sm"
              style={{ borderRadius: '8px' }}
            >
              Cargar Equipo +
            </Button>

            <div className="mt-4 w-full mx-auto bg-white rounded-lg shadow" style={{ borderRadius: '8px' }}>
              <ul className="divide-y divide-gray-200">
                {teams.map((team, index) => (
                  <li
                    style={{ borderRadius: '8px' }}
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
                      <span className="font-medium text-sm">{team.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`Delete ${team.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="mt-4 text-sm bg-naranja text-white p-2 flex items-center"
              style={{ borderRadius: '8px' }}
              onClick={handleSortearFechas}
              disabled={!selectedFormat}
            >
              Sortear fechas <Shuffle className="h-4" />
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
              className="bg-black hover:bg-black/90 text-white py-0 h-8 mt-4 text-sm"
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
