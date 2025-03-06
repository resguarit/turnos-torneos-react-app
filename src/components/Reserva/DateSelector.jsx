import React, { useRef, useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const DateSelector = ({ currentWeekStart, weekDays, today, selectedDate, setSelectedDate, handlePrevWeek, handleNextWeek, horariosRef, inactiveDays }) => {
  const calendarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={calendarRef} className="md:p-4 p-3">
      <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 md:justify-start justify-center">
        <CalendarDays className="w-4 h-4 md:w-5 md:h-5" />
        Selecciona una fecha
      </h3>
      <div className="flex justify-between items-center mb-4">
        <Button className="rounded-[10px]" variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">{format(currentWeekStart, "MMMM yyyy", { locale: es })}</span>
        <Button className="rounded-[10px]" variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-7 ">
        {weekDays.map((day) => {
          const isPastDate = day < today;
          const isInactiveDay = inactiveDays.includes(day.getDay());
          
          return (
            <Button
              key={day.toISOString()}
              variant={selectedDate?.toDateString() === day.toDateString() ? "default" : "outline"}
              className={`flex flex-col border capitalize border-gray-400 items-center rounded-[8px] p-2 h-auto ${
                selectedDate?.toDateString() === day.toDateString()
                  ? "bg-naranja hover:bg-naranja/90 text-white"
                  : isPastDate || isInactiveDay
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100"
                  : ""
              }`}
              onClick={() => {
                if (!isPastDate && !isInactiveDay) {
                  setSelectedDate(day);
                  horariosRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              disabled={isPastDate || isInactiveDay}
            >
              <span className={`text-xs ${isPastDate || isInactiveDay ? 'text-gray-400' : ''}`}>
                {format(day, "EEE", { locale: es })}
              </span>
              <span className={`text-lg ${isPastDate || isInactiveDay ? 'text-gray-400' : ''}`}>
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