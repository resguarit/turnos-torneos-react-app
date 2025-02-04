import React from 'react';
import { Trash2, PenSquare, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TurnoCard = ({ booking, handleDeleteSubmit }) => {
  const navigate = useNavigate();

  return (
    <div
      key={booking.id}
      className="bg-white rounded-lg shadow-sm p-4 space-y-3"
      style={{ borderRadius: '8px' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold lg:text-xl">{booking.usuario.nombre}</h3>
          <p className="text-sm font-medium text-gray-500 lg:text-lg">{`${booking.horario.hora_inicio} - ${booking.horario.hora_fin}`}</p>
          <p className='text-sm font-medium text-gray-800 lg:text-lg'>{`Monto total: $${booking.monto_total}`}</p>
          <p className='text-sm font-medium text-gray-800 lg:text-lg'>{`Monto seña: $${booking.monto_seña}`}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`text-center px-3 py-1 rounded-full text-xs lg:text-base w-3/4 ${
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
        <span className="text-center px-3 py-1 bg-gray-300 rounded-full lg:text-base text-xs w-3/4">
          {`Cancha ${booking.cancha.nro} - ${booking.cancha.tipo_cancha}`}
        </span>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          style={{ borderRadius: '4px' }}
          onClick={() => handleDeleteSubmit(booking)}
          size="icon"
          className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
        >
          <Trash2 className="h-4 w-4 lg:h-6 lg:w-6" />
        </button>
        <button
          style={{ borderRadius: '4px' }}
          size="icon"
          className="bg-naranja hover:bg-[#FF5533]/90 text-white p-2"
          onClick={() => navigate(`/editar-turno/${booking.id}`)}
        >
          <PenSquare className="h-4 w-4 lg:h-6 lg:w-6" />
        </button>
        <button
          style={{ borderRadius: '4px' }}
          onClick={() => window.open(`https://api.whatsapp.com/send?phone=549${booking.usuario.telefono}`, '_blank')}
          size="icon"
          className="bg-green-500 hover:bg-green-600 text-white p-2"
        >
          <Phone className="h-4 w-4 lg:h-6 lg:w-6" />
        </button>
      </div>
    </div>
  );
};

export default TurnoCard;