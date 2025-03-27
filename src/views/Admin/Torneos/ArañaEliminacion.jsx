import { useState } from "react";

const initialTeams = [
  "Equipo 1", "Equipo 2", "Equipo 3", "Equipo 4",
  "Equipo 5", "Equipo 6", "Equipo 7", "Equipo 8"
];

export default function ArañaEliminacion() {
  const [round1, setRound1] = useState(Array(4).fill(""));
  const [round2, setRound2] = useState(Array(2).fill(""));
  const [final, setFinal] = useState("");

  return (
    <div className="flex space-x-6 p-4">
      {/* Primera Ronda */}
      <div className="flex flex-col space-y-4">
        {initialTeams.map((team, index) => (
          <div key={index} className="bg-gray-200 p-2 rounded-md w-40 text-center">
            {team}
          </div>
        ))}
      </div>

      {/* Segunda Ronda */}
      <div className="flex flex-col space-y-4">
        {[0, 2, 4, 6].map((index) => (
          <div key={index} className="flex flex-col space-y-4 border border-gray-400 p-2 rounded-md">
            <select
              className="bg-gray-200 p-2 rounded-md w-40"
              value={round1[index / 2]}
              onChange={(e) => {
                const newRound1 = [...round1];
                newRound1[index / 2] = e.target.value;
                setRound1(newRound1);
              }}
            >
              <option value="">Seleccionar</option>
              <option value={initialTeams[index]}>{initialTeams[index]}</option>
              <option value={initialTeams[index + 1]}>{initialTeams[index + 1]}</option>
            </select>
          </div>
        ))}
      </div>

      {/* Semifinal */}
      <div className="flex flex-col space-y-8">
        {[0, 2].map((index) => (
          <div key={index} className="flex flex-col space-y-4 border border-gray-400 p-2 rounded-md">
            <select
              className="bg-gray-200 p-2 rounded-md w-40"
              value={round2[index / 2]}
              onChange={(e) => {
                const newRound2 = [...round2];
                newRound2[index / 2] = e.target.value;
                setRound2(newRound2);
              }}
            >
              <option value="">Seleccionar</option>
              <option value={round1[index]}>{round1[index]}</option>
              <option value={round1[index + 1]}>{round1[index + 1]}</option>
            </select>
          </div>
        ))}
      </div>

      {/* Final */}
      <div className="flex flex-col space-y-16 border border-gray-400 p-2 rounded-md">
        <select
          className="bg-gray-200 p-2 rounded-md w-40"
          value={final}
          onChange={(e) => setFinal(e.target.value)}
        >
          <option value="">Seleccionar</option>
          <option value={round2[0]}>{round2[0]}</option>
          <option value={round2[1]}>{round2[1]}</option>
        </select>
      </div>
    </div>
  );
}
