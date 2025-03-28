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
        <div>
          <Label htmlFor="searchDni">DNI del Operador</Label>
          <Input
            id="searchDni"
            type="text" 
            value={localSearchDni}
            onChange={(e) => setLocalSearchDni(e.target.value)}
            placeholder="Buscar por DNI"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="fechaDesde">Fecha Desde</Label>
          <Input
            id="fechaDesde"
            type="date"
            value={searchFechaDesde}
            onChange={(e) => setSearchFechaDesde(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="fechaHasta">Fecha Hasta</Label>
          <Input
            id="fechaHasta"
            type="date"
            value={searchFechaHasta}
            onChange={(e) => setSearchFechaHasta(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleLocalClearSearch}
          variant="outline"
          className="bg-white hover:bg-gray-50"
        >
          Limpiar
        </Button>
        <Button
          onClick={handleLocalSearch}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default SearchComponent;
