"use client"

import { useState, useEffect } from "react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Search, X, Filter, ChevronDown } from "lucide-react"

// Sample data for filters
const torneos = ["DOMINGO", "SABADO", "SENIOR", "JUVENIL"]
const zonas = ["Liga A", "Zona B", "Zona C", "Zona D"]
const fechas = ["Fecha 1", "Fecha 2", "Fecha 3", "Fecha 4", "Fecha 5"]

// Sample match data
const allMatches = [
  {
    id: 1,
    team1: "KIRICOCHO",
    score1: 3,
    team2: "LA 95 FC",
    score2: 2,
    time: "18:00",
    field: 3,
    tournament: "DOMINGO",
    zone: "Liga A",
    date: "Fecha 1",
  },
  {
    id: 2,
    team1: "CUCHARA FC",
    score1: 0,
    team2: "E.E.N",
    score2: 1,
    time: "20:00",
    field: 2,
    tournament: "SENIOR",
    zone: "Zona C",
    date: "Fecha 2",
  },
  {
    id: 3,
    team1: "ATLETICO",
    score1: 3,
    team2: "1800 FC",
    score2: 2,
    time: "19:00",
    field: 5,
    tournament: "SABADO",
    zone: "Zona B",
    date: "Fecha 1",
  },
  {
    id: 4,
    team1: "DEP. ALFILERES",
    score1: 2,
    team2: "CHICAGO",
    score2: 2,
    time: "17:30",
    field: 1,
    tournament: "DOMINGO",
    zone: "Liga A",
    date: "Fecha 3",
  },
  {
    id: 5,
    team1: "EL PELIGRO",
    score1: 4,
    team2: "COCOS FC",
    score2: 0,
    time: "21:00",
    field: 4,
    tournament: "JUVENIL",
    zone: "Zona D",
    date: "Fecha 2",
  },
]

function Partidos() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState([])
  const [filteredMatches, setFilteredMatches] = useState(allMatches)
  const [showTorneoDropdown, setShowTorneoDropdown] = useState(false)
  const [showZonaDropdown, setShowZonaDropdown] = useState(false)
  const [showFechaDropdown, setShowFechaDropdown] = useState(false)

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
    let results = allMatches

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (match) => match.team1.toLowerCase().includes(term) || match.team2.toLowerCase().includes(term),
      )
    }

    // Apply filters
    activeFilters.forEach((filter) => {
      switch (filter.type) {
        case "tournament":
          results = results.filter((match) => match.tournament === filter.value)
          break
        case "zone":
          results = results.filter((match) => match.zone === filter.value)
          break
        case "date":
          results = results.filter((match) => match.date === filter.value)
          break
        default:
          break
      }
    })

    setFilteredMatches(results)
  }, [searchTerm, activeFilters])

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
                      {torneos.map((torneo) => (
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
                      {zonas.map((zona) => (
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
                      {fechas.map((fecha) => (
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
              {filteredMatches.length === 0
                ? "No se encontraron partidos"
                : `Partidos encontrados: ${filteredMatches.length}`}
            </h2>
          </div>

          {/* Matches Table */}
          {filteredMatches.length > 0 && (
            <div className="bg-white shadow overflow-x-auto mb-4 lg:text-xl rounded-lg">
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
                  {filteredMatches.map((match) => (
                    <tr key={match.id} className="border-b text-sm lg:text-lg">
                      <td className="px-4 py-2 text-center">
                        <div className="flex flex-col items-center lg:flex-row lg:justify-around">
                          <span>{match.team1}</span>
                          <span>
                            {match.score1} - {match.score2}
                          </span>
                          <span>{match.team2}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">{match.time}</td>
                      <td className="px-4 py-2 text-center">{match.field}</td>
                      <td className="px-4 py-2 text-center">{match.tournament}</td>
                      <td className="px-4 py-2 text-center">{match.zone}</td>
                      <td className="px-4 py-2 text-center">{match.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col items-start space-y-5">
            <Button onClick={handleVerMasClick} variant="link" className="text-gray-600 lg:text-base">
              Ver más →
            </Button>
            <button
              onClick={handleCargarClick}
              className="bg-black text-white hover:bg-black/90 text-sm p-2 lg:text-lg rounded-lg"
            >
              Cargar Partido +
            </button>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default Partidos

