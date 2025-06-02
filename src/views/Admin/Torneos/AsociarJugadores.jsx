import { useEffect, useState } from "react";
import { Search, Users, Shield, X, UserCheck, ChevronDown, ChevronUp, Plus, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BackButton from "@/components/BackButton";
import BtnLoading from "@/components/BtnLoading";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AsociarJugadorModal from "../Modals/AsociarJugadorModal";
import DesvincularJugadorModal from "../Modals/DesvincularJugadorModal";

const ITEMS_PER_PAGE = 10;
const MAX_JUGADORES = 100;
const MAX_EQUIPOS = 20;

export default function AsociarJugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("players");
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPageJugadores, setCurrentPageJugadores] = useState(1);
  const [currentPageEquipos, setCurrentPageEquipos] = useState(1);
  const [expandedEquipoId, setExpandedEquipoId] = useState(null);
  const [isAddJugadorOpen, setIsAddJugadorOpen] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [busquedaJugador, setBusquedaJugador] = useState("");
  const [jugadoresBusqueda, setJugadoresBusqueda] = useState([]);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [isDesvincularOpen, setIsDesvincularOpen] = useState(false);
const [jugadorDesvincular, setJugadorDesvincular] = useState(null);
const [loadingDesvincular, setLoadingDesvincular] = useState(false);

  // Traer jugadores y equipos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [jugadoresRes, equiposRes] = await Promise.all([
          api.get("/jugadores"),
          api.get("/equipos"),
        ]);
        setJugadores(jugadoresRes.data);
        setEquipos(equiposRes.data);
      } catch (err) {
        toast.error("Error al cargar datos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Filtrar jugadores y equipos según el término de búsqueda
  const filteredJugadores = jugadores.filter(
    (jugador) =>
      jugador.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jugador.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jugador.dni?.toString().includes(searchTerm)
  );

  const filteredEquipos = equipos.filter(
    (equipo) =>
      equipo.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener nombre del equipo por ID
  const getEquipoNombreById = (equipoId) => {
    if (!equipoId) return "Sin equipo";
    const equipo = equipos.find((e) => e.id === equipoId);
    return equipo ? equipo.nombre : "Sin equipo";
  };

  // Obtener equipos de un jugador
  const getEquiposJugador = (jugador) =>
    jugador.equipos && jugador.equipos.length > 0
      ? jugador.equipos.map((eq) => getEquipoNombreById(eq.id)).join(", ")
      : "Sin equipo";

  // Abrir diálogo para asociar jugador
  const openDialog = (jugador) => {
    setSelectedJugador(jugador);
    setSelectedEquipoId(null);
    setIsDialogOpen(true);
  };

  // Función para abrir el modal de agregar jugador a equipo
  const openAddJugadorModal = (equipo) => {
    setEquipoSeleccionado(equipo);
    setBusquedaJugador("");
    setJugadoresBusqueda([]);
    setIsAddJugadorOpen(true);
  };

  // Buscar jugadores por nombre, apellido o dni
  const buscarJugadores = async (valor) => {
    setBusquedaJugador(valor);
    if (valor.length < 2) {
      setJugadoresBusqueda([]);
      return;
    }
    setLoadingBusqueda(true);
    try {
      // Puedes ajustar el endpoint según tu backend
      const res = await api.get(`/jugadores?busqueda=${encodeURIComponent(valor)}`);
      setJugadoresBusqueda(res.data);
    } catch {
      setJugadoresBusqueda([]);
    } finally {
      setLoadingBusqueda(false);
    }
  };

  // Asociar jugador seleccionado al equipo
  const asociarJugadorAEquipo = async (jugador) => {
    if (!equipoSeleccionado) return;
    setLoading(true);
    try {
      await api.post("/jugadores/asociar-a-equipo", {
        jugador_id: jugador.id,
        equipo_id: equipoSeleccionado.id,
      });
      toast.success("Jugador asociado correctamente");
      setIsAddJugadorOpen(false);
      // Refrescar jugadores
      const jugadoresRes = await api.get("/jugadores");
      setJugadores(jugadoresRes.data);
    } catch (err) {
      toast.error("Error al asociar jugador");
    } finally {
      setLoading(false);
    }
  };

  // Asociar jugador a equipo
  const asociarJugador = async () => {
    if (!selectedJugador || !selectedEquipoId) {
      toast.error("Selecciona un equipo");
      return;
    }
    setLoading(true);
    try {
      await api.post("/jugadores/asociar-a-equipo", {
        jugador_id: selectedJugador.id,
        equipo_id: selectedEquipoId,
      });
      toast.success("Jugador asociado correctamente");
      setIsDialogOpen(false);
      // Refrescar jugadores
      const jugadoresRes = await api.get("/jugadores");
      setJugadores(jugadoresRes.data);
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Error al asociar jugador");
      }
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado y paginado para jugadores
  let jugadoresToShow = jugadores;
  if (searchTerm || activeTab !== "players") {
    jugadoresToShow = filteredJugadores;
  } else {
    jugadoresToShow = [...jugadores].slice(-MAX_JUGADORES).reverse();
  }
  const totalPagesJugadores = Math.ceil(jugadoresToShow.length / ITEMS_PER_PAGE);
  const paginatedJugadores = jugadoresToShow.slice(
    (currentPageJugadores - 1) * ITEMS_PER_PAGE,
    currentPageJugadores * ITEMS_PER_PAGE
  );

  // Lógica de filtrado y paginado para equipos
  let equiposToShow = equipos;
  if (searchTerm || activeTab !== "teams") {
    equiposToShow = filteredEquipos;
  } else {
    equiposToShow = [...equipos].slice(-MAX_EQUIPOS).reverse();
  }
  const totalPagesEquipos = Math.ceil(equiposToShow.length / ITEMS_PER_PAGE);
  const paginatedEquipos = equiposToShow.slice(
    (currentPageEquipos - 1) * ITEMS_PER_PAGE,
    currentPageEquipos * ITEMS_PER_PAGE
  );

  const openDesvincularModal = (jugador) => {
  setJugadorDesvincular(jugador);
  setIsDesvincularOpen(true);
};

const desvincularJugador = async (equipoId) => {
  setLoadingDesvincular(true);
  try {
    await api.post(`/equipos/${equipoId}/jugadores/${jugadorDesvincular.id}/desvincular-jugador`, {
      jugador_id: jugadorDesvincular.id,
      equipo_id: equipoId,
    });
    toast.success("Jugador desvinculado correctamente");
    setIsDesvincularOpen(false);
    // Refrescar jugadores
    const jugadoresRes = await api.get("/jugadores");
    setJugadores(jugadoresRes.data);
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      "No se pudo desvincular al jugador"
    );
  } finally {
    setLoadingDesvincular(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gray-100">
      <Header />
      <ToastContainer position="top-right" />
      <main className="flex-1 grow p-6">
        <div className="w-full flex mb-4">
          <BackButton ruta={-1} />
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="bg-white p-6 rounded-[8px] max-w-5xl w-full">
            <h1 className="text-xl font-bold mb-6 text-black">Asociar Jugadores a Equipos</h1>
            {loadingData ? (
              <div className="flex justify-center items-center h-64">
                <BtnLoading />
              </div>
            ) : (
              <>
                {/* Búsqueda */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    className="pl-10 rounded-[6px] p-1 w-full bg-gray-100 border-gray-300 focus:border-black"
                    placeholder="Buscar jugadores o equipos..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPageJugadores(1);
                      setCurrentPageEquipos(1);
                    }}
                  />
                </div>

                {/* Tabs personalizadas */}
                <div className="flex border-b mb-6">
                  <button
                    className={`px-4 py-2 font-medium flex items-center gap-2 transition-colors ${
                      activeTab === 'players'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      setActiveTab('players');
                      setCurrentPageJugadores(1);
                    }}
                  >
                    <Users size={16} />
                    <span>Jugadores</span>
                  </button>
                  <button
                    className={`px-4 py-2 font-medium flex items-center gap-2 transition-colors ${
                      activeTab === 'teams'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      setActiveTab('teams');
                      setCurrentPageEquipos(1);
                    }}
                  >
                    <Shield size={16} />
                    <span>Equipos</span>
                  </button>
                </div>

                {/* Contenido de Jugadores */}
                {activeTab === "players" && (
                  <div className="space-y-4">
                    <div className="grid gap-1">
                      {paginatedJugadores.length > 0 ? (
                        paginatedJugadores.map((jugador) => {
                          const tieneEquipo = jugador.equipos && jugador.equipos.length > 0;
                          return (
                            <div
                              key={jugador.id}
                              className="flex items-center justify-between p-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div>
                                <h3 className="font-medium capitalize text-black">{jugador.nombre} {jugador.apellido}</h3>
                                <div className="text-sm text-gray-600">
                                  DNI: {jugador.dni} • {jugador.fecha_nacimiento ? format(new Date(jugador.fecha_nacimiento), "dd/MM/yyyy") : ""}
                                </div>
                                <div className={`w-fit px-2 text-sm mt-1 rounded-xl ${tieneEquipo ? "bg-blue-200 text-blue-800" : "bg-red-200 text-red-500"}`} >
                                  {getEquiposJugador(jugador)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {tieneEquipo && (
                                    <button
                                        className="ml-2 rounded-[6px] px-2 py-1 text-sm flex items-center bg-red-200 text-red-700 hover:bg-red-500 hover:text-white transition"
                                        onClick={() => openDesvincularModal(jugador)}
                                    >
                                        <UserX className="w-4 h-4 mr-1" /> Desvincular de equipo
                                    </button>
                                    )}
                              <button
                                className={`rounded-[6px] px-2 py-1 text-sm flex items-center transition-colors
                                  ${tieneEquipo
                                    ? "bg-gray-200 text-gray-800 hover:bg-gray-700 hover:text-white"
                                    : "bg-green-200 text-green-700 hover:bg-green-500 hover:text-white transition"}
                                `}
                                size="sm"
                                onClick={() => openDialog(jugador)}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Asociar a Equipo
                              </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No se encontraron jugadores con ese criterio de búsqueda
                        </div>
                      )}
                    </div>
                    {/* Paginado jugadores */}
                    {totalPagesJugadores > 1 && (
                      <div className="flex justify-center space-x-2 mt-4">
                        {Array.from({ length: totalPagesJugadores }, (_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => setCurrentPageJugadores(idx + 1)}
                            className={`px-4 py-2 rounded-md ${currentPageJugadores === idx + 1 ? 'bg-naranja text-white' : 'bg-gray-200'}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Contenido de Equipos */}
                {activeTab === "teams" && (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {paginatedEquipos.length > 0 ? (
                        paginatedEquipos.map((equipo) => {
                          const jugadoresEquipo = jugadores.filter((j) =>
                            j.equipos?.some(eq => eq.id === equipo.id)
                          );
                          const isExpanded = expandedEquipoId === equipo.id;
                          return (
                            <div key={equipo.id} className="border border-gray-200 rounded-lg">
                              <div className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
                                <button
                                  className="flex items-center gap-2 focus:outline-none"
                                  onClick={() =>
                                    setExpandedEquipoId(isExpanded ? null : equipo.id)
                                  }
                                >
                                  <h3 className="font-medium capitalize text-black">{equipo.nombre}</h3>
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                                    {jugadoresEquipo.length} jugadores
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  )}
                                </button>
                                <button
                                  className="ml-2 flex items-center gap-1 px-2 py-1 rounded-[6px] bg-green-200 text-green-700 hover:bg-green-500 hover:text-white transition"
                                  onClick={() => openAddJugadorModal(equipo)}
                                  title="Agregar jugador"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span className="text-sm ">Agregar</span>
                                </button>
                              </div>
                              {isExpanded && (
                                <div className="border-t px-4 py-2 bg-gray-50 space-y-1">
                                  {jugadoresEquipo.length > 0 ? (
                                    jugadoresEquipo.map((jugador) => (
                                      <div
                                        key={jugador.id}
                                        className="flex items-center justify-between text-sm p-2 rounded"
                                      >
                                        <span>
                                          {jugador.nombre} {jugador.apellido} • DNI: {jugador.dni}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-gray-500 text-sm py-2">
                                      No hay jugadores en este equipo
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No se encontraron equipos con ese criterio de búsqueda
                        </div>
                      )}
                    </div>
                    {/* Paginado equipos */}
                    {totalPagesEquipos > 1 && (
                      <div className="flex justify-center space-x-2 mt-4">
                        {Array.from({ length: totalPagesEquipos }, (_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => setCurrentPageEquipos(idx + 1)}
                            className={`px-4 py-2 rounded-md ${currentPageEquipos === idx + 1 ? 'bg-naranja text-white' : 'bg-gray-200'}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Modal agregar jugador */}
                    {isAddJugadorOpen && (
                      <Dialog open={isAddJugadorOpen} onOpenChange={setIsAddJugadorOpen}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Agregar jugador a {equipoSeleccionado?.nombre}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-2">
                            <input
                              className="w-full border rounded px-2 py-1 mb-2"
                              placeholder="Buscar por nombre, apellido o DNI..."
                              value={busquedaJugador}
                              onChange={e => buscarJugadores(e.target.value)}
                              autoFocus
                            />
                            {loadingBusqueda && (
                              <div className="text-center text-gray-500 py-2 text-sm">Buscando...</div>
                            )}
                            {!loadingBusqueda && jugadoresBusqueda.length === 0 && busquedaJugador.length > 1 && (
                              <div className="text-center text-gray-500 py-2 text-sm">No se encontraron jugadores</div>
                            )}
                            <div className="max-h-48 overflow-y-auto">
                              {jugadoresBusqueda.map(jugador => (
                                <div
                                  key={jugador.id}
                                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                                >
                                  <span>
                                    {jugador.nombre} {jugador.apellido} • DNI: {jugador.dni}
                                  </span>
                                  <button
                                    className="ml-2 px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                                    onClick={() => asociarJugadorAEquipo(jugador)}
                                    disabled={loading}
                                  >
                                    Asociar
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}

                
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    <AsociarJugadorModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        jugador={selectedJugador}
        equipos={equipos}
        selectedEquipoId={selectedEquipoId}
        setSelectedEquipoId={setSelectedEquipoId}
        loading={loading}
        onAsociar={asociarJugador}
    />
    <DesvincularJugadorModal
        isOpen={isDesvincularOpen}
        onClose={() => setIsDesvincularOpen(false)}
        jugador={jugadorDesvincular}
        equiposJugador={jugadorDesvincular?.equipos || []}
        loading={loadingDesvincular}
        onDesvincular={desvincularJugador}
    />
    </div>
  );
}