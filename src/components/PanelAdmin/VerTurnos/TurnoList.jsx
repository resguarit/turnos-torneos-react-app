import React from 'react';
import TurnoCard from '@/components/PanelAdmin/VerTurnos/TurnoCard';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const TurnoList = ({ filteredBookings, handleDeleteSubmit }) => (
  <div className='w-full items-center justify-center'>
    {Object.keys(filteredBookings)
      .sort((a, b) => new Date(a) - new Date(b)) // Ordenar las fechas de menor a mayor
      .map(date => (
        <div key={date} className=''>
          <h1 className='text-lg font-semibold'>{format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: es })}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center items-center pb-6">
            {filteredBookings[date].map((booking) => (
              <TurnoCard
                key={booking.id}
                booking={booking}
                handleDeleteSubmit={handleDeleteSubmit}
              />
            ))}
          </div>
        </div>
      ))}
  </div>
);

export default TurnoList;