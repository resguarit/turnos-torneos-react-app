import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const UnifiedDateSelector = ({ onDateSelect, reset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ from: undefined, to: undefined });
  const calendarRef = useRef(null);
  
  const toggleCalendar = () => setIsOpen(!isOpen);

  const handleSelect = (range) => {
    // Ensure we always have a valid range object
    const newRange = range || { from: undefined, to: undefined };
    setSelectedRange(newRange);
    
    if (newRange?.from) {
      if (!newRange.to) {
        // Single date selection
        onDateSelect({ type: 'single', date: newRange.from });
        setIsOpen(false);
      } else if (newRange.to) {
        // Range selection
        onDateSelect({ 
          type: 'range', 
          startDate: newRange.from, 
          endDate: newRange.to 
        });
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (reset) {
      setSelectedRange({ from: undefined, to: undefined });
    }
  }, [reset]);

  const getDisplayText = () => {
    // Handle the case when selectedRange is undefined or null
    if (!selectedRange || !selectedRange.from) {
      return (
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-gray-500 ">Seleccione una fecha</span>
          <CalendarDays className="w-5 h-5 text-gray-400" />
        </div>
      );
    }
    
    if (!selectedRange.to) {
      return format(selectedRange.from, 'PPP', { locale: es });
    }
    
    return `${format(selectedRange.from, 'PPP', { locale: es })} - ${format(selectedRange.to, 'PPP', { locale: es })}`;
  };

  return (
    <div className="relative w-1/2" ref={calendarRef}>
      <button
        onClick={toggleCalendar}
        className="w-full rounded-[4px] justify-center flex p-1 bg-white text-xs items-center sm:h-8 h-7 font-medium text-black"
      >
        {getDisplayText()}
      </button>
      
      {isOpen && (
        <div className="absolute mt-2 z-30 bg-white shadow-lg rounded-[8px] sm:text-base text-sm right-0">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            locale={es}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedDateSelector;