import { useState, useEffect } from "react"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Search, X, Filter, ChevronDown, Link } from "lucide-react"
import api from '@/lib/axiosConfig'
import BtnLoading from "@/components/BtnLoading"

const ITEMS_PER_PAGE = 10;
const MAX_VISIBLE = 100;

function VerJugadores() {
  const navigate = useNavigate();
  const [jugadores, setJugadores] = useState([])
  const [filteredJugadores, setFilteredJugadores] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState([])
  const [showEquipoDropdown, setShowEquipoDropdown] = useState(false)
  const [showZonaDropdown, setShowZonaDropdown] = useState(false)
  const [showTorneoDropdown, setShowTorneoDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        setLoading(true)
        const response = await api.get('/jugadores');
        setJugadores(response.data);
        setFilteredJugadores(response.data);
      } catch (error) {
        console.error('Error fetching jugadores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJugadores();
  }, []);

  // Add a filter
  const addFilter = (type, value) => {
    const newFilter = { type, value }
    if (!activeFilters.some((filter) => filter.type === type && filter.value === value)) {
      setActiveFilters([...activeFilters, newFilter])
    }

    // Close the dropdown
    if (type === "equipo") setShowEquipoDropdown(false)
    if (type === "zona") setShowZonaDropdown(false)
    if (type === "torneo") setShowTorneoDropdown(false)
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
    let results = jugadores;

    // Si hay búsqueda o filtros activos, buscar sobre todos los jugadores
    if (searchTerm || activeFilters.length > 0) {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = jugadores.filter(
          (jugador) =>
            jugador.nombre?.toLowerCase().includes(term) ||
            jugador.apellido?.toLowerCase().includes(term) ||
            jugador.dni?.toString().includes(term) ||
            jugador.equipos?.some(eq => eq.nombre?.toLowerCase().includes(term))
        );
      }
      // Si no hay búsqueda pero sí filtros, usar todos los jugadores
      // (results ya es jugadores)
    } else {
      // Si no hay búsqueda ni filtros, mostrar los últimos 100 agregados
      results = [...jugadores].slice(-100).reverse();
    }

    // Apply filters (si hay)
    activeFilters.forEach((filter) => {
      switch (filter.type) {
        case "equipo":
          results = results.filter((jugador) =>
            jugador.equipos?.some(eq => eq.nombre === filter.value)
          );
          break;
        case "zona":
          results = results.filter((jugador) =>
            jugador.equipos?.some(eq => eq.zona_nombre === filter.value)
          );
          break;
        case "torneo":
          results = results.filter((jugador) =>
            jugador.equipos?.some(eq => eq.torneo_nombre === filter.value)
          );
          break;
        default:
          break;
      }
    });

    setFilteredJugadores(results);
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchTerm, activeFilters, jugadores])

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = filteredJugadores.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredJugadores.length / ITEMS_PER_PAGE)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Get unique values for filters
  const uniqueEquipos = [
    ...new Set(
      jugadores
        .flatMap(j => j.equipos?.map(eq => eq.nombre) || [])
        .filter(Boolean)
    ),
  ];
  const uniqueZonas = [
    ...new Set(
      jugadores
        .flatMap(j => j.equipos?.map(eq => eq.zona_nombre) || [])
        .filter(Boolean)
    ),
  ];
  const uniqueTorneos = [
    ...new Set(
      jugadores
        .flatMap(j => j.equipos?.map(eq => eq.torneo_nombre) || [])
        .filter(Boolean)
    ),
  ];

  // Dropdown handlers
  const handleEquipoDropdown = () => {
    setShowEquipoDropdown(!showEquipoDropdown);
    setShowZonaDropdown(false);
    setShowTorneoDropdown(false);
  };
  const handleZonaDropdown = () => {
    setShowZonaDropdown(!showZonaDropdown);
    setShowEquipoDropdown(false);
    setShowTorneoDropdown(false);
  };
  const handleTorneoDropdown = () => {
    setShowTorneoDropdown(!showTorneoDropdown);
    setShowEquipoDropdown(false);
    setShowZonaDropdown(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-center items-center h-full">
            <BtnLoading />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <div className="p-6 grow bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <h1 className="text-xl font-bold mb-4 lg:text-2xl">Jugadores</h1>

          {/* Search Bar */}
          <div className="w-full flex gap-2">
            <div className="w-1/2 mb-1">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, DNI o equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1  pl-2 border rounded-[6px]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex justify-between w-1/2">
              <div className="flex gap-2">
                {/* Equipo */}
                <div className="relative">
                  <button
                    className="flex items-center gap-1 border rounded-[8px] px-2 py-1 bg-white hover:bg-gray-100 text-gray-700"
                    onClick={handleEquipoDropdown}
                  >
                    <Filter className="h-4 w-4" />
                    Equipo
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showEquipoDropdown && (
                    <div className="absolute z-10 mt-1 w-48 max-h-60 overflow-y-auto bg-white rounded-[6px] shadow-lg">
                      <ul className="py-1">
                        {uniqueEquipos.map((equipo) => (
                          <li
                            key={equipo}
                            className="px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                            onClick={() => addFilter("equipo", equipo)}
                          >
                            {equipo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
              <button
                onClick={() => navigate("/cargar-jugador")}
                className="bg-black text-base font-normal text-white hover:bg-black/90 p-1 px-3 rounded-[6px]"
              >
                + Cargar Jugador
              </button>
              <button
                onClick={() => navigate("/asociar-jugadores")}
                className="bg-gray-800 gap-2 flex items-center text-base font-normal text-white hover:bg-black/90 p-1 px-3 rounded-[6px]"
              >
                <Link size={16}/> Asociar Jugador
              </button>
              </div>
            </div>
          </div>

          {/* Filtros activos */}
          <div className="w-full flex items-center mb-6">
            {activeFilters.length > 0 && (
              <button className="text-sm ml-1 text-red-500" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}

            {activeFilters.length > 0 && (
              <div className="flex gap-2">
                {activeFilters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>
                      {filter.type === "equipo"
                        ? "Equipo: "
                        : filter.type === "zona"
                        ? "Zona: "
                        : "Torneo: "}
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

          {/* Resultados */}
          <div className="mb-2">
            <h2 className="text-gray-700">
              {jugadores.length === 0
                ? "No se encontraron jugadores"
                : `Jugadores encontrados: ${jugadores.length}`}
            </h2>
          </div>

          {/* Tabla de jugadores */}
          {currentItems.length > 0 && (
            <div className="overflow-x-auto overflow-y-hidden mb-4">
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-black">
                  <tr>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[90px]">DNI</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Nombre</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Apellido</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Teléfono</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Fecha Nac.</th>
                    <th className="py-2 px-3 border-b text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">Equipos</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentItems.map((jugador, index) => (
                    <tr key={jugador.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-3 border-b text-center text-sm">{jugador.dni}</td>
                      <td className="py-2 px-3 border-b text-center text-sm">{jugador.nombre}</td>
                      <td className="py-2 px-3 border-b text-center text-sm">{jugador.apellido}</td>
                      <td className="py-2 px-3 border-b text-center text-sm">{jugador.telefono}</td>
                      <td className="py-2 px-3 border-b text-center text-sm">{jugador.fecha_nacimiento}</td>
                      <td className="py-2 px-3 border-b text-center text-sm">
                        {jugador.equipos && jugador.equipos.length > 0
                          ? jugador.equipos.map(eq => (
                              <span key={eq.id} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                                {eq.nombre}
                              </span>
                            ))
                          : <span className="text-gray-400">Sin equipo</span>
                        }
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
      <Footer />
    </div>
  )
}

export default VerJugadores

