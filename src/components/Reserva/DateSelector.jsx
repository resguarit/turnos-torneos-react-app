import React from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const DateSelector = ({ currentWeekStart, weekDays, today, selectedDate, setSelectedDate, handlePrevWeek, handleNextWeek, horariosRef }) => {
  return (
    <div className="md:p-4 p-3">
      <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 md:justify-start justify-center">
        <CalendarDays className="w-4 h-4 md:w-5 md:h-5" />
        Selecciona una fecha
      </h3>
      <div className="flex justify-between items-center mb-4">
        <Button className="rounded-[10px]" variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">{format(currentWeekStart, "MMMM yyyy", { locale: es })}</span>
        <Button className="rounded-[10px]" variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-7 ">
        {weekDays.map((day) => {
          const isPastDate = day < today;
          
          return (
            <Button
              key={day.toISOString()}
              variant={selectedDate?.toDateString() === day.toDateString() ? "default" : "outline"}
              className={`flex flex-col items-center rounded-[8px] p-2 h-auto ${
                selectedDate?.toDateString() === day.toDateString()
                  ? "bg-naranja hover:bg-naranja/90 text-white"
                  : isPastDate 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100"
                  : ""
              }`}
              onClick={() => {
                if (!isPastDate) {
                  setSelectedDate(day);
                  horariosRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              disabled={isPastDate}
            >
              <span className={`text-xs ${isPastDate ? 'text-gray-400' : ''}`}>
                {format(day, "EEE", { locale: es })}
              </span>
              <span className={`text-lg ${isPastDate ? 'text-gray-400' : ''}`}>
                {format(day, "d")}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;