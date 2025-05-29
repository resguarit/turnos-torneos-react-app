"use client"

import { useState, useEffect } from "react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Search, X, Filter, ChevronDown } from "lucide-react"
import api from '@/lib/axiosConfig'

const ITEMS_PER_PAGE = 10;

function Partidos() {
  const navigate = useNavigate();
  const [partidos, setPartidos] = useState([])
  const [filteredPartidos, setFilteredPartidos] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState([])
  const [showTorneoDropdown, setShowTorneoDropdown] = useState(false)
  const [showZonaDropdown, setShowZonaDropdown] = useState(false)
  const [showFechaDropdown, setShowFechaDropdown] = useState(false)

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const response = await api.get('/partidos');
        // Ordenar los partidos por fecha de creación en orden descendente
        const sortedPartidos = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPartidos(sortedPartidos);
        setFilteredPartidos(sortedPartidos);
      } catch (error) {
        console.error('Error fetching partidos:', error);
      }
    };

    fetchPartidos();
  }, []);

  // Handle navigation
  const handleVerMasClick = () => {
    navigate("/ver-partidos")
  }

  const handleCargarClick = () => {
    navigate("/cargar-partido")
  }

  // Add a filter
  const addFilter = (type, value) => {
    const newFilter = { type, value }
    if (!activeFilters.some((filter) => filter.type === type && filter.value === value)) {
      setActiveFilters([...activeFilters, newFilter])
    }

    // Close the dropdown
    if (type === "tournament") setShowTorneoDropdown(false)
    if (type === "zone") setShowZonaDropdown(false)
    if (type === "date") setShowFechaDropdown(false)
  }

  // Remove a filter
  const removeFilter = (type, value) => {
    setActiveFilters(activeFilters.filter((filter) => !(filter.type === type && filter.value === value)))
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([])
    setSearchTerm("")
  }

  // Apply filters and search
  useEffect(() => {
    let results = partidos

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (partido) => partido.equipos[0]?.nombre.toLowerCase().includes(term) || partido.equipos[1]?.nombre.toLowerCase().includes(term),
      )
    }

    // Apply filters
    activeFilters.forEach((filter) => {
      switch (filter.type) {
        case "tournament":
          results = results.filter((partido) => partido.fecha?.zona?.torneo.nombre === filter.value)
          break
        case "zone":
          results = results.filter((partido) => partido.fecha?.zona?.nombre === filter.value)
          break
        case "date":
          results = results.filter((partido) => partido.fecha?.nombre === filter.value)
          break
        default:
          break
      }
    })

    setFilteredPartidos(results)
    setCurrentPage(1) // Reset to first page after filtering
  }, [searchTerm, activeFilters, partidos])

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = filteredPartidos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPartidos.length / ITEMS_PER_PAGE)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Get unique values for filters
  const uniqueTorneos = [...new Set(partidos
    .filter(partido => partido.fecha?.zona?.torneo) // Filtra partidos con datos válidos
    .map(partido => partido.fecha.zona.torneo.nombre)
  )];

  const uniqueZonas = [...new Set(partidos
    .filter(partido => partido.fecha?.zona) // Filtra partidos con datos válidos
    .map(partido => partido.fecha.zona.nombre)
  )];

  const uniqueFechas = [...new Set(partidos
    .filter(partido => partido.fecha) // Filtra partidos con datos válidos
    .map(partido => partido.fecha.nombre)
  )];

  // Cambia los handlers para que solo un dropdown esté abierto a la vez:
  const handleTorneoDropdown = () => {
    setShowTorneoDropdown(!showTorneoDropdown);
    setShowZonaDropdown(false);
    setShowFechaDropdown(false);
  };
  const handleZonaDropdown = () => {
    setShowZonaDropdown(!showZonaDropdown);
    setShowTorneoDropdown(false);
    setShowFechaDropdown(false);
  };
  const handleFechaDropdown = () => {
    setShowFechaDropdown(!showFechaDropdown);
    setShowTorneoDropdown(false);
    setShowZonaDropdown(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header></Header>
      <div className="p-6 grow bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <h1 className="text-xl font-bold mb-4 lg:text-2xl">Partidos</h1>

            {/* Search Bar */}
            <div className="w-full flex gap-2" >
            <div className="w-1/2 mb-1">
              <input
                type="text"
                placeholder="Buscar por equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1 pl-2 border rounded-[6px]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex  justify-between w-1/2">
              <div className="flex  gap-2">
              <div className="relative">
                <button
                  className="flex items-center gap-1 border rounded-[8px] px-2 py-1 bg-white  hover:bg-gray-100 text-gray-700"
                  onClick={handleTorneoDropdown}
                >
                  <Filter className="h-4 w-4" />
                  Torneo
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showTorneoDropdown && (
                  <div className="absolute z-10 mt-1 w-48 max-h-60 overflow-y-auto bg-white rounded-[6px] shadow-lg">
                    <ul className="py-1">
                      {uniqueTorneos.map((torneo) => (
                        <li
                          key={torneo}
                          className="px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                          onClick={() => addFilter("tournament", torneo)}
                        >
                          {torneo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-1 border rounded-[8px] px-2 py-1 bg-white  hover:bg-gray-100 text-gray-700"
                  onClick={handleZonaDropdown}
                >
                  <Filter className="h-4 w-4" />
                  Zona
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showZonaDropdown && (
                  <div className="absolute z-10 mt-1 w-48 max-h-60 overflow-y-auto bg-white rounded-[6px] shadow-lg">
                    <ul className="py-1 ">
                      {uniqueZonas.map((zona) => (
                        <li
                          key={zona}
                          className="px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                          onClick={() => addFilter("zone", zona)}
                        >
                          {zona}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-1 border rounded-[8px] px-2 py-1 bg-white  hover:bg-gray-100 text-gray-700"
                  onClick={handleFechaDropdown}
                >
                  <Filter className="h-4 w-4" />
                  Fecha
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showFechaDropdown && (
                  <div className="absolute z-10 mt-1 w-48 max-h-60 overflow-y-auto bg-white rounded-[6px] shadow-lg">
                    <ul className="py-1">
                      {uniqueFechas.map((fecha) => (
                        <li
                          key={fecha}
                          className="px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                          onClick={() => addFilter("date", fecha)}
                        >
                          {fecha}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              </div>
            <button
              onClick={handleCargarClick}
              className="bg-black text-white hover:bg-black/90 p-1 px-3 rounded-[6px]"
            >
              + Cargar Partido
            </button>
            </div>
            </div>

            <div className="w-full flex items-center mb-6" >
            {activeFilters.length > 0 && (
                <button  className="text-sm ml-1 text-red-500" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex  gap-2 ">
                {activeFilters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>
                      {filter.type === "tournament" ? "Torneo: " : filter.type === "zone" ? "Zona: " : "Fecha: "}
                      {filter.value}
                    </span>
                    <button onClick={() => removeFilter(filter.type, filter.value)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          

          {/* Results Count */}
          <div className="mb-2">
            <h2 className=" text-gray-700 ">
              {filteredPartidos.length === 0
                ? "No se encontraron partidos"
                : `Partidos encontrados: ${filteredPartidos.length}`}
            </h2>
          </div>

          {/* Partidos Table */}
          {currentItems.length > 0 && (
            <div className="overflow-x-auto overflow-y-hidden mb-4">
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-black">
                  <tr>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Resultado</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[90px]">Horario</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[90px]">Cancha</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Torneo</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Zona</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[90px]">Fecha</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentItems.map((partido, index) => (
                    <tr key={partido.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-3 border-b text-sm truncate">
                        <div className="grid grid-cols-3 items-center w-full">
                          <span className="text-left truncate">{partido.equipos[0]?.nombre}</span>
                          <span className="text-center min-w-[50px]">{partido.marcador_visitante ?? '-'} - {partido.marcador_local ?? '-'}</span>
                          <span className="text-right truncate">{partido.equipos[1]?.nombre}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-b text-center text-sm">
                        {partido.horario ? `${partido.horario.hora_inicio} - ${partido.horario.hora_fin}` : 'No Definido'}
                      </td>
                      <td className="py-2 px-3 border-b text-center text-sm">
                        {partido.cancha ? `${partido.cancha.nro} - ${partido.cancha.tipo_cancha}` : 'No Definido'}
                      </td>
                      <td className="py-2 px-3 border-b text-center text-sm">
                        {partido.fecha?.zona?.torneo?.nombre || 'No Definido'}
                      </td>
                      <td className="py-2 px-3 border-b text-center text-sm">
                        {partido.fecha?.zona?.nombre}
                      </td>
                      <td className="py-2 px-3 border-b text-center text-sm">
                        {partido.fecha?.nombre}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-naranja text-white' : 'bg-gray-200'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>


        </div>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default Partidos

