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
        const response = await api.get('/partidos')
        setPartidos(response.data)
        setFilteredPartidos(response.data)
      } catch (error) {
        console.error('Error fetching partidos:', error)
      }
    }

    fetchPartidos()
  }, [])

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
          results = results.filter((partido) => partido.fecha.zona.torneo.nombre === filter.value)
          break
        case "zone":
          results = results.filter((partido) => partido.fecha.zona.nombre === filter.value)
          break
        case "date":
          results = results.filter((partido) => partido.fecha.nombre === filter.value)
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
  const uniqueTorneos = [...new Set(partidos.map(partido => partido.fecha.zona.torneo.nombre))]
  const uniqueZonas = [...new Set(partidos.map(partido => partido.fecha.zona.nombre))]
  const uniqueFechas = [...new Set(partidos.map(partido => partido.fecha.nombre))]

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header></Header>
      <div className="p-6 grow bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <h1 className="text-2xl font-bold mb-4 lg:text-4xl">Partidos</h1>

          {/* Search and Filter Section */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="font-semibold text-lg mb-4">Buscar Partidos</h2>

            {/* Search Bar */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar por equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setShowTorneoDropdown(!showTorneoDropdown)}
                >
                  <Filter className="h-4 w-4" />
                  Torneo
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {showTorneoDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                    <ul className="py-1">
                      {uniqueTorneos.map((torneo) => (
                        <li
                          key={torneo}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setShowZonaDropdown(!showZonaDropdown)}
                >
                  <Filter className="h-4 w-4" />
                  Zona
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {showZonaDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                    <ul className="py-1">
                      {uniqueZonas.map((zona) => (
                        <li
                          key={zona}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setShowFechaDropdown(!showFechaDropdown)}
                >
                  <Filter className="h-4 w-4" />
                  Fecha
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {showFechaDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                    <ul className="py-1">
                      {uniqueFechas.map((fecha) => (
                        <li
                          key={fecha}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => addFilter("date", fecha)}
                        >
                          {fecha}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {activeFilters.length > 0 && (
                <Button variant="ghost" className="text-red-500" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
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
          <div className="mb-4">
            <h2 className="font-semibold text-sm lg:text-2xl">
              {filteredPartidos.length === 0
                ? "No se encontraron partidos"
                : `Partidos encontrados: ${filteredPartidos.length}`}
            </h2>
          </div>

          {/* Partidos Table */}
          {currentItems.length > 0 && (
            <div className="bg-white shadow overflow-x-auto mb-4 lg:text-lg rounded-lg">
              <table className="w-full">
                <thead className="bg-naranja text-white">
                  <tr>
                    <th className="px-10 py-2 text-center font-medium">Resultado</th>
                    <th className="px-4 py-2 text-center font-medium">Horario</th>
                    <th className="px-4 py-2 text-center font-medium">Cancha</th>
                    <th className="px-6 py-2 text-center font-medium">Torneo</th>
                    <th className="px-6 py-2 text-center font-medium">Zona</th>
                    <th className="px-6 py-2 text-center font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((partido) => (
                    <tr key={partido.id} className="border-b text-sm ">
                      <td className="px-4 py-2 text-center">
                        <div className="grid grid-cols-3 items-center w-full">
                          <span className="text-left truncate">{partido.equipos[0]?.nombre}</span>
                          <span className="text-center min-w-[50px]">{partido.marcador_local ?? '-'} - {partido.marcador_visitante ?? '-'}</span>
                          <span className="text-right truncate">{partido.equipos[1]?.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">{partido.horario ? `${partido.horario.hora_inicio} - ${partido.horario.hora_fin}` : 'No Definido'}</td>
                      <td className="px-4 py-2 text-center">{partido.cancha ? partido.cancha.nombre : 'No Definido'}</td>
                      <td className="px-4 py-2 text-center">{partido.fecha.zona.torneo.nombre}</td>
                      <td className="px-4 py-2 text-center">{partido.fecha.zona.nombre}</td>
                      <td className="px-4 py-2 text-center">{partido.fecha.nombre}</td>
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

            <button
              onClick={handleCargarClick}
              className="bg-black text-white hover:bg-black/90 text-sm p-2 lg:text-lg rounded-lg"
            >
              Cargar Partido +
            </button>
        </div>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default Partidos

