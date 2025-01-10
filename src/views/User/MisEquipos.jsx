export default function MisEquipos() {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Mis Equipos</h2>
        <ul className="space-y-4">
          <li className="bg-white p-4 rounded-lg shadow">
            <p className="font-bold">Los Campeones</p>
            <p>Deporte: Fútbol</p>
            <p>Miembros: 11</p>
          </li>
          <li className="bg-white p-4 rounded-lg shadow">
            <p className="font-bold">Raquetas de Oro</p>
            <p>Deporte: Tenis</p>
            <p>Miembros: 4</p>
          </li>
        </ul>
      </div>
    )
  }