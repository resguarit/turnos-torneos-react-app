import React from 'react';
import TurnoCard from '@/components/PanelAdmin/VerTurnos/TurnoCard';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const TurnoList = ({ filteredBookings, handleDeleteSubmit, onPagoRegistrado }) => {
  // Verificar si hay turnos para mostrar
  const hasBookings = Object.keys(filteredBookings).length > 0;

  if (!hasBookings) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <h2 className="text-4xl font-bold text-gray-600">No hay turnos próximos</h2>
      </div>
    );
  }

  return (
    <div className='w-full items-center justify-center'>
      {Object.keys(filteredBookings)
        .sort((a, b) => new Date(a) - new Date(b)) // Ordenar las fechas de menor a mayor
        .map(date => (
          <div key={date} className=''>
            <h1 className='text-lg font-semibold capitalize'>{format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: es })}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center items-center pb-6">
              {filteredBookings[date].map((booking) => (
                <TurnoCard
                  key={booking.id}
                  booking={booking}
                  handleDeleteSubmit={handleDeleteSubmit}
                  onPagoRegistrado={onPagoRegistrado}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TurnoList;