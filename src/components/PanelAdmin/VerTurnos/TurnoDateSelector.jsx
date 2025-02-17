import React from 'react';
import { DayPicker } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DateSelector = ({ viewOption, selectedDate, startDate, endDate, isOpen, toggleCalendar, handleDateChange, handleRangeChange }) => (
  <div className="relative">
    {viewOption === 'day' ? (
      <>
        <button
          onClick={toggleCalendar}
          className="w-full rounded-[4px] justify-center flex p-1 mt-1 bg-white  text-xs  font-medium text-black border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
        >
          {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : <CalendarDays className="w-5 h-5" />}
        </button>
        {isOpen && (
          <div className="absolute mt-2 z-10 bg-white shadow-lg rounded-lg">
            <DayPicker selected={selectedDate} onDayClick={handleDateChange} />
          </div>
        )}
      </>
    ) : (
      <>
        <button
          onClick={toggleCalendar}
          className="w-full rounded-[4px] justify-center flex p-1 mt-1 bg-white text-xs  font-medium text-black border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
        >
          {startDate && endDate ? `${format(startDate, 'PPP', { locale: es })} - ${format(endDate, 'PPP', { locale: es })}` : <CalendarDays className="w-5 h-5" />}
        </button>
        {isOpen && (
          <div className="absolute mt-2 z-10 bg-white shadow-lg rounded-lg">
            <DayPicker
              mode="range"
              selected={{ from: startDate, to: endDate }}
              onSelect={handleRangeChange}
            />
          </div>
        )}
      </>
    )}
  </div>
);

export default DateSelector;