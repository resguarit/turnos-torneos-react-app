import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/Footer';
import { Liga } from '@/components/Liga';
import { X, Trash2, PenSquare } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button'; // Asegúrate de importar el componente Button

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

export default function CargaPartido() {
  const players = [
    {
      dni: "45678978",
      name: "Juan Perez",
      birthDate: "12/04/2002",
      goals: 1,
      warnings: 1,
      expulsions: 0,
    },
    {
      dni: "45678978",
      name: "Javier Si",
      birthDate: "12/04/2002",
      goals: 0,
      warnings: 0,
      expulsions: 0,
    },
    {
      dni: "45678978",
      name: "Franco As",
      birthDate: "12/04/2002",
      goals: 2,
      warnings: 0,
      expulsions: 0,
    },
    {
      dni: "45678978",
      name: "Agustin Perez",
      birthDate: "12/04/2002",
      goals: 0,
      warnings: 0,
      expulsions: 0,
    },
  ];

  const handleCloseModal = () => {
    setSelectedMatch(null);
  };

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([
    { id: 1, team1: { name: "DEP. ALFILERES", color: "#32CD32" }, team2: { name: "EL PELIGRO", color: "#FFD700" }, time: "18:00" },
    { id: 2, team1: { name: "CHICAGO", color: "#8A2BE2" }, team2: { name: "CUCHARA FC", color: "#DC143C" }, time: "19:00" },
    { id: 3, team1: { name: "E.E.N", color: "#FF4500" }, team2: { name: "COCOS FC", color: "#6A5ACD" }, time: "20:00" },
  ]);

  const handleEditMatch = (match) => {
    setSelectedMatch(match);
  };

  const handleSaveMatch = (updatedMatch) => {
    setMatches((prevMatches) =>
      prevMatches.map((match) =>
        match.id === updatedMatch.id ? updatedMatch : match
      )
    );
    setSelectedMatch(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-gray-100 font-inter">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <BackButton />
        <h1 className="text-2xl font-bold mb-6 lg:text-4xl">Partidos</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-semibold mb-1 lg:text-xl">
              Selecciona el Torneo:
            </label>
            <select
              className="w-full border border-gray-300 p-1 lg:text-xl"
              style={{ borderRadius: '6px' }}
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
            >
              <option value="" disabled>
                Seleccionar torneo...
              </option>
              <option value="domingo">Domingo</option>
              <option value="sabado">Sábado</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 lg:text-xl">
              Selecciona la Zona:
            </label>
            <select
              className="w-full border border-gray-300 p-1 lg:text-xl"
              style={{ borderRadius: '6px' }}
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="" disabled>
                Seleccionar zona...
              </option>
              <option value="a">Zona A</option>
              <option value="b">Zona B</option>
              <option value="c">Zona C</option>
            </select>
          </div>
        </div>

        <Liga matches={matches} date={'30/12/2024'} onEditMatch={(match) => setSelectedMatch(match)} />
      </main>
      <Footer />
    </div>
  );
}
