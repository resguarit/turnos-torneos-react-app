import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";

const ReservationSummary = ({ selectedDate, selectedTimeName, selectedCourt, handleSubmit }) => {
  return (
    <div className="mt-6 pt-6 border-t">
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:justify-between items-center">
        <div className="space-y-1">
          <p className="font-medium md:text-base text-sm">Resumen de reserva</p>
          {selectedDate && <p className="text-xs md:text-sm text-gray-600 capitalize">Fecha: {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {locale:es})}</p>}
          {selectedTimeName && <p className=" text-xs md:text-sm text-gray-600">Hora: {selectedTimeName}</p>}
          {selectedCourt && <p className="text-xs md:text-sm text-gray-600">Cancha: {selectedCourt.nro}</p>}
        </div>
        <Button
          className="bg-naranja hover:bg-naranja/90 text-white rounded-[8px]"
          disabled={!selectedDate || !selectedTimeName || !selectedCourt}
          onClick={handleSubmit}
        >
          Confirmar Reserva
        </Button>
      </div>
    </div>
  );
};

export default ReservationSummary;