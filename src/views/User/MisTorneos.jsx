export default function MisTorneos() {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Mis Torneos</h2>
        <ul className="space-y-4">
          <li className="bg-white p-4 rounded-lg shadow">
            <p className="font-bold">Copa Primavera</p>
            <p>Deporte: Fútbol</p>
            <p>Fecha: 1 de Septiembre - 15 de Octubre, 2023</p>
          </li>
          <li className="bg-white p-4 rounded-lg shadow">
            <p className="font-bold">Torneo Relámpago de Tenis</p>
            <p>Deporte: Tenis</p>
            <p>Fecha: 5 de Agosto, 2023</p>
          </li>
        </ul>
      </div>
    )
  }