import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { Users, ChevronLeft, Edit3, Trash2, Shuffle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@/components/Modal';
import {TabEquipos} from './Tabs/TabEquipos';
import {TabFechas} from './Tabs/TabFechas';
import {TabGrupos} from './Tabs/TabGrupos';
import {TabArania} from './Tabs/TabArania';
import {TabResultados} from './Tabs/TabResultados';
import {TabResultadosGrupos} from './Tabs/TabResultadosGrupos';
import {TabEliminatoria} from './Tabs/TabResultadosEliminatoria';

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
  const [editMode, setEditMode] = useState(false);
  const [modalRondaVisible, setModalRondaVisible] = useState(false);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
  const [fechaAnteriorId, setFechaAnteriorId] = useState(null);
  const [activeTab, setActiveTab] = useState('equipos');
  const abortControllerRef = useRef(null);

  // Inicializar el abortController cuando cambia zonaId
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [zonaId]);

  // Cargar datos iniciales de la zona
  useEffect(() => {
    const fetchZona = async () => {
      try {
        setLoading(true);
        
        const response = await api.get(`/zonas/${zonaId}`, {
          signal: abortControllerRef.current?.signal
        });
        
        if (!response.data) {
          toast.error('No se encontraron datos de la zona');
          return;
        }
        
        setZona(response.data);
        console.log('Datos de la zona:', response.data);
  
        if (response.data.formato === 'Grupos') {
          const gruposResponse = await api.get(`/zonas/${zonaId}/grupos`, {
            signal: abortControllerRef.current?.signal
          });
          setGrupos(gruposResponse.data);
          setGruposCreados(gruposResponse.data.length > 0);
          console.log('Datos de los grupos:', gruposResponse.data);
        }
  
        if (response.data.fechas_sorteadas) {
          const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`, {
            signal: abortControllerRef.current?.signal
          });
          setFechas(fechasResponse.data);
          setFechasSorteadas(true);
        } else {
          setFechasSorteadas(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Petición cancelada');
          return;
        }
        console.error('Error fetching zone details:', error);
        toast.error('Error al cargar los datos de la zona');
      } finally {
        setLoading(false);
      }
    };
  
    fetchZona();
  }, [zonaId]);

  // Función para manejar el cambio de pestaña
  const handleTabChange = (tab) => {
    // Cancelar peticiones pendientes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Crear nuevo controlador
    abortControllerRef.current = new AbortController();
    setActiveTab(tab);
  };

  const handleToggleEditMode = () => {
    setEditMode((prev) => !prev); // Alternar entre modo de edición y vista normal
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
    if (fechasSorteadas) {
      toast.error('Primero debe eliminar todas las fechas antes de sortear nuevamente.');
      return;
    }
  
    if (!fechaInicial) {
      toast.error('Por favor, selecciona una fecha inicial.');
      return;
    }
  
    if (zona.formato === 'Grupos' && (!grupos || grupos.length < 2)) {
      toast.error('Debe haber al menos 2 grupos creados para sortear las fechas.');
      return;
    }
  
    try {
      setLoading(true);
  
      // Usar la cantidad de grupos creados si existen
      const numGruposToSend = zona.formato === 'Grupos' ? grupos.length : numGrupos;
  
      console.log('Número de grupos enviados:', numGruposToSend);
  
      const formattedFechaInicial = format(fechaInicial, 'yyyy-MM-dd');
      const requestData = {
        fecha_inicial: formattedFechaInicial,
        ...(zona.formato === 'Grupos' ? { num_grupos: numGruposToSend } : {}),
      };
  
      console.log('Datos enviados al backend:', requestData);
  
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

      // Usar el nuevo endpoint para quitar el equipo de la zona
      const response = await api.delete(`/zonas/${zonaId}/equipos`, {
        data: {
          equipo_ids: [equipoToDeleteId]
        }
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

  const handleAgregarEquipoAGrupo = async (grupoId, equipoId) => {
    try {
      setLoading(true);
      const response = await api.post(`/grupos/${grupoId}/equipos/${equipoId}`);
      
      if (response.status === 200) {
        // Actualizar la lista de grupos
        const gruposResponse = await api.get(`/zonas/${zonaId}/grupos`);
        setGrupos(gruposResponse.data);
        toast.success('Equipo agregado al grupo correctamente.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al agregar el equipo.');
    } finally {
      setLoading(false);
    }
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

  const handleEliminarGrupos = async () => {
    try {
      if (!grupos || grupos.length === 0) {
        toast.error('No hay grupos para eliminar.');
        return;
      }

      const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar todos los grupos de esta zona?');
      if (!confirmacion) return;

      // Realizar la solicitud DELETE al endpoint para eliminar los grupos de la zona
      const response = await api.delete(`/zonas/${zonaId}/eliminar-grupos-zona`);

      if (response.status === 200) {
        toast.success('Grupos eliminados correctamente.');
        setGrupos([]); // Limpiar los grupos en el estado local
        setGruposCreados(false); // Indicar que los grupos ya no están creados
      } else {
        toast.error('Error al eliminar los grupos.');
      }
    } catch (error) {
      console.error('Error eliminando grupos:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar los grupos.');
    }
  };

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
          <h1 className="text-2xl lg:text-2xl font-bold">{zona.torneo.nombre} - {zona.nombre} - {zona.año} <span className="text-sm text-gray-500 font-normal">({zona.formato})</span></h1>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex border-b mb-6">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'equipos' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('equipos')}
          >
            Equipos
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'fechas' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('fechas')}
          >
            Fechas
          </button>
          {zona.formato === 'Grupos' && (
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'grupos' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('grupos')}
            >
              Grupos
            </button>
          )}
          {zona.formato === 'Eliminatoria' && (
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'arana' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('arana')}
            >
              Araña
            </button>
          )}
          {(zona.formato !== 'Eliminatoria') && (
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'resultados' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('resultados')}
          >
            Resultados
          </button>
          )}
        </div>
        

        {/* Tab Content */}
        {activeTab === 'equipos' && (
          <TabEquipos 
            zona={zona} 
            navigate={navigate} 
            zonaId={zonaId} 
            handleEliminarEquipo={handleEliminarEquipo}
            handleReemplazarEquipo={handleReemplazarEquipo}
            abortController={abortControllerRef.current}
          />
        )}
        
        {activeTab === 'fechas' && (
          <TabFechas 
            zona={zona}
            fechas={fechas}
            fechaInicial={fechaInicial}
            setFechaInicial={setFechaInicial}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            calendarRef={calendarRef}
            handleSortearFechas={handleSortearFechas}
            loading={loading}
            zonaId={zonaId}
            equipos={zona.equipos}
            fechasSorteadas={fechasSorteadas}
            onFechasDeleted={() => {
              setFechasSorteadas(false);
              setFechas([]);
            }}
            abortController={abortControllerRef.current}
          />
        )}
        
        {activeTab === 'grupos' && zona.formato === 'Grupos' && (
          <TabGrupos 
            zona={zona}
            grupos={grupos}
            gruposCreados={gruposCreados}
            numGrupos={numGrupos}
            setNumGrupos={setNumGrupos}
            handleActualizarGrupos={handleActualizarGrupos}
            handleCrearGrupos={handleCrearGrupos}
            setModalVisible={setModalVisible}
            editMode={editMode}
            handleEliminarEquipoDeGrupo={handleEliminarEquipoDeGrupo}
            handleEliminarGrupos={handleEliminarGrupos}
            handleAgregarEquipoAGrupo={handleAgregarEquipoAGrupo}
            abortController={abortControllerRef.current}
          />
        )}
        
        {activeTab === 'arana' && zona.formato === 'Eliminatoria' && (
          <TabArania 
            equipos={zona.equipos} 
            abortController={abortControllerRef.current}
          />
        )}
        
        {activeTab === 'resultados' && (
          <>
          {zona.formato === 'Liga' && <TabResultados zonaId={zonaId} abortController={abortControllerRef.current} />}
          {zona.formato === 'Grupos' && (
            <TabResultadosGrupos zonaId={zonaId} grupos={grupos} abortController={abortControllerRef.current} />
          )}
        </>
        )}
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