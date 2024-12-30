'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/Footer';
import { Liga } from '@/components/Liga';
import { X } from 'lucide-react';

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
  const [showPlayerModal, setShowPlayerModal] = useState(false)
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
    <div className="min-h-screen flex flex-col justify-start bg-gray-100">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <h1 className="text-2xl font-bold mb-6 lg:text-4xl">Partidos</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-medium mb-1 lg:text-xl">
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
            <label className="block font-medium mb-1 lg:text-xl">
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

        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold  lg:text-3xl">Jugadores</h2>
            <button onClick={handleCloseModal} style={{ borderRadius: "8px" }}>
              <X className="h-6 w-6" />
            </button>

          </div>
        <div className="flex gap-4 mb-4 font-semibold">
          <button
            onClick={() => setSelectedTeam(team1)}
            className={`p-2 border rounded-lg transition lg:text-lg 
              ${selectedTeam === team1 ? "bg-black text-white" : "bg-white text-black border-black hover:bg-black hover:text-white"}`}
              style={{ borderRadius: "8px" }}
          >
            {team1}
          </button>
          <button
            onClick={() => setSelectedTeam(team2)}
            className={`p-2 border rounded-lg transition lg:text-lg
              ${selectedTeam === team2 ? "bg-black text-white" : "bg-white text-black border-black hover:bg-black hover:text-white"}`}
              style={{ borderRadius: "8px" }}
          >
            {team2}
          </button>
        </div>
        
        <div className="overflow-x-auto ">
          <table className="w-full ">
            <thead>
              <tr className="border-b lg:text-xl">
                <th className="px-4 py-2 text-center">DNI</th>
                <th className="px-4 py-2 text-center">Nombre y Apellido</th>
                <th className="px-4 py-2 text-center">Fecha Nac.</th>
                <th className="px-4 py-2 text-center">Goles</th>
                <th className="px-4 py-2 text-center">Amonest.</th>
                <th className="px-4 py-2 text-center">Expulsión</th>
                <th className="px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index} className="border-b lg:text-xl">
                  <td className="px-4 py-2 text-center">{player.dni}</td>
                  <td className="px-4 py-2 text-center">{player.name}</td>
                  <td className="px-4 py-2 text-center">{player.birthDate}</td>
                  <td className="px-4 py-2 text-center">{player.goals}</td>
                  <td className="px-4 py-2 text-center">{player.warnings}</td>
                  <td className="px-4 py-2 text-center">{player.expulsions}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" className="bg-naranja hover:bg-naranja/90 text-white" style={{ borderRadius: "8px" }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="bg-naranja hover:bg-naranja/90 text-white" style={{ borderRadius: "8px" }}>
                        <PenSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-4">
          <button variant="default" className="bg-black text-white lg:text-lg items-center border border-black p-2 hover:bg-white  hover:text-black" style={{ borderRadius: "8px" }}>
            Agregar Jugador +
          </button>
          <div className="space-x-2">
            <button className="bg-black text-white lg:text-lg items-center border border-black p-2 hover:bg-white  hover:text-black" style={{ borderRadius: "8px" }}>
              Guardar
            </button>
          </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
