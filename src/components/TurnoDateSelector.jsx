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
          className="px-4 py-2 bg-white rounded-lg text-sm lg:text-lg font-medium text-black"
          style={{ borderRadius: '8px' }}
        >
          {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : <CalendarDays className='w-48' />}
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
          className="px-4 py-2 bg-white rounded-lg text-sm lg:text-lg font-medium text-black"
          style={{ borderRadius: '8px' }}
        >
          {startDate && endDate ? `${format(startDate, 'PPP', { locale: es })} - ${format(endDate, 'PPP', { locale: es })}` : 'Seleccionar Intervalo'}
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