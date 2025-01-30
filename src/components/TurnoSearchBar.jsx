import React from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const SearchBar = ({ searchType, setSearchType, searchTerm, setSearchTerm, handleFilterToggle, handleSearch, isFilterOpen }) => {
  return (
    <div className="mb-6 flex gap-4">
      <div className="relative w-32">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Nombre</option>
          <option value="dni">DNI</option>
          <option value="telefono">Teléfono</option>
          <option value="email">Email</option>
        </select>
      </div>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={`Buscar por ${searchType}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-[9px] border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <button
        onClick={handleFilterToggle}
        className="px-4 py-2 bg-naranja text-white rounded-lg shadow transition-colors duration-200 transform hover:scale-105"
      >
        Filtros
      </button>
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors duration-200 transform hover:scale-105"
      >
        Buscar
      </button>
     
    </div>
  );
};

export default SearchBar;