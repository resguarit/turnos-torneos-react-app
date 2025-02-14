import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import LoadingSinHF from "@/components/LoadingSinHF";

const TimeSelector = ({ loadingHorario, availability, selectedTime, setSelectedTime, setSelectedTimeName, canchasRef }) => {
  return (
    <div className="md:p-4 p-0  md:justify-start flex flex-col justify-center">
      <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 md:justify-start justify-center">
        <Clock className="w-4 h-4 md:w-5 md:h-5" />
        Selecciona un horario
      </h3>
      <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-3 ">
        {loadingHorario ? (
          <div className="col-span-3 flex justify-center items-center">
            <LoadingSinHF />
          </div>
        ) : (
          availability.map((slot) => (
            <Button
              key={slot.id}
              variant={selectedTime === slot.id ? "default" : "outline"}
              className={selectedTime === slot.id ? "bg-naranja hover:bg-naranja/90 rounded-[8px] text-white" : " rounded-[8px]"}
              onClick={() => {
                setSelectedTime(slot.id); 
                setSelectedTimeName(slot.time);
                canchasRef.current.scrollIntoView({ behavior: 'smooth' }); // Desplazar a la sección de canchas
              }}
            >
              {slot.time}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default TimeSelector;