import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, ChevronLeft, Edit3, Trash2, Shuffle, Calendar } from 'lucide-react';
import CarruselFechas from './CarruselFechas';
import Grupos from './Grupos';
import ArañaEliminacion from './ArañaEliminacion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/components/Modal';

export default function DetalleZona() {
  const { zonaId } = useParams();
  const [zona, setZona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechas, setFechas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [gruposCreados, setGruposCreados] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDeleteEquipoVisible, setModalDeleteEquipoVisible] = useState(false);
  const [equipoToDelete, setEquipoToDelete] = useState(null);
  const [numGrupos, setNumGrupos] = useState(1);
  const [fechasSorteadas, setFechasSorteadas] = useState(false);
  const [fechaInicial, setFechaInicial] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false); // Estado para controlar el modo de edición
  const [modalRondaVisible, setModalRondaVisible] = useState(false);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
  const [fechaAnteriorId, setFechaAnteriorId] = useState(null);

  const handleToggleEditMode = () => {
    setEditMode((prev) => !prev); // Alternar entre modo de edición y vista normal
  };

  const handleAbrirModalRonda = () => {
    if (zona.fechas && zona.fechas.length > 0) {
      setFechaAnteriorId(zona.fechas[zona.fechas.length - 1].id); // Última fecha
      setModalRondaVisible(true);
    } else {
      toast.error('No hay fechas disponibles para generar la siguiente ronda.');
    }
  };

  const handleSeleccionarEquipo = (equipoId) => {
    setEquiposSeleccionados((prev) =>
      prev.includes(equipoId)
        ? prev.filter((id) => id !== equipoId) // Deseleccionar
        : [...prev, equipoId] // Seleccionar
    );
  };

  const handleGenerarRonda = async () => {
    if (equiposSeleccionados.length !== zona.equipos.length / 2) {
      toast.error('Debes seleccionar exactamente la mitad de los equipos.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/zona/${zonaId}/generar-siguiente-ronda`, {
        equipos: equiposSeleccionados,
        fecha_anterior_id: fechaAnteriorId,
      });

      if (response.status === 201) {
        setFechas((prev) => [...prev, response.data.fecha]); // Agregar la nueva fecha
        toast.success('Siguiente ronda creada correctamente.');
        setModalRondaVisible(false);
        setEquiposSeleccionados([]);
      }
    } catch (error) {
      console.error('Error al generar la siguiente ronda:', error);
      toast.error(error.response?.data?.message || 'Error al generar la siguiente ronda.');
    } finally {
      setLoading(false);
    }
  };

  // Añade la función handleReemplazarEquipo
  const handleReemplazarEquipo = (equipoId) => {
    navigate(`/alta-equipo/${zonaId}?reemplazar=${equipoId}`);
  };
  
  useEffect(() => {
    const fetchZona = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/zonas/${zonaId}`);
        setZona(response.data);
        console.log(response.data);
        if (response.data.formato === 'Grupos') {
          const gruposResponse = await api.get(`/zonas/${zonaId}/grupos`);
          setGrupos(gruposResponse.data);
          setGruposCreados(gruposResponse.data.length > 0);
        }
        if (response.data.equipos.length > 0 && response.data.fechas_sorteadas) {
          const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`);
          setFechas(fechasResponse.data);
          setFechasSorteadas(true); // Establecer fechasSorteadas en true si ya hay fechas cargadas
        }

      } catch (error) {
        console.error('Error fetching zone details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZona();
  }, [zonaId]);

  // Cerrar el calendario al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortearFechas = async () => {
    // Verificar si ya hay fechas sorteadas
    if (fechasSorteadas) {
      toast.error('Primero debe eliminar todas las fechas antes de sortear nuevamente.');
      return;
    }

    if (!fechaInicial) {
      toast.error('Por favor, selecciona una fecha inicial.');
      return;
    }

    try {
      setLoading(true);
      
      // Primero, obtener los datos actualizados de la zona
      const zonaActualizada = await api.get(`/zonas/${zonaId}`);
      
      // Verificar que haya suficientes equipos para crear fechas
      if (zonaActualizada.data.equipos.length < 2) {
        toast.error('Se necesitan al menos 2 equipos para sortear fechas.');
        return;
      }
      
      const formattedFechaInicial = format(fechaInicial, 'yyyy-MM-dd');
      const requestData = {
        ...(zona.formato === 'Grupos' ? { num_grupos: numGrupos } : {}),
        fecha_inicial: formattedFechaInicial,
      };

      const response = await api.post(`/zonas/${zonaId}/fechas`, requestData);

      if (response.status === 201 && Array.isArray(response.data.fechas)) {
        setFechas(response.data.fechas);
        setFechasSorteadas(true);
        toast.success('Fechas sorteadas correctamente.');
      } else {
        throw new Error('La respuesta del servidor no contiene un array válido de fechas.');
      }
    } catch (error) {
      console.error('Error al sortear fechas:', error);
      toast.error(error.response?.data?.message || 'Error al sortear las fechas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearGrupos = async () => {
    try {
      // Verificar que haya equipos en la zona
      if (!zona.equipos || zona.equipos.length === 0) {
        toast.error('No hay equipos en la zona. Debe agregar equipos antes de crear grupos.');
        return;
      }

      // Verificar que haya suficientes equipos para crear grupos
      if (zona.equipos.length < 2) {
        toast.error('Se necesitan al menos 2 equipos para crear grupos.');
        return;
      }

      setLoading(true);
      const response = await api.post(`/zonas/${zonaId}/crear-grupos`, { num_grupos: numGrupos });
      if (response.status === 201) {
        setGrupos(response.data.grupos);
        setGruposCreados(true);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error creating groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarEquipo = (equipoId) => {
    setEquipoToDelete(equipoId);
    if (fechasSorteadas) {
      setModalDeleteEquipoVisible(true);
      fetchZona(); 
    } else {
      confirmarEliminarEquipo(equipoId);
    }
    fetchZona(); 
  };

  const confirmarEliminarEquipo = async (id) => {
    try {
      setLoading(true);
      
      // Usar el ID pasado como parámetro o el estado como respaldo
      const equipoId = id || equipoToDelete;
      
      // Si hay fechas sorteadas, mostrar modal para reemplazar equipo
      if (fechasSorteadas) {
        navigate(`/alta-equipo/${zonaId}?reemplazar=${equipoId}`);
        return;
      }
      
      const equipoToDeleteId = Number(equipoId);
      const equipoAEliminar = zona.equipos.find(e => Number(e.id) === equipoToDeleteId);
      
      if (!equipoAEliminar) {
        toast.error("Equipo no encontrado");
        console.error("No se encontró el equipo con ID:", equipoToDeleteId);
        return;
      }

      // Eliminar primero las relaciones del equipo con grupos
      if (grupos.length > 0) {
        for (const grupo of grupos) {
          if (grupo.equipos.some(e => Number(e.id) === equipoToDeleteId)) {
            await api.delete(`/grupos/${grupo.id}/equipos/${equipoToDeleteId}`);
          }
        }
      }

      // Ahora desasociar el equipo de la zona
      const response = await api.put(`/equipos/${equipoToDeleteId}`, {
        nombre: equipoAEliminar.nombre,
        escudo: equipoAEliminar.escudo || null,
        zona_id: null
      });
      
      if (response.status === 200) {
        // Actualizar el estado local
        setZona({
          ...zona,
          equipos: zona.equipos.filter((equipo) => Number(equipo.id) !== equipoToDeleteId),
        });
        
        // Actualizar también el estado de grupos para reflejar los cambios
        if (grupos.length > 0) {
          const gruposActualizados = grupos.map(grupo => ({
            ...grupo,
            equipos: grupo.equipos.filter(e => Number(e.id) !== equipoToDeleteId)
          }));
          setGrupos(gruposActualizados);
        }
        
        toast.success("Equipo eliminado de la zona correctamente");
      }
    } catch (error) {
      console.error('Error al eliminar el equipo de la zona:', error);
      toast.error('Error al eliminar el equipo de la zona');
    } finally {
      setLoading(false);
      setModalDeleteEquipoVisible(false);
      setEquipoToDelete(null);
    }
  };

  const handleActualizarGrupos = async () => {
    try {
      // Verificar que haya suficientes equipos para crear/actualizar grupos
      if (!zona.equipos || zona.equipos.length < 2) {
        toast.error('Se necesitan al menos 2 equipos para sortear grupos.');
        return;
      }

      setLoading(true);

      const response = await api.post(`/zonas/${zonaId}/crear-grupos`, { num_grupos: numGrupos });

      if (response.status === 201) {
        const gruposResponse = await api.get(`/zonas/${zonaId}/grupos`);
        
        if (Array.isArray(gruposResponse.data)) {
          setGrupos(gruposResponse.data);
          setGruposCreados(true);
          toast.success('Grupos actualizados correctamente.');
        } else {
          toast.error('Error al obtener los grupos actualizados.');
        }
      } else {
        toast.error('Error al actualizar los grupos.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar los grupos.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarEquipoEnGrupo = (grupoIndex, searchTerm) => {
    const equiposFiltrados = zona.equipos.filter((equipo) =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setGrupos((prevGrupos) =>
      prevGrupos.map((grupo, index) =>
        index === grupoIndex
          ? { ...grupo, searchTerm, filteredEquipos: equiposFiltrados }
          : grupo
      )
    );
  };

  const handleAgregarEquipoAGrupo = (grupoId, equipo) => {
    setGrupos((prevGrupos) =>
      prevGrupos.map((grupo) =>
        grupo.id === grupoId
          ? { ...grupo, equipos: [...grupo.equipos, equipo] }
          : grupo
      )
    );
  };

  const handleEliminarEquipoDeGrupo = async (grupoId, equipoId) => {
    try {
      setLoading(true);
  
      // Realizar la solicitud al backend para eliminar la relación
      const response = await api.delete(`/grupos/${grupoId}/equipos/${equipoId}`);
  
      if (response.status === 200) {
        // Actualizar el estado local eliminando el equipo del grupo
        setGrupos((prevGrupos) =>
          prevGrupos.map((grupo) =>
            grupo.id === grupoId
              ? { ...grupo, equipos: grupo.equipos.filter((equipo) => equipo.id !== equipoId) }
              : grupo
          )
        );
        
        // Verificar si el grupo quedó vacío
        const grupoActualizado = grupos.find(g => g.id === grupoId);
        if (grupoActualizado && grupoActualizado.equipos.length === 1) {
          // Si solo quedaba un equipo (el que estamos eliminando)
          toast.info('El grupo ha quedado vacío.');
        } else {
          toast.success('Equipo eliminado del grupo correctamente.');
        }
      }
    } catch (error) {
      toast.error('Error al eliminar el equipo del grupo.');
    } finally {
      setLoading(false);
    }
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

  if (!zona) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-center items-center h-full">
            <p className="text-center text-gray-500">No se encontraron detalles de la zona.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button onClick={() => navigate(`/zonas-admi/${zona.torneo_id}`)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="w-full px-40">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-2xl font-bold">{zona.nombre} - {zona.año} <span className="text-sm text-gray-500 font-normal">({zona.formato})</span></h1>
            <button onClick={() => navigate(`/alta-equipo/${zonaId}`)} className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white">
              + Cargar Equipo
            </button>
          </div>
          <div className="bg-white rounded-[8px] shadow-md p-4">
            <div className="w-full flex items-center justify-between">
              <h2 className="text-2xl font-medium">Equipos</h2>
              <span className="text-sm text-gray-500">
                Total de equipos: {zona.equipos?.length || 0}
              </span>
            </div>
            <div className="mt-4">
              {zona.equipos && zona.equipos.length === 0 ? (
                <p className="text-center text-gray-500">No hay equipos en esta zona.</p>
              ) : (
                <div className="overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow">
                  <div className="max-h-[300px] overflow-y-auto"> {/* Limitar la altura y permitir scroll */}
                    <table className="w-full">
                      <tbody>
                        {zona.equipos && zona.equipos.map((equipo) => (
                          <tr key={equipo.id} className="border-b items-center rounded-[6px] border-gray-200 last:border-0">
                            <td className="p-3 flex items-center">
                              <div className="w-6 bg-primary items-center justify-center"></div>
                              <span className="font-medium">{equipo.nombre}</span>
                            </td>
                            <td className="text-right p-3 items-center flex-row justify-center">
                              <div className='flex items-center w-full justify-end space-x-4'>
                                <button
                                  onClick={() => navigate(`/jugadores/${equipo.id}`)}
                                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-[6px] text-sm"
                                >
                                  Ver jugadores
                                </button>
                                <button
                                  onClick={() => handleReemplazarEquipo(equipo.id)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded-[6px] text-sm"
                                >
                                  Reemplazar
                                </button>
                                <button
                                  onClick={() => navigate(`/editar-equipo/${equipo.id}`)}
                                  className="items-center flex-row text-blue-500 py-1 text-sm"
                                >
                                  <Edit3 className="w-5" />
                                </button>
                                <button
                                  onClick={() => handleEliminarEquipo(equipo.id)}
                                  className="text-red-500 py-1 rounded-[6px] text-sm"
                                >
                                  <Trash2 className="w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          {zona.formato === 'Grupos' && gruposCreados && (
            <div className="mt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-medium mb-4">Grupos</h2>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="numGrupos" className="text-sm font-medium">
                      Cantidad de Grupos:
                    </label>
                    <input
                      id="numGrupos"
                      type="number"
                      min="1"
                      value={numGrupos}
                      onChange={(e) => setNumGrupos(e.target.value)}
                      className="w-16 border border-gray-300 rounded-md p-1 text-center"
                    />
                  </div>
                  
                  <button
                    onClick={handleActualizarGrupos}
                    className="py-2 px-4 rounded-md bg-green-500 hover:bg-green-600 text-white"
                  >
                    Sortear Grupos de Nuevo
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(grupos) && grupos.length > 0 ? (
                  grupos.map((grupo, index) => (
                    <div key={grupo.id || index} className="bg-white p-4 rounded-md shadow-md">
                      <h3 className="text-lg font-bold mb-2">Grupo {index + 1}</h3>
                      <div className="space-y-2">
                        {Array.isArray(grupo.equipos) && grupo.equipos.length > 0 ? (
                          grupo.equipos.map((equipo) => (
                            <div key={equipo.id} className="flex items-center gap-1">
                              {editMode ? (
                                <>
                                  <input
                                    type="text"
                                    value={equipo.nombre}
                                    disabled
                                    className="flex-1 border border-gray-300 rounded-md p-2"
                                  />
                                  <button
                                    onClick={() => handleEliminarEquipoDeGrupo(grupo.id, equipo.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              ) : (
                                <span className="flex-1">{equipo.nombre}</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No hay equipos en este grupo.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No hay grupos disponibles.</p>
                )}
              </div>
          
              {editMode && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleActualizarGrupos}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                  >
                    Guardar Cambios
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="mt-6">
            {zona.formato === 'Grupos' && !gruposCreados && zona.equipos.length > 0 && (
              <button
                onClick={() => setModalVisible(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-[6px] text-sm"
              >
                Crear Grupos
              </button>
            )}
            {((zona.formato === 'Grupos' && gruposCreados) || (zona.formato !== 'Grupos' && zona.equipos.length > 2)) && (
              <div className="mt-6 flex gap-2 items-center">
                {/* Datepicker */}
                <div className="relative" ref={calendarRef}>
                  <button
                    onClick={() => setCalendarOpen(!calendarOpen)}
                    className="py-2 px-3 flex items-center gap-2 rounded-[6px] text-sm bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {fechaInicial
                      ? format(fechaInicial, "d 'de' MMMM yyyy", { locale: es })
                      : 'Inicio de Fecha'}{' '}
                    <Calendar size={18} />
                  </button>

                  {calendarOpen && (
                    <div
                      className="absolute z-50 bg-white shadow-lg rounded-md p-2 border"
                      style={{
                        top: '-200px',
                        right: '0',
                      }}
                    >
                      <DayPicker
                        mode="single"
                        selected={fechaInicial}
                        onSelect={(date) => {
                          setFechaInicial(date);
                          setCalendarOpen(false);
                        }}
                        locale={es}
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Botón de sortear fechas */}
                <button
                  onClick={handleSortearFechas}
                  className={`py-2 px-3 flex items-center gap-2 rounded-[6px] text-sm ${
                    !fechaInicial || loading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  disabled={!fechaInicial || loading}
                >
                  {loading ? 'Sorteando...' : 'Sortear Fechas'} <Shuffle size={18} />
                </button>
              </div>
            )}
            {((zona.fechas.length > 0)) || fechasSorteadas && (
              <CarruselFechas 
                zonaId={zonaId} 
                equipos={zona.equipos} 
                fechas={fechas} 
                onFechasDeleted={() => {
                  setFechasSorteadas(false);
                  setFechas([]);
                }}
              />
            )}
            {zona.formato === 'Eliminatoria' && zona.fechas && zona.fechas.length > 0 && (
              <ArañaEliminacion fechaId={zona.fechas[0].id} />
            )}
            {(zona.formato === 'Eliminatoria' || zona.formato === 'Liga + Playoff') && (
              <button
                onClick={handleAbrirModalRonda}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Agregar Ronda
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Crear Grupos</h2>
            <label className="block mb-2">
              Cantidad de Grupos:
              <input
                type="number"
                min="1"
                value={numGrupos}
                onChange={(e) => setNumGrupos(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </label>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearGrupos}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDeleteEquipoVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative z-50">
            <h2 className="text-xl font-bold mb-4">
              {fechasSorteadas ? 'Reemplazar Equipo' : 'Eliminar Equipo de la Zona'}
            </h2>
            <p className="mb-4 text-gray-600">
              {fechasSorteadas 
                ? "Ya hay fechas sorteadas. ¿Deseas reemplazar este equipo por uno nuevo? El nuevo equipo heredará todos los partidos del equipo actual."
                : "¿Estás seguro de que deseas eliminar este equipo de la zona? El equipo se mantendrá en el sistema pero ya no pertenecerá a esta zona."}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setModalDeleteEquipoVisible(false);
                  setEquipoToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarEquipo}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {fechasSorteadas ? 'Reemplazar' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalRondaVisible && (
        <Modal onClose={() => setModalRondaVisible(false)} title="Seleccionar Equipos">
          <div>
            <p className="mb-4">Selecciona los equipos que avanzan a la siguiente ronda:</p>
            <ul className="space-y-2">
              {zona.equipos.map((equipo) => (
                <li key={equipo.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={equiposSeleccionados.includes(equipo.id)}
                    onChange={() => handleSeleccionarEquipo(equipo.id)}
                  />
                  <span>{equipo.nombre}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setModalRondaVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerarRonda}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Generar Ronda
              </button>
            </div>
          </div>
        </Modal>
      )}
      <ToastContainer position="top-right" />
    </div>
  );
}