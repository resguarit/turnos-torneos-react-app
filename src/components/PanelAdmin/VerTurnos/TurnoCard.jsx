import React from 'react';
import { Trash2, PenSquare, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TurnoCard = ({ booking, handleDeleteSubmit }) => {
  const navigate = useNavigate();

  return (
    <div
      key={booking.id}
      className="bg-white rounded-[8px] shadow-sm p-4 space-y-4 w-full"
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex-1">
          <h3 className="font-semibold text-lg capitalize">{booking.usuario.nombre}</h3>
          <p className="text-sm font-medium text-gray-500">{`${booking.horario.hora_inicio} - ${booking.horario.hora_fin}`}</p>
          <p className="text-sm font-medium text-gray-800">{`Monto total: $${booking.monto_total}`}</p>
          <p className="text-sm font-medium text-gray-800">{`Monto seña: $${booking.monto_seña}`}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        <span
          className={`text-center px-3 py-1 rounded-xl text-sm ${
            booking.estado === 'Pendiente'
              ? 'bg-yellow-300'
              : booking.estado === 'Señado'
              ? 'bg-blue-300'
              : booking.estado === 'Pagado'
              ? 'bg-green-300'
              : 'bg-red-300'
          }`}
        >
          {`Estado: ${booking.estado}`}
        </span>
        <span className="text-center px-3 py-1 bg-gray-300 rounded-xl text-sm">
          {`Cancha ${booking.cancha.nro} - ${booking.cancha.tipo_cancha}`}
        </span>
      </div>

      <div className="flex gap-2 justify-center w-full">
        <button
          onClick={() => handleDeleteSubmit(booking)}
          size="icon"
          className="bg-red-600 hover:bg-naranja/90 text-white p-2 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          size="icon"
          className="bg-blue-600 hover:bg-naranja/90 text-white p-2 transition-colors duration-200"
          onClick={() => navigate(`/editar-turno/${booking.id}`)}
        >
          <PenSquare className="h-4 w-4" />
        </button>
        <button
          onClick={() => window.open(`https://api.whatsapp.com/send?phone=549${booking.usuario.telefono}`, '_blank')}
          size="icon"
          className="bg-green-500 hover:bg-green-600 text-white p-2 transition-colors duration-200"
        >
          <Phone className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TurnoCard;