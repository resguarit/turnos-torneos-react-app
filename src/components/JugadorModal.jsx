import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, PenSquare } from "lucide-react";

export function JugadorModal({ team1, team2, onClose }) {
  const [selectedTeam, setSelectedTeam] = useState(team1);

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

  useEffect(() => {
    setSelectedTeam(team1); // Selecciona automáticamente el primer equipo al abrir
  }, [team1]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 max-w-4xl w-full mx-4" style={{ borderRadius: "8px" }}>
        <h2 className="text-xl font-bold mb-4">Jugadores</h2>

        <div className="flex gap-4 mb-4 font-semibold">
          <button
            onClick={() => setSelectedTeam(team1)}
            className={`p-2 border rounded-lg transition 
              ${selectedTeam === team1 ? "bg-black text-white" : "bg-white text-black border-black hover:bg-black hover:text-white"}`}
              style={{ borderRadius: "8px" }}
          >
            {team1}
          </button>
          <button
            onClick={() => setSelectedTeam(team2)}
            className={`p-2 border rounded-lg transition 
              ${selectedTeam === team2 ? "bg-black text-white" : "bg-white text-black border-black hover:bg-black hover:text-white"}`}
              style={{ borderRadius: "8px" }}
          >
            {team2}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">DNI</th>
                <th className="px-4 py-2 text-left">Nombre y Apellido</th>
                <th className="px-4 py-2 text-left">Fecha Nac.</th>
                <th className="px-4 py-2 text-center">Goles</th>
                <th className="px-4 py-2 text-center">Amonest.</th>
                <th className="px-4 py-2 text-center">Expulsión</th>
                <th className="px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{player.dni}</td>
                  <td className="px-4 py-2">{player.name}</td>
                  <td className="px-4 py-2">{player.birthDate}</td>
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
          <Button variant="default" className="bg-black text-white" style={{ borderRadius: "8px" }}>
            Agregar Jugador +
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose} style={{ borderRadius: "8px" }}>
              Cancelar
            </Button>
            <Button className="bg-black text-white" style={{ borderRadius: "8px" }}>
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
