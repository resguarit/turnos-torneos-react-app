import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar'; // Asegúrate de que esta ruta sea correcta
import { Button } from '@/components/ui/button'; // Usando el componente Button de ShadCN
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'; // Usando Popover de ShadCN

export default function DatePicker({ selectedDate, onDateChange }) {
  const [open, setOpen] = useState(false);

  const handleDateChange = (date) => {
    onDateChange(date);
    setOpen(false); // Cierra el calendario una vez que se selecciona una fecha
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            {selectedDate ? selectedDate.toLocaleDateString() : 'Seleccionar Fecha'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Calendar selected={selectedDate} onSelect={handleDateChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
