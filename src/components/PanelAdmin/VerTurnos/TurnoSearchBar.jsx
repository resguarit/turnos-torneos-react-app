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
          className="w-full text-gray-600 text-sm px-2 py-1 border  rounded-[6px] "
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
        <div className="relative flex-1 ">
          <input
            type="text"
            placeholder={`Buscar por ${searchType === 'name' ? 'nombre' : searchType}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-gray-600 placeholder-gray-600 w-full py-1 pl-2 text-sm border rounded-[6px]"
          />
          <Search className="absolute right-2 top-2 h-4 w-4 text-gray-600" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleSearch(searchType, searchTerm)}
            className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 text-white bg-green-600 border border-green-600 rounded-[6px] shadow hover:bg-white hover:text-green-600"
          >
            <Search className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:block text-sm ">Buscar</span>
          </button>

          <button
            onClick={clearFilters}
            className="flex-1 sm:flex-none flex items-center justify-center  px-3 sm:px-4 text-white bg-red-600 border border-red-600 rounded-[6px] shadow hover:bg-white hover:text-red-600"
          >
            <Eraser className="w-5 h-5 sm:hidden"/>
            <span className="hidden sm:block text-sm ">Limpiar</span>
          </button>
                    <button
            onClick={handleFilterToggle}
            className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 text-white bg-blue-600 border border-blue-600 rounded-[6px] shadow hover:bg-white hover:text-blue-600"
          >
            <span className="text-sm ">Filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;