import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';

export default function MisTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await api.get(`turnos/usuario/${userId}`);
        const adjustedTurnos = response.data.turnos.map(turno => {
          const adjustedFechaTurno = new Date(new Date(turno.fecha_turno).getTime() + new Date(turno.fecha_turno).getTimezoneOffset() * 60000);
          const adjustedFechaReserva = new Date(new Date(turno.fecha_reserva).getTime() + new Date(turno.fecha_reserva).getTimezoneOffset() * 60000);
          return { ...turno, fecha_turno: adjustedFechaTurno, fecha_reserva: adjustedFechaReserva };
        });
        setTurnos(adjustedTurnos);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTurnos();
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  const seeMore = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <h2 className="font-semibold mb-4 text-2xl">Próximos Turnos</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {turnos.map((turno) => (
          <li key={turno.id} className="bg-white p-4 lg:text-xl rounded-xl shadow">
            <h1 className='lg:text-2xl text-xl font-semibold '>Fecha: {new Date(turno.fecha_turno).toLocaleDateString()}</h1>
            <p className='lg:text-2xl text-xl  '>Hora: {turno.horario.hora_inicio} - {turno.horario.hora_fin}</p>
            <p className="lg:text-2xl text-xl">Cancha: {turno.cancha.tipo_cancha} (Nro: {turno.cancha.nro})</p>
            <button className="text-gray-600 py-1 rounded-md" onClick={seeMore}>Ver más</button>
            {isOpen &&
            <div>
              <p>Fecha de Reserva: {new Date(turno.fecha_reserva).toLocaleDateString()}</p>
              <p>Monto Total: ${turno.monto_total}</p>
              <p>Monto Seña: ${turno.monto_seña}</p>
            </div>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}