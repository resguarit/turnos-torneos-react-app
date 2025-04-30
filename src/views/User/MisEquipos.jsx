import { useEffect, useState } from "react";
import api from "@/lib/axiosConfig";

export default function MisEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dni = localStorage.getItem("dni"); // O usa tu método de obtención de usuario
    if (!dni) return;
    api.get(`/jugadores/info-por-dni/${dni}`)
      .then(res => {
        setEquipos(res.data.equipos || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando equipos...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mis Equipos</h2>
      <ul className="space-y-4">
        {equipos.length === 0 && <li>No tenés equipos asociados.</li>}
        {equipos.map(equipo => (
          <li key={equipo.id} className="bg-white p-4 rounded-lg shadow">
            <p className="font-bold">{equipo.nombre}</p>
            <p className="mb-1">Torneos:</p>
            <ul className="ml-4 mb-2">
              {equipo.torneos.length === 0 && <li className="text-gray-500">Sin torneos</li>}
              {equipo.torneos.map(torneo => (
                <li key={torneo.id}>{torneo.nombre}</li>
              ))}
            </ul>
            <p className="mb-1">Próximos partidos:</p>
            <ul className="ml-4">
              {equipo.proximos_partidos.length === 0 && <li className="text-gray-500">Sin próximos partidos</li>}
              {equipo.proximos_partidos.map(partido => (
                <li key={partido.id}>
                  {partido.fecha} - vs {partido.equipo_local_id === equipo.id ? partido.equipo_visitante_nombre : partido.equipo_local_nombre}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}