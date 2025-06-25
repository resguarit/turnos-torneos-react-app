import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

const SearchComponent = ({ 
  handleSearch, 
  handleClearSearch, 
  searchFechaDesde, 
  searchFechaHasta, 
  setSearchFechaDesde, 
  setSearchFechaHasta, 
  searchDni, 
  setSearchDni 
}) => {
  const [localSearchDni, setLocalSearchDni] = useState(searchDni);

  useEffect(() => {
    setLocalSearchDni(searchDni);
  }, [searchDni]);

  const handleLocalSearch = () => {
    setSearchDni(localSearchDni);
    handleSearch(localSearchDni);
  };

  const handleLocalClearSearch = () => {
    setLocalSearchDni('');
    setSearchDni('');
    handleClearSearch();
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className=''>
          <label htmlFor="searchDni">DNI del Operador</label>
          <input
            id="searchDni"
            type="text" 
            value={localSearchDni}
            onChange={(e) => setLocalSearchDni(e.target.value)}
            placeholder="Buscar por DNI"
            className="mt-1 px-2 py-1 border border-gray-300 rounded-[6px]"
          />
        </div>
        <div className='flex-col'>
          <label className='w-full' htmlFor="fechaDesde">Fecha Desde</label>
          <input
            id="fechaDesde"
            type="date"
            value={searchFechaDesde}
            onChange={(e) => setSearchFechaDesde(e.target.value)}
            className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-[6px]"
          />
        </div>
        <div> 
          <label className='w-full' htmlFor="fechaHasta">Fecha Hasta</label>
          <input
            id="fechaHasta"
            type="date"
            value={searchFechaHasta}
            onChange={(e) => setSearchFechaHasta(e.target.value)}
            className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-[6px]"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleLocalClearSearch}
          className="px-3 py-2 text-sm  bg-gray-200 rounded-[6px] hover:bg-gray-300"
        >
          Limpiar
        </button>
        <button
          onClick={handleLocalSearch}
          className="px-3 py-2 text-sm rounded-[6px] flex items-center bg-gray-600 hover:bg-gray-700 text-white"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </button>
      </div>
    </div>
  );
};

export default SearchComponent;
