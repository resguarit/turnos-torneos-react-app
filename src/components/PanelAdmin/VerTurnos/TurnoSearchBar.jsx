import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchType, setSearchType, searchTerm, setSearchTerm, handleFilterToggle, handleSearch, isFilterOpen, clearFilters }) => {
  return (
    <div className="w-full flex gap-4 md:flex-row flex-col">
      <div className='flex w-full gap-4'>
      <div className="relative sm:w-40 w-1/3">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full h-7 p-1 border text-sm border-gray-300 rounded-[6px] shadow-sm "
        >
          <option value="name">Nombre</option>
          <option value="dni">DNI</option>
          <option value="telefono">Teléfono</option>
          <option value="email">Email</option>
        </select>
      </div>
      <div className="relative flex w-full">
        <input
          type="text"
          placeholder={`Buscar por ${searchType}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm p-1 h-7 border border-gray-300 rounded-[6px] shadow-sm "
        />
        <Search className="absolute right-2 top-1.5 h-4 w-4 text-gray-400" />
      </div>
      </div>
      <div className='flex gap-4 justify-end'>
      <button
        onClick={handleFilterToggle}
        className="h-7 px-3 text-sm bg-naranja text-white rounded-[4px] shadow transition-colors duration-200 transform hover:scale-105"
      >
        Filtros
      </button>
      <button
        onClick={() => handleSearch(searchType, searchTerm)}
        className="h-7  px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-[4px] shadow transition-colors duration-200 transform hover:scale-105"
      >
        Buscar
      </button>
      <button
        onClick={clearFilters}
        className="h-7 px-2 flex items-center justify-center w-40 text-sm bg-red-600 hover:bg-red-700 text-white rounded-[4px] shadow transition-colors duration-200 transform hover:scale-105"
      >
        Borrar Filtros
      </button>
      </div>
    </div>
  );
};

export default SearchBar;