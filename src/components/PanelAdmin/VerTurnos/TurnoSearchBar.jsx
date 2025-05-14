import React from 'react';
import { Search, Eraser } from 'lucide-react';

const SearchBar = ({ searchType, setSearchType, searchTerm, setSearchTerm, handleFilterToggle, handleSearch, isFilterOpen, clearFilters }) => {
  return (
    <div className="w-full flex flex-col sm:flex-row gap-4">
      {/* Selector de búsqueda */}
      <div className="relative w-full sm:w-1/3">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full text-sm sm:text-base px-2 py-1 border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Nombre</option>
          <option value="dni">DNI</option>
          <option value="telefono">Teléfono</option>
          <option value="email">Email</option>
          <option value="id">ID</option>
        </select>
      </div>

      {/* Input de búsqueda y botones */}
      <div className="relative flex flex-col sm:flex-row w-full gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={`Buscar por ${searchType === 'name' ? 'nombre' : searchType}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1 pl-8 text-sm sm:text-base border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2 top-2 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleFilterToggle}
            className="flex-1 sm:flex-none flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-blue-600 border border-blue-600 rounded-[10px] shadow hover:bg-white hover:text-blue-600"
          >
            <span className="text-sm sm:text-base">Filtros</span>
          </button>

          <button
            onClick={() => handleSearch(searchType, searchTerm)}
            className="flex-1 sm:flex-none flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-green-600 border border-green-600 rounded-[10px] shadow hover:bg-white hover:text-green-600"
          >
            <Search className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:block text-sm sm:text-base">Buscar</span>
          </button>

          <button
            onClick={clearFilters}
            className="flex-1 sm:flex-none flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-red-600 border border-red-600 rounded-[10px] shadow hover:bg-white hover:text-red-600"
          >
            <Eraser className="w-5 h-5 sm:hidden"/>
            <span className="hidden sm:block text-sm sm:text-base">Limpiar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;