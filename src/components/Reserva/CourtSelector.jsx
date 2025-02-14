import React from 'react';
import { Button } from "@/components/ui/button";
import LoadingSinHF from "@/components/LoadingSinHF";

const CourtSelector = ({ loadingCancha, courts, selectedCourt, setSelectedCourt }) => {
  return (
    <div className="md:p-4 p-0  md:justify-start flex flex-col justify-center">
      <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 md:justify-start justify-center">Selecciona una cancha</h3>
      <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-3 ">
        {loadingCancha ? (
          <div className="col-span-2 flex justify-center items-center">
            <LoadingSinHF />
          </div>
        ) : (
          courts.map((court) => (
            <Button
              key={court.id}
              variant={selectedCourt === court ? "default" : "outline"}
              className={`h-auto w-[80%] border border-gray-400 lg:w-auto flex rounded-[8px] flex-col items-start p-2 md:p-4 ${
                selectedCourt === court ? "bg-naranja hover:bg-naranja/90 text-white" : ""
              }`}
              onClick={() => setSelectedCourt(court)}
            >
              <span className="font-bold md:text-base text-sm">Cancha {court.nro} - {court.tipo}</span>
              <span className="md:text-sm text-xs">Precio: ${court.precio_por_hora}</span>
              <span className="md:text-sm text-xs">Seña: ${court.seña}</span>
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default CourtSelector;