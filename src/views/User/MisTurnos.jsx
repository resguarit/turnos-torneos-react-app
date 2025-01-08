export default function MisTurnos() {
    return (
      <div>
        <h2 className="font-semibold mb-4 lg:text-2xl">Próximos Turnos</h2>
        <ul className="space-y-4">
          <li className="bg-white p-4 lg:text-xl rounded-lg shadow">
            <p className="font-bold">Cancha de Fútbol 5</p>
            <p>Fecha: 15 de Julio, 2023</p>
            <p>Hora: 18:00 - 19:00</p>
          </li>
          <li className="bg-white p-4 lg:text-xl rounded-lg shadow">
            <p className="font-bold">Cancha de Tenis</p>
            <p>Fecha: 20 de Julio, 2023</p>
            <p>Hora: 10:00 - 11:00</p>
          </li>
        </ul>
      </div>
    );
  }
  