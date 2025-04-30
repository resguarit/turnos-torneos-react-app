import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { Input } from '@/components/ui/input';
import { ChevronLeft, PlusCircle, Trash2, Check, Edit3, Search } from 'lucide-react'; // Add Search icon
import BtnLoading from '@/components/BtnLoading';
import { debounce } from 'lodash'; // Import debounce
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';

export default function Jugadores() {
  const { equipoId } = useParams();
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jugadoresNuevos, setJugadoresNuevos] = useState([]);
  const [jugadorEditando, setJugadorEditando] = useState(null);
  const [equipo, setEquipo] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchingDniForId, setSearchingDniForId] = useState(null); // ID of the new player row being searched
  const [equipoCargado, setEquipoCargado] = useState(false); // Nuevo estado para verificar si el equipo está cargado
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJugadoresYEquipo = async () => {
      try {
        setLoading(true);

        // Obtener jugadores del equipo
        const responseJugadores = await api.get(`/equipos/${equipoId}/jugadores`);
        setJugadores(responseJugadores.data);

        // Obtener datos del equipo
        const responseEquipo = await api.get(`/equipos/${equipoId}`);
        setEquipo(responseEquipo.data); // Actualizar el estado del equipo

        // Obtener zona_id desde localStorage
        const zonaId = localStorage.getItem('zona_id');
        if (!zonaId) {
          console.warn('Zona ID no encontrado en localStorage.');
        }
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

    const zonaId = localStorage.getItem('zona_id'); // Obtener zona_id desde localStorage
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

  const handleActualizarJugador = async (id) => {
    const jugador = jugadores.find((jugador) => jugador.id === id);
    try {
      setLoading(true);
      const response = await api.put(`/jugadores/${id}`, { ...jugador, equipo_id: equipoId });
      if (response.status === 200) {
        setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...response.data.jugador, editando: false } : jugador)));
        setJugadorEditando(null);
      }
    } catch (error) {
      console.error('Error updating player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarJugador = (id) => {
    setJugadorEditando(id);
  };

  const handleEliminarJugador = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/jugadores/${id}`);
      setJugadores(jugadores.filter((jugador) => jugador.id !== id));
    } catch (error) {
      console.error('Error deleting player:', error);
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

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button onClick={() => navigate(-1)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="px-40 justify-center">
          <div className="flex justify-end items-center mb-6">
           
          </div>
          <div className="bg-white w-full rounded-[8px] shadow-md p-4">
            <h2 className="text-2xl font-medium mb-4">Lista de Jugadores de <span className='bg-blue-500 bg-opacity-30 rounded-3xl p-1'>{equipo.nombre}</span></h2>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 text-left text-sm">DNI</th>
                  <th className="py-2 text-left text-sm">Nombre</th>
                  <th className="py-2 text-left text-sm">Apellido</th>
                  <th className="py-2 text-left text-sm">Teléfono</th>
                  <th className="py-2 text-left text-sm">Fecha de Nacimiento</th>
                  <th className="py-2 text-center text-sm">Capitán</th> {/* Nueva columna */}
                  <th className="py-2 text-center text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.length === 0 && jugadoresNuevos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">
                      No hay jugadores en este equipo.
                    </td>
                  </tr>
                ) : (
                  <>
                    {jugadores.map((jugador) => (
                      <tr key={jugador.id} className="border-b">
                                                <td className="py-2">
                          {jugadorEditando === jugador.id ? (
                            <input
                              value={jugador.dni}
                              onChange={(e) => handleInputChange(e, jugador.id, 'dni')}
                              placeholder="DNI"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          ) : (
                            jugador.dni
                          )}
                        </td>
                        <td className="py-2">
                          {jugadorEditando === jugador.id ? (
                            <input
                              value={jugador.nombre}
                              onChange={(e) => handleInputChange(e, jugador.id, 'nombre')}
                              placeholder="Nombre"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          ) : (
                            jugador.nombre
                          )}
                        </td>
                        <td className="py-2">
                          {jugadorEditando === jugador.id ? (
                            <input
                              value={jugador.apellido}
                              onChange={(e) => handleInputChange(e, jugador.id, 'apellido')}
                              placeholder="Apellido"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          ) : (
                            jugador.apellido
                          )}
                        </td>
                        <td className="py-2">
                          {jugadorEditando === jugador.id ? (
                            <input
                              value={jugador.telefono}
                              onChange={(e) => handleInputChange(e, jugador.id, 'telefono')}
                              placeholder="Teléfono"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          ) : (
                            jugador.telefono
                          )}
                        </td>
                        <td className="py-2">
                          {jugadorEditando === jugador.id ? (
                            <input
                              type="date"
                              value={jugador.fecha_nacimiento}
                              onChange={(e) => handleInputChange(e, jugador.id, 'fecha_nacimiento')}
                              placeholder="Fecha de Nacimiento"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          ) : (
                            jugador.fecha_nacimiento
                          )}
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!(jugador.pivot && jugador.pivot.capitan)}
                            readOnly
                            disabled
                            className={
                              "accent-blue-600" + (jugador.pivot && jugador.pivot.capitan ? " bg-blue-600" : "")
                            }
                          />
                        </td>
                        <td className="py-2 text-center">
                          {jugadorEditando === jugador.id ? (
                            <button
                              onClick={() => handleActualizarJugador(jugador.id)}
                              className="p-1 text-green-600 hover:text-green-800 mr-2"
                              title="Confirmar"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditarJugador(jugador.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 mr-2"
                              title="Editar"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEliminarJugador(jugador.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {jugadoresNuevos.map((jugador) => (
                      <tr key={jugador.id} className="border-b relative"> {/* Add relative positioning */}
                      {/* DNI with Search */}
                      <td className="py-2">
                        <div className="relative"> {/* Wrapper for positioning dropdown */}
                          <input
                            value={jugador.dni}
                            onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'dni')}
                            placeholder="DNI"
                            className="p-1 text-sm border border-black w-full rounded-[6px]"
                            autoComplete="off" // Prevent browser autocomplete interference
                          />
                          {/* Search Results Dropdown */}
                          {searchingDniForId === jugador.id && searchResults.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
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
                      {/* Nombre */}
                      <td className="py-2">
                        <input
                          value={jugador.nombre}
                          onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'nombre')}
                          placeholder="Nombre"
                          className="p-1 text-sm border border-black w-full rounded-[6px]"
                        />
                      </td>
                      {/* Apellido */}
                      <td className="py-2">
                        <input
                          value={jugador.apellido}
                          onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'apellido')}
                          placeholder="Apellido"
                          className="p-1 text-sm border border-black w-full rounded-[6px]"
                        />
                      </td>
                      {/* Telefono */}
                      <td className="py-2">
                        <input
                          value={jugador.telefono}
                          onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'telefono')}
                          placeholder="Teléfono"
                          className="p-1 text-sm border border-black w-full rounded-[6px]"
                        />
                      </td>
                      {/* Fecha Nacimiento */}
                      <td className="py-2">
                        <input
                          type="date"
                          value={jugador.fecha_nacimiento}
                          onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'fecha_nacimiento')}
                          placeholder="Fecha de Nacimiento"
                          className="p-1 text-sm border border-black w-full rounded-[6px]"
                        />
                      </td>
                      {/* Checkbox Capitán */}
                      <td className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={jugador.capitan || false}
                          onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'capitan')}
                        />
                      </td>
                      {/* Acciones */}
                      <td className="py-2 text-center">
                        <button
                          onClick={() => setJugadoresNuevos(jugadoresNuevos.filter((j) => j.id !== jugador.id))}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar Fila"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    ))}
                    
                  </>
                )}
                <tr>
                      <td colSpan="6" className="text-end py-4"> {/* Increased padding */}
                        <button
                          onClick={handleAddFilaJugador}
                          className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white flex items-center gap-1 ml-auto" // Use flex for icon alignment
                        >
                          <PlusCircle size={16}/> Agregar Jugador
                        </button>
                      </td>
                    </tr>
              </tbody>
            </table>
            {jugadoresNuevos.length > 0 && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleGuardarJugadores}
                  disabled={loading} // Disable button while loading
                  className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-[6px] text-sm flex items-center gap-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    </div>
  );
}