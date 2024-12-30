import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, PenSquare, X } from "lucide-react";

export function CargaJugador({ team1, team2, onClose, onSave }) {
const [selectedTeam, setSelectedTeam] = useState(team1);
const [players, setPlayers] = useState([]);

useEffect(() => {
    // Inicializa los jugadores por equipo (simulado)
    const initialPlayers = [
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
    ];
    setPlayers(initialPlayers);
    setSelectedTeam(team1);
}, [team1]);

const handleInputChange = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index][field] = value;
    setPlayers(updatedPlayers);
};

const handleAddPlayer = () => {
    const newPlayer = {
    dni: "",
    name: "",
    birthDate: "",
    goals: 0,
    warnings: 0,
    expulsions: 0,
    };
    setPlayers([...players, newPlayer]);
};

const handleDeletePlayer = (index) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
};

const handleSave = () => {
    onSave(selectedTeam, players);
    onClose();
};

return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 max-w-4xl lg:max-w-5xl w-full mx-4" style={{ borderRadius: "8px" }}>
        <div className="flex justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-bold lg:text-3xl">Cargar Datos del Partido</h2>
        <button variant="outline" onClick={onClose} style={{ borderRadius: "8px" }}>
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

        <div className="overflow-x-auto">
        <table className="w-full">
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
                <td className="px-4 py-2 text-center">
                    <input
                    type="text"
                    value={player.dni}
                    onChange={(e) => handleInputChange(index, "dni", e.target.value)}
                    className="border rounded-lg p-1 text-center w-full"
                    />
                </td>
                <td className="px-4 py-2 text-center">
                    <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleInputChange(index, "name", e.target.value)}
                    className="border rounded-lg p-1 text-center w-full"
                    />
                </td>
                <td className="px-4 py-2 text-center">
                    <input
                    type="date"
                    value={player.birthDate}
                    onChange={(e) => handleInputChange(index, "birthDate", e.target.value)}
                    className="border rounded-lg p-1 text-center w-full"
                    />
                </td>
                <td className="px-4 py-2 text-center">
                    <input
                    type="number"
                    value={player.goals}
                    onChange={(e) => handleInputChange(index, "goals", e.target.value)}
                    className="border rounded-lg p-1 text-center w-full"
                    />
                </td>
                <td className="px-4 py-2 text-center">
                    <input
                    type="number"
                    value={player.warnings}
                    onChange={(e) => handleInputChange(index, "warnings", e.target.value)}
                    className="border rounded-lg p-1 text-center w-full"
                    />
                </td>
                <td className="px-4 py-2 text-center">
                    <input
                    type="number"
                    value={player.expulsions}
                    onChange={(e) => handleInputChange(index, "expulsions", e.target.value)}
                    className="border rounded-lg p-1 text-center w-full"
                    />
                </td>
                <td className="px-4 py-2">
                    <Button
                    variant="outline"
                    size="icon"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => handleDeletePlayer(index)}
                    style={{ borderRadius: "8px" }}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>

        <div className="flex justify-between mt-4">
        <button
            onClick={handleAddPlayer}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
            Agregar Jugador +
        </button>
        <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
            Guardar
        </button>
        </div>
    </div>
    </div>
);
}
