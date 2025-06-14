import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { Input } from '@/components/ui/input';
import { ChevronLeft, PlusCircle, Trash2, Check, Edit3, Search, X } from 'lucide-react'; // Add Search icon
import BtnLoading from '@/components/BtnLoading';
import { debounce } from 'lodash'; // Import debounce
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import ConfirmDeleteModal from '@/views/Admin/Modals/ConfirmDeleteModal';
import BackButton from '@/components/BackButton';


export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jugadoresNuevos, setJugadoresNuevos] = useState([]);
  const [jugadorEditando, setJugadorEditando] = useState(null);
  const [jugadorEditandoBackup, setJugadorEditandoBackup] = useState(null); // Guarda el estado original
  const [equipo, setEquipo] = useState({});
  const { equipoId } = useParams();
  const location = useLocation();
  const equipoNombre = location.state?.equipoNombre || 'Equipo desconocido'; 
  const zonaId = location.state?.zonaId;
  const [searchResults, setSearchResults] = useState([]);
  const [searchingDniForId, setSearchingDniForId] = useState(null); // ID of the new player row being searched
  const [equipoCargado, setEquipoCargado] = useState(false); // Nuevo estado para verificar si el equipo está cargado
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jugadorAEliminar, setJugadorAEliminar] = useState(null);
  const [showModalCapitan, setShowModalCapitan] = useState(false);
  const [nuevoCapitanId, setNuevoCapitanId] = useState('');
  const [cambiandoCapitan, setCambiandoCapitan] = useState(false);
  const [errorCapitan, setErrorCapitan] = useState('');
  const [successCapitan, setSuccessCapitan] = useState('');

  useEffect(() => {
    const fetchJugadoresYEquipo = async () => {
      try {
        setLoading(true);

        // Obtener jugadores del equipo
        const responseJugadores = await api.get(`/equipos/${equipoId}/jugadores`);
        setJugadores(responseJugadores.data);

      } catch (error) {
        console.error('Error fetching players or team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJugadoresYEquipo();
  }, [equipoId]);

  // --- Debounced Search Function ---
  const fetchJugadoresByDni = async (dni, jugadorNuevoId) => {
    if (!dni || dni.length < 3) {
      setSearchResults([]);
      setSearchingDniForId(null);
      return;
    }

    if (!zonaId) {
      console.error('Zona ID no encontrado en localStorage.');
      setSearchResults([]);
      setSearchingDniForId(null);
      return;
    }

    try {
      setSearchingDniForId(jugadorNuevoId);
      const response = await api.get(`/jugadores/search/dni?dni=${dni}&zona_id=${zonaId}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching players by DNI:', error);
      setSearchResults([]);
    }
  };

  // Use useCallback to memoize the debounced function
  const debouncedFetchJugadores = useCallback(debounce(fetchJugadoresByDni, 500), []);

  const handleAddFilaJugador = () => {
    setJugadoresNuevos([...jugadoresNuevos, { id: Date.now(), nombre: '', apellido: '', dni: '', telefono: '', fecha_nacimiento: '' }]);
  };

  const handleInputChangeNuevo = (e, id, campo) => {
    const valor = e.target.value;
    setJugadoresNuevos(prev => prev.map((jugador) => (jugador.id === id ? { ...jugador, [campo]: valor } : jugador)));

    // Trigger search only for DNI field
    if (campo === 'dni') {
      debouncedFetchJugadores(valor, id);
    } else {
      // If editing other fields, clear search for this row
      if (searchingDniForId === id) {
        setSearchResults([]);
        setSearchingDniForId(null);
      }
    }
  };

  // --- Handle Player Selection from Search ---
  const handleSelectPlayer = (selectedJugador, jugadorNuevoId) => {
    setJugadoresNuevos(prev => prev.map((jugador) =>
      jugador.id === jugadorNuevoId ? {
        ...jugador,
        id: selectedJugador.id, // Actualizar el ID con el ID real del jugador existente
        dni: selectedJugador.dni || '',
        nombre: selectedJugador.nombre || '',
        apellido: selectedJugador.apellido || '',
        telefono: selectedJugador.telefono || '',
        fecha_nacimiento: selectedJugador.fecha_nacimiento || '',
        equipo_actual: selectedJugador.equipos?.[0]?.nombre || 'Sin equipo', // Mostrar el equipo actual
        seleccionado: true // Marcar como seleccionado desde el buscador
      } : jugador
    ));
    setSearchResults([]);
    setSearchingDniForId(null);
  };

  const handleInputChange = (e, id, campo) => {
    const valor = e.target.value;
    setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...jugador, [campo]: valor } : jugador)));
  };

  const handleGuardarJugadores = async () => {
    try {
      setLoading(true);

      // Validar que no haya más de un capitán
      const yaHayCapitan = jugadores.some(j =>
        j.capitan !== undefined ? j.capitan : j.pivot?.capitan
      );
      const nuevosCapitanes = jugadoresNuevos.filter(j => j.capitan);

      if (yaHayCapitan && nuevosCapitanes.length > 0) {
        toast.error('Ya hay un capitán en el equipo. Solo puede haber uno.');
        setLoading(false);
        return;
      }

      // Dividir jugadores en seleccionados y manuales
      const jugadoresSeleccionados = jugadoresNuevos.filter(jugador => jugador.seleccionado);
      const jugadoresManuales = jugadoresNuevos.filter(jugador => !jugador.seleccionado);

      // Asociar jugadores seleccionados al equipo
      if (jugadoresSeleccionados.length > 0) {
        for (const jugador of jugadoresSeleccionados) {
          if (!jugador.id || typeof jugador.id !== 'number') { // Validar que el ID sea válido
            console.error('Jugador ID no válido:', jugador.id);
            continue;
          }

          console.log('Asociando jugador al equipo:', { jugador_id: jugador.id, equipo_id: equipoId });

          const response = await api.post(`/jugadores/asociar-a-equipo`, {
            jugador_id: jugador.id, // ID del jugador existente
            equipo_id: equipoId, // ID del equipo actual
          });

          if (response.status !== 200) {
            throw new Error(`Error al asociar el jugador ${jugador.nombre} ${jugador.apellido} al equipo.`);
          }
        }
      }

      // Crear jugadores manuales y asociarlos al equipo
      if (jugadoresManuales.length > 0) {
        for (const jugador of jugadoresManuales) {
          const response = await api.post(`/jugadores`, {
            nombre: jugador.nombre,
            apellido: jugador.apellido,
            dni: jugador.dni,
            telefono: jugador.telefono,
            fecha_nacimiento: jugador.fecha_nacimiento,
            equipos: [
              {
                id: Number(equipoId),
                capitan: !!jugador.capitan, // true o false
              }
            ],
          });

          if (response.status !== 201) {
            throw new Error(`Error al crear el jugador ${jugador.nombre} ${jugador.apellido}.`);
          }
        }
      }

      // Actualizar la lista de jugadores
      const responseJugadores = await api.get(`/equipos/${equipoId}/jugadores`);
      setJugadores(responseJugadores.data);
      setJugadoresNuevos([]);
      toast.success('Jugadores guardados exitosamente.');
    } catch (error) {
      console.error('Error al guardar jugadores:', error);
      toast.error('Ocurrió un error al guardar los jugadores.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarJugador = (id) => {
    const jugador = jugadores.find(j => j.id === id);
    setJugadorEditando(id);
    setJugadorEditandoBackup({ ...jugador }); // Guarda el estado original para cancelar
  };

  const handleCancelarEdicion = () => {
    // Restaura el jugador original
    setJugadores(jugadores.map(j =>
      j.id === jugadorEditando ? { ...jugadorEditandoBackup } : j
    ));
    setJugadorEditando(null);
    setJugadorEditandoBackup(null);
  };

  const handleActualizarJugador = async (id) => {
    const jugador = jugadores.find((jugador) => jugador.id === id);
    // Si no se editó nada, no actualices
    if (
      jugador.nombre === jugadorEditandoBackup.nombre &&
      jugador.apellido === jugadorEditandoBackup.apellido &&
      jugador.dni === jugadorEditandoBackup.dni &&
      jugador.telefono === jugadorEditandoBackup.telefono &&
      jugador.fecha_nacimiento === jugadorEditandoBackup.fecha_nacimiento
    ) {
      setJugadorEditando(null);
      setJugadorEditandoBackup(null);
      return;
    }
    try {
      setLoading(true);
      const response = await api.put(`/jugadores/${id}`, { ...jugador, equipo_id: equipoId });
      if (response.status === 200) {
        setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...response.data.jugador, editando: false } : jugador)));
        setJugadorEditando(null);
        setJugadorEditandoBackup(null);
      }
    } catch (error) {
      console.error('Error updating player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarJugador = async () => {
  try {
    setLoading(true);

    // Verificar si el jugador a eliminar es el capitán
    const jugadorAEliminarObj = jugadores.find(j => j.id === jugadorAEliminar);
    const esCapitan = jugadorAEliminarObj && (jugadorAEliminarObj.capitan !== undefined
      ? jugadorAEliminarObj.capitan
      : jugadorAEliminarObj.pivot?.capitan);

    if (esCapitan) {
      toast.error('No se puede eliminar al capitán. Debe cambiar el capitán antes de desvincularlo del equipo.');
      setShowDeleteModal(false);
      setJugadorAEliminar(null);
      setLoading(false);
      return;
    }

    await api.post(`/equipos/${equipoId}/jugadores/${jugadorAEliminar}/desvincular-jugador`, {
      jugador_id: jugadorAEliminar,
      equipo_id: equipoId,
    });
    setJugadores(jugadores.filter((jugador) => jugador.id !== jugadorAEliminar));
    setShowDeleteModal(false);
    setJugadorAEliminar(null);
    toast.success('Jugador desvinculado del equipo.');
  } catch (error) {
    console.error('Error desvinculando jugador:', error);
    toast.error('Error al desvincular el jugador del equipo.');
  } finally {
    setLoading(false);
  }
};

  // Obtener el jugador actual capitán
  const jugadorCapitan = jugadores.find(j =>
    (j.capitan !== undefined ? j.capitan : j.pivot?.capitan)
  );

  // Handler para cambiar capitán
  const handleCambiarCapitan = async () => {
    setErrorCapitan('');
    setSuccessCapitan('');
    if (!nuevoCapitanId) {
      setErrorCapitan('Debe seleccionar un jugador.');
      return;
    }
    if (jugadorCapitan && nuevoCapitanId == jugadorCapitan.id) {
      setErrorCapitan('El jugador seleccionado ya es el capitán.');
      return;
    }
    setCambiandoCapitan(true);
    try {
      const res = await api.post('/jugadores/cambiar-capitan', {
        equipo_id: equipoId,
        jugador_nuevo_id: nuevoCapitanId,
        zona_id: zonaId,
      });
      if (res.data.status === 200) {
        setSuccessCapitan('Cambio de capitán realizado correctamente.');
        // Refrescar jugadores para reflejar el nuevo capitán
        const responseJugadores = await api.get(`/equipos/${equipoId}/jugadores`);
        setJugadores(responseJugadores.data);
        setNuevoCapitanId('');
        setSuccessCapitan('');
        setErrorCapitan('');
        setShowModalCapitan(false);
        toast.success('Cambio de capitán realizado correctamente.');
      } else {
        setErrorCapitan(res.data.message || 'Error al cambiar capitán.');
      }
    } catch (err) {
      setErrorCapitan('Error al cambiar capitán.');
    } finally {
      setCambiandoCapitan(false);
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

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <BackButton ruta={`/detalle-zona/${zonaId}`} />
        </div>
        <div className="justify-center">
          <div className="flex justify-end items-center mb-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[6px] text-sm  shadow"
              onClick={() => setShowModalCapitan(true)}
            >
              {jugadorCapitan === undefined ? 'Asignar Capitán' : 'Cambiar Capitán'}
            </button>
          </div>
          <div className="bg-white w-full rounded-[12px] shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-medium mb-6 flex items-center">
              Lista de Jugadores de 
              <span className='bg-blue-500 bg-opacity-20 rounded-3xl px-3 py-1 ml-2 text-blue-700'>{equipoNombre}</span>
            </h2>
            <div className="bg-white">
            <div className="overflow-visible">
              <table className="w-full bg-white table-fixed border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/7">DNI</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/7">Nombre</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/7">Apellido</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/7">Teléfono</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/7">Fecha de Nacimiento</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 w-1/7">Capitán</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 w-1/7">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jugadores.length === 0 && jugadoresNuevos.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-gray-500 py-8 italic">
                          No hay jugadores en este equipo.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {jugadores.map((jugador) => (
                          <tr key={jugador.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              {jugadorEditando === jugador.id ? (
                                <input
                                  value={jugador.dni}
                                  onChange={(e) => handleInputChange(e, jugador.id, 'dni')}
                                  placeholder="DNI"
                                  className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              ) : (
                                <span className="font-mono">{jugador.dni}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {jugadorEditando === jugador.id ? (
                                <input
                                  value={jugador.nombre}
                                  onChange={(e) => handleInputChange(e, jugador.id, 'nombre')}
                                  placeholder="Nombre"
                                  className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              ) : (
                                jugador.nombre
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {jugadorEditando === jugador.id ? (
                                <input
                                  value={jugador.apellido}
                                  onChange={(e) => handleInputChange(e, jugador.id, 'apellido')}
                                  placeholder="Apellido"
                                  className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              ) : (
                                jugador.apellido
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {jugadorEditando === jugador.id ? (
                                <input
                                  value={jugador.telefono}
                                  onChange={(e) => handleInputChange(e, jugador.id, 'telefono')}
                                  placeholder="Teléfono"
                                  className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              ) : (
                                jugador.telefono
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {jugadorEditando === jugador.id ? (
                                <input
                                  type="date"
                                  value={jugador.fecha_nacimiento}
                                  onChange={(e) => handleInputChange(e, jugador.id, 'fecha_nacimiento')}
                                  placeholder="Fecha de Nacimiento"
                                  className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              ) : (
                                jugador.fecha_nacimiento
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={!!(jugador.pivot && jugador.pivot.capitan)}
                                  readOnly
                                  disabled
                                  className="h-5 w-5 accent-blue-600 rounded"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center space-x-2">
                                {jugadorEditando === jugador.id ? (
                                  <>
                                    <button
                                      onClick={() => handleActualizarJugador(jugador.id)}
                                      className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition-colors"
                                      title="Confirmar"
                                    >
                                      <Check className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelarEdicion}
                                      className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                                      title="Cancelar edición"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditarJugador(jugador.id)}
                                      className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition-colors"
                                      title="Editar"
                                    >
                                      <Edit3 className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setJugadorAEliminar(jugador.id);
                                        setShowDeleteModal(true);
                                      }}
                                      className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {jugadoresNuevos.map((jugador) => (
                          <tr key={jugador.id} className="border-b hover:bg-blue-50 bg-blue-50/30 transition-colors relative">
                            <td className="py-3 px-4">
                              <div className="relative">
                                <input
                                  value={jugador.dni}
                                  onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'dni')}
                                  placeholder="DNI"
                                  className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  autoComplete="off"
                                />
                                {searchingDniForId === jugador.id && searchResults.length > 0 && (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-xl">
                            {searchResults.map((result) => (
                              <li
                                key={result.id}
                                className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelectPlayer(result, jugador.id)}
                              >
                                {result.dni} - {result.nombre} {result.apellido}
                              </li>
                            ))}
                          </ul>
                        )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                value={jugador.nombre}
                                onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'nombre')}
                                placeholder="Nombre"
                                className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                value={jugador.apellido}
                                onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'apellido')}
                                placeholder="Apellido"
                                className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                value={jugador.telefono}
                                onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'telefono')}
                                placeholder="Teléfono"
                                className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="date"
                                value={jugador.fecha_nacimiento}
                                onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'fecha_nacimiento')}
                                placeholder="Fecha de Nacimiento"
                                className="p-2 text-sm border border-gray-300 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={jugador.capitan || false}
                                  onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'capitan')}
                                  className="h-5 w-5 accent-blue-600 rounded"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => setJugadoresNuevos(jugadoresNuevos.filter((j) => j.id !== jugador.id))}
                                  className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors"
                                  title="Eliminar Fila"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className='w-full flex justify-end p-4'>
                <button
                  onClick={handleAddFilaJugador}
                  className="bg-black hover:bg-black/80 p-2 px-4 text-sm  rounded-[6px] text-white flex items-center transition-colors shadow-sm" 
                >
                  + Agregar Jugador
                </button>
              </div>
            </div>
            {jugadoresNuevos.length > 0 && (
              <div className="flex justify-end mt-4 gap-4">
                <button
                  onClick={() => setJugadoresNuevos([])} // Acción para cancelar la carga de nuevos jugadores
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-[6px] text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarJugadores}
                  disabled={loading}
                  className={`bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-[6px] text-sm flex items-center gap-2 transition-colors shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? <BtnLoading/> : <Check size={16}/>} Guardar Nuevos
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ToastContainer />
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleEliminarJugador}
        loading={loading}
        accionTitulo="eliminación"
        accion="eliminar"
        pronombre="al"
        entidad="jugador"
        accionando="Eliminando"
        nombreElemento={
            jugadorAEliminar
              ? (() => {
                  const jugador = jugadores.find(j => j.id === jugadorAEliminar);
                  return jugador ? `${jugador.nombre} ${jugador.apellido}` : undefined;
                })()
              : undefined
          }      
        />

      {/* Modal Cambiar Capitán */}
      {showModalCapitan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowModalCapitan(false);
                setNuevoCapitanId('');
                setErrorCapitan('');
                setSuccessCapitan('');
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Cambiar Capitán</h2>
            <div className="mb-4">
              <div className="mb-2 font-semibold">Capitán actual:</div>
              {jugadorCapitan ? (
                <div className="flex items-center gap-2 bg-blue-50 rounded px-3 py-2">
                  <span className="font-medium">{jugadorCapitan.nombre} {jugadorCapitan.apellido}</span>
                  <span className="text-xs text-gray-500">DNI: {jugadorCapitan.dni}</span>
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm">
                  No hay capitán asignado actualmente en este equipo.
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Seleccionar nuevo capitán:</label>
              <select
                className="w-full border border-gray-300 p-2 rounded"
                value={nuevoCapitanId}
                onChange={e => setNuevoCapitanId(e.target.value)}
              >
                <option value="">Seleccionar jugador...</option>
                {jugadores.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.nombre} {j.apellido} (DNI: {j.dni})
                  </option>
                ))}
              </select>
            </div>
            {errorCapitan && (
              <div className="text-red-600 text-sm mb-2">{errorCapitan}</div>
            )}
            {successCapitan && (
              <div className="text-green-600 text-sm mb-2">{successCapitan}</div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                onClick={() => {
                  setShowModalCapitan(false);
                  setNuevoCapitanId('');
                  setErrorCapitan('');
                  setSuccessCapitan('');
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleCambiarCapitan}
                disabled={cambiandoCapitan}
              >
                {cambiandoCapitan ? 'Cambiando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}