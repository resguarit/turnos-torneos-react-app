import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify'; // Importar react-toastify
import ResultadoModal from '../Modals/ResultadoModal';
import { Info, Trash } from 'lucide-react';
import { debounce } from 'lodash'; // Import debounce

export default function ResultadoPartido() {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  const [partido, setPartido] = useState(null);
  const [equipoLocal, setEquipoLocal] = useState(null);
  const [equipoVisitante, setEquipoVisitante] = useState(null);
  const [verEquipo, setVerEquipo] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({});
  const [originalEstadisticas, setOriginalEstadisticas] = useState({});
  const [changesDetected, setChangesDetected] = useState(false);
  const [chargingMode, setChargingMode] = useState(false);
  const [jugadoresEnAlta, setJugadoresEnAlta] = useState([]); // Estado para jugadores en alta
  const [loadingApply, setLoadingApply] = useState(false); // Estado para el botón de aplicar cambios
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [resumenPartido, setResumenPartido] = useState({
    local: { goles: 0, amarillas: 0, rojas: 0 },
    visitante: { goles: 0, amarillas: 0, rojas: 0 }
  });
  const [refreshKey, setRefreshKey] = useState(0); // Estado disparador
  const [searchResults, setSearchResults] = useState([]);
  const [searchingDniForId, setSearchingDniForId] = useState(null);

  // Mover la definición de fetchPartido fuera del useEffect para poder llamarla desde otros lugares
  const fetchPartido = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/partidos/${partidoId}`);
      setPartido(response.data);

      const responseEstadisticas = await api.get(`/partidos/${partidoId}/estadisticas`);
      const estadisticasMap = responseEstadisticas.data.reduce((acc, estadistica) => {
        acc[estadistica.jugador_id] = { ...estadistica, presente: true };
        return acc;
      }, {});
      setEstadisticas(estadisticasMap);
      setOriginalEstadisticas(estadisticasMap);

      const equipoLocalId = response.data.equipos[0].id;
      const equipoVisitanteId = response.data.equipos[1].id;
      const equipoLocal = await api.get(`/equipos/${equipoLocalId}`);
      setEquipoLocal(equipoLocal.data);
      const equipoVisitante = await api.get(`/equipos/${equipoVisitanteId}`);
      setEquipoVisitante(equipoVisitante.data);
    } catch (error) {
      console.error('Error fetching partido:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartido();
  }, [partidoId, refreshKey]); // Añadir refreshKey a las dependencias

  const handleInputChange = (jugadorId, field, value) => {
    setEstadisticas((prev) => {
      const updatedStats = { ...prev, [jugadorId]: { ...prev[jugadorId], [field]: value } };
      setChangesDetected(JSON.stringify(updatedStats) !== JSON.stringify(originalEstadisticas));
      return updatedStats;
    });
  };

  const handleConfirmApply = async () => {
    setShowConfirmationModal(false);
    try {
      setLoadingApply(true);
      // Filtrar solo los jugadores presentes y con cambios (o nuevos)
      const estadisticasParaEnviar = Object.keys(estadisticas)
        .filter(jugadorId => estadisticas[jugadorId]?.presente)
        .map((jugadorId) => {
          const estadistica = estadisticas[jugadorId];
          return {
            // Asegurarse de enviar null si no hay valor, aunque la validación previa debería cubrir nro_camiseta
            nro_camiseta: estadistica?.nro_camiseta ? Number.parseInt(estadistica.nro_camiseta) : null, 
            goles: estadistica?.goles ? Number.parseInt(estadistica.goles) : 0,
            asistencias: estadistica?.asistencias ? Number.parseInt(estadistica.asistencias) : 0,
            amarillas: estadistica?.amarillas ? Number.parseInt(estadistica.amarillas) : 0,
            rojas: estadistica?.rojas ? Number.parseInt(estadistica.rojas) : 0,
            partido_id: partidoId,
            jugador_id: parseInt(jugadorId), // Asegurar que el ID es un número
          };
        });

      // Si hay estadísticas para enviar (jugadores presentes)
      if (estadisticasParaEnviar.length > 0) {
        console.log("Enviando estadísticas:", estadisticasParaEnviar);
        // Usar la nueva ruta con partidoId
        await api.post(`/partidos/${partidoId}/estadisticas/multiple`, { estadisticas: estadisticasParaEnviar }); 
      } else {
        // Si no hay jugadores presentes, igual necesitamos llamar al endpoint para que borre los existentes
        console.log("No hay estadísticas de jugadores presentes para enviar. Llamando para posible limpieza.");
        await api.post(`/partidos/${partidoId}/estadisticas/multiple`, { estadisticas: [] }); 
      }

      // Calcular el marcador y el ganador basados SOLO en jugadores presentes
      let marcadorLocal = 0;
      let marcadorVisitante = 0;

      Object.keys(estadisticas).forEach((jugadorId) => {
        const jugador = estadisticas[jugadorId];
        // Sumar solo si está presente
        if (jugador?.presente) { 
          if (equipoLocal.jugadores.some((j) => j.id === parseInt(jugadorId))) {
            marcadorLocal += jugador.goles || 0;
          } else if (equipoVisitante.jugadores.some((j) => j.id === parseInt(jugadorId))) {
            marcadorVisitante += jugador.goles || 0;
          }
        }
      });

      const ganadorId =
        marcadorLocal > marcadorVisitante
          ? equipoLocal.id
          : marcadorVisitante > marcadorLocal
          ? equipoVisitante.id
          : null;

      await api.put(`/partidos/${partidoId}`, {
        marcador_local: marcadorLocal,
        marcador_visitante: marcadorVisitante,
        ganador_id: ganadorId,
        estado: 'Finalizado',
      });

      // Verificar si todos los partidos de la fecha están finalizados
      const fechaId = partido.fecha.id;
      const partidosResponse = await api.get(`/fechas/${fechaId}/partidos`);
      const partidos = partidosResponse.data;

      const todosFinalizados = partidos.every((p) => p.estado === 'Finalizado');

      if (todosFinalizados) {
        await api.put(`/fechas/${fechaId}`, { estado: 'Finalizada' });
        toast.success('Todos los partidos de la fecha están finalizados. La fecha ha sido marcada como Finalizada.');
      }

      setChargingMode(false);
      setOriginalEstadisticas(estadisticas);
      setChangesDetected(false);

      toast.success('Cambios aplicados correctamente');

      // Incrementar el disparador para forzar re-ejecución del useEffect
      setRefreshKey(prevKey => prevKey + 1); 
      
      // Ya no llamamos a fetchPartido() directamente aquí
      // await fetchPartido(); 

    } catch (error) {
      console.error('Error aplicando cambios:', error);
      toast.error('Error aplicando cambios');
    } finally{
      setLoadingApply(false);
    }
  };

  const handleCancelChanges = () => {
    setChargingMode(false);
    setEstadisticas(originalEstadisticas);
    setChangesDetected(false);
  };

  const handleAddJugador = () => {
    const nuevoJugador = {
      id: Date.now(), // ID único temporal
      dni: '',
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
    };
    setJugadoresEnAlta((prev) => [...prev, nuevoJugador]);
  };

  const handleConfirmAlta = async (jugadorId) => {
    const jugador = jugadoresEnAlta.find((j) => j.id === jugadorId);

    if (!jugador) {
      toast.error('Jugador no encontrado.');
      return;
    }

    // Validar campos obligatorios
    if (!jugador.dni || !jugador.nombre || !jugador.apellido || !jugador.fecha_nacimiento) {
      toast.error('Por favor, completa todos los campos del jugador antes de confirmar.');
      return;
    }

    try {
      if (jugador.seleccionado) {
        // Si el jugador fue seleccionado desde el buscador, asociarlo al equipo
        await api.post(`/jugadores/asociar-a-equipo`, {
          jugador_id: jugador.id,
          equipo_id: verEquipo === 1 ? equipoLocal.id : equipoVisitante.id,
        });
        toast.success('Jugador asociado correctamente al equipo.');
        setJugadoresEnAlta((prev) => prev.filter((j) => j.id !== jugadorId));
      } else {
        // Si el jugador fue ingresado manualmente, crearlo y asociarlo al equipo
        const response = await api.post(`/jugadores`, {
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          dni: jugador.dni,
          fecha_nacimiento: jugador.fecha_nacimiento,
          equipo_ids: [verEquipo === 1 ? equipoLocal.id : equipoVisitante.id],
        });
        toast.success('Jugador creado y asociado correctamente al equipo.');
        setJugadoresEnAlta((prev) => prev.filter((j) => j.id !== jugadorId));

        // Actualizar el ID del jugador con el ID real devuelto por el backend
        jugador.id = response.data.jugador.id;
      }

      // Eliminar el jugador de la lista de alta

      // Actualizar la lista de jugadores del equipo
      if (verEquipo === 1) {
        setEquipoLocal((prev) => ({
          ...prev,
          jugadores: [...prev.jugadores, jugador],
        }));
      } else {
        setEquipoVisitante((prev) => ({
          ...prev,
          jugadores: [...prev.jugadores, jugador],
        }));
      }
    } catch (error) {
      console.error('Error al confirmar el alta del jugador:', error);
      toast.error('Error al confirmar el alta del jugador. Verifica los datos e inténtalo nuevamente.');
    }
  };

  const handleCancelAlta = (jugadorId) => {
    // Cancelar el alta del jugador
    setJugadoresEnAlta((prev) => prev.filter((jugador) => jugador.id !== jugadorId));
  };

  const handleOpenConfirmation = () => {
    // Validación: Verificar que todos los jugadores presentes tengan número de camiseta
    const jugadoresPresentes = Object.keys(estadisticas).filter(
      (jugadorId) => estadisticas[jugadorId]?.presente
    );

    const sinCamiseta = jugadoresPresentes.find((jugadorId) => {
      const nroCamiseta = estadisticas[jugadorId]?.nro_camiseta;
      return !nroCamiseta || Number.parseInt(nroCamiseta) <= 0;
    });

    if (sinCamiseta) {
      const jugadorInfo = 
        equipoLocal.jugadores.find(j => j.id === parseInt(sinCamiseta)) || 
        equipoVisitante.jugadores.find(j => j.id === parseInt(sinCamiseta));
      toast.error(
        `El jugador ${jugadorInfo?.nombre || ''} ${jugadorInfo?.apellido || ''} (DNI: ${jugadorInfo?.dni || 'N/A'}) está marcado como presente pero no tiene un número de camiseta válido asignado.`, 
        { autoClose: 5000 }
      );
      return; // Detener si hay un jugador sin camiseta válida
    }

    const nuevoResumen = {
      local: { goles: 0, amarillas: 0, rojas: 0 },
      visitante: { goles: 0, amarillas: 0, rojas: 0 }
    };
  
    Object.keys(estadisticas).forEach((jugadorId) => {
      const stats = estadisticas[jugadorId];
      // Solo sumar si el jugador está presente
      if (stats?.presente) { 
        if (equipoLocal?.jugadores?.some(j => j.id === parseInt(jugadorId))) {
          nuevoResumen.local.goles += stats.goles || 0;
          nuevoResumen.local.amarillas += stats.amarillas || 0;
          nuevoResumen.local.rojas += stats.rojas || 0;
        } else if (equipoVisitante?.jugadores?.some(j => j.id === parseInt(jugadorId))) {
          nuevoResumen.visitante.goles += stats.goles || 0;
          nuevoResumen.visitante.amarillas += stats.amarillas || 0;
          nuevoResumen.visitante.rojas += stats.rojas || 0;
        }
      }
    });
  
    setResumenPartido(nuevoResumen);
    setShowConfirmationModal(true);
  };

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

  const debouncedFetchJugadores = useCallback(debounce(fetchJugadoresByDni, 500), []);

  const handleInputChangeNuevo = (e, id, campo) => {
    const valor = e.target.value;
    setJugadoresEnAlta((prev) =>
      prev.map((jugador) => (jugador.id === id ? { ...jugador, [campo]: valor } : jugador))
    );

    if (campo === 'dni') {
      debouncedFetchJugadores(valor, id);
    } else {
      if (searchingDniForId === id) {
        setSearchResults([]);
        setSearchingDniForId(null);
      }
    }
  };

  const handleSelectPlayer = (selectedJugador, jugadorNuevoId) => {
    setJugadoresEnAlta((prev) =>
      prev.map((jugador) =>
        jugador.id === jugadorNuevoId
          ? {
              ...jugador,
              id: selectedJugador.id,
              dni: selectedJugador.dni || '',
              nombre: selectedJugador.nombre || '',
              apellido: selectedJugador.apellido || '',
              fecha_nacimiento: selectedJugador.fecha_nacimiento || '',
              equipo_actual: selectedJugador.equipos?.[0]?.nombre || 'Sin equipo',
              seleccionado: true,
            }
          : jugador
      )
    );
    setSearchResults([]);
    setSearchingDniForId(null);
  };

  const handleGuardarJugadores = async () => {
    try {
      setLoading(true);

      const jugadoresSeleccionados = jugadoresEnAlta.filter((jugador) => jugador.seleccionado);
      const jugadoresManuales = jugadoresEnAlta.filter((jugador) => !jugador.seleccionado);

      if (jugadoresSeleccionados.length > 0) {
        for (const jugador of jugadoresSeleccionados) {
          if (!jugador.id || typeof jugador.id !== 'number') {
            console.error('Jugador ID no válido:', jugador.id);
            continue;
          }

          await api.post(`/jugadores/asociar-a-equipo`, {
            jugador_id: jugador.id,
            equipo_id: verEquipo === 1 ? equipoLocal.id : equipoVisitante.id,
          });
        }
      }

      if (jugadoresManuales.length > 0) {
        for (const jugador of jugadoresManuales) {
          await api.post(`/jugadores`, {
            nombre: jugador.nombre,
            apellido: jugador.apellido,
            dni: jugador.dni,
            fecha_nacimiento: jugador.fecha_nacimiento,
            equipo_ids: [verEquipo === 1 ? equipoLocal.id : equipoVisitante.id],
          });
        }
      }

      toast.success('Jugadores guardados exitosamente.');
      setJugadoresEnAlta([]);
      fetchPartido(); // Actualizar la lista de jugadores
    } catch (error) {
      console.error('Error al guardar jugadores:', error);
      toast.error('Ocurrió un error al guardar los jugadores.');
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

  if (!partido || !equipoLocal || !equipoVisitante) {
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
    <div className="min-h-screen flex flex-col justify-start bg-gray-100 font-inter">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <BackButton />
        <h1 className=" font-bold mb-4 text-2xl">Resultado Partido</h1>
        <div className='w-full  flex'>
        <div className="bg-white w-1/2 rounded-[8px] shadow-md p-4 mb-6">
          <h2 className="text-2xl font-bold text-center mb-3 text-blue-600">
            {partido.equipos[0].nombre} <span className="text-gray-500">vs</span> {partido.equipos[1].nombre}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-[8px]">
              <p className="text-sm text-gray-500 mb-1">Fecha</p>
              <p className="font-medium">{partido.fecha.nombre}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-[8px]">
              <p className="text-sm text-gray-500 mb-1">Horario</p>
              <p className="font-medium">
                {partido.horario ? `${partido.horario.hora_inicio} - ${partido.horario.hora_fin}` : "Indefinido"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-[8px]">
              <p className="text-sm text-gray-500 mb-1">Cancha</p>
              <p className="font-medium">
                {partido.cancha ? `${partido.cancha.nro} - ${partido.cancha.tipo_cancha}` : "Indefinida"}
              </p>
            </div>
          </div>
        </div>
        </div>
        <div className="mt-2">
          <div className="w-full flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setVerEquipo(1)}
                className={`rounded-[8px] px-4 py-2.5 font-medium transition-colors shadow-sm ${
                  verEquipo === 1
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {equipoLocal.nombre}
              </button>
              <button
                onClick={() => setVerEquipo(2)}
                className={`rounded-[8px] px-4 py-2.5 font-medium transition-colors shadow-sm ${
                  verEquipo === 2
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {equipoVisitante.nombre}
              </button>
            </div>
            <div>
              <button
                onClick={handleAddJugador}
                disabled={jugadoresEnAlta.length > 0}
                className="rounded-[8px] px-4 py-2.5 bg-black text-white font-medium hover:bg-gray-900 transition-colors shadow-sm flex items-center gap-1"
              >
                <span className="text-lg">+</span> Agregar Jugador
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-[8px] shadow">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre y Apellido
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Nacimiento
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numero Camiseta
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Goles</th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistencias
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amarillas
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rojas</th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presente
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                {jugadoresEnAlta.map((jugador) => (
                  <tr key={jugador.id}>
                    <td className="p-2 text-center">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="DNI"
                          value={jugador.dni}
                          onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'dni')}
                          className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                          autoComplete="off"
                        />
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
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={jugador.nombre}
                        onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'nombre')}
                        className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        placeholder="Apellido"
                        value={jugador.apellido}
                        onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'apellido')}
                        className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="date"
                        placeholder="Fecha de Nacimiento"
                        value={jugador.fecha_nacimiento}
                        onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'fecha_nacimiento')}
                        className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                      />
                    </td>
                    <td className="p-2 text-center">{/* Espacio vacío para mantener la estructura de la tabla */}</td>
                    <td className="p-2 text-center">{/* Espacio vacío para mantener la estructura de la tabla */}</td>
                    <td className="p-2 text-center">{/* Espacio vacío para mantener la estructura de la tabla */}</td>
                    <td className="p-2 text-center">{/* Espacio vacío para mantener la estructura de la tabla */}</td>
                    <td className="p-2 text-center">{/* Espacio vacío para mantener la estructura de la tabla */}</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleConfirmAlta(jugador.id)}
                          className="bg-green-600 text-white rounded-[6px] p-1.5 hover:bg-green-700 transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleCancelAlta(jugador.id)}
                          className="bg-red-600 text-white rounded-[6px] p-1.5 hover:bg-red-700 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {verEquipo === 1
                  ? equipoLocal.jugadores.map((jugador) => (
                      <tr key={jugador.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 text-center">{jugador.dni}</td>
                        <td className="p-2 text-center">
                          {jugador.nombre} {jugador.apellido}
                        </td>
                        <td className="p-2 text-center">{jugador.fecha_nacimiento}</td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.nro_camiseta || ''}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "nro_camiseta", e.target.value ? Number.parseInt(e.target.value) : null)
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.nro_camiseta || "-"
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.goles ?? 0}
                              onChange={(e) => handleInputChange(jugador.id, "goles", Number.parseInt(e.target.value) || 0)}
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.goles ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.asistencias ?? 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "asistencias", Number.parseInt(e.target.value) || 0)
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.asistencias ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.amarillas ?? 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "amarillas", Number.parseInt(e.target.value) || 0)
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.amarillas ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.rojas ?? 0}
                              onChange={(e) => handleInputChange(jugador.id, "rojas", Number.parseInt(e.target.value) || 0)}
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.rojas ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!estadisticas[jugador.id]?.presente}
                            disabled={!chargingMode}
                            onChange={(e) => {
                              const isPresente = e.target.checked;
                              if (isPresente && !estadisticas[jugador.id]) {
                                setEstadisticas((prev) => ({
                                  ...prev,
                                  [jugador.id]: {
                                    nro_camiseta: null,
                                    goles: 0,
                                    asistencias: 0,
                                    amarillas: 0,
                                    rojas: 0,
                                    partido_id: partidoId,
                                    jugador_id: jugador.id,
                                    presente: true,
                                  },
                                }));
                              } else {
                                handleInputChange(jugador.id, "presente", isPresente);
                              }
                            }}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {/* Ya no hay botones de acción aquí */}
                        </td>
                      </tr>
                    ))
                  : equipoVisitante.jugadores.map((jugador) => (
                      <tr key={jugador.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 text-center">{jugador.dni}</td>
                        <td className="p-2 text-center">
                          {jugador.nombre} {jugador.apellido}
                        </td>
                        <td className="p-2 text-center">{jugador.fecha_nacimiento}</td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.nro_camiseta || ''}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "nro_camiseta", e.target.value ? Number.parseInt(e.target.value) : null)
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.nro_camiseta || "-"
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.goles ?? 0}
                              onChange={(e) => handleInputChange(jugador.id, "goles", Number.parseInt(e.target.value) || 0)}
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.goles ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.asistencias ?? 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "asistencias", Number.parseInt(e.target.value) || 0)
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.asistencias ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.amarillas ?? 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "amarillas", Number.parseInt(e.target.value) || 0)
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.amarillas ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.rojas ?? 0}
                              onChange={(e) => handleInputChange(jugador.id, "rojas", Number.parseInt(e.target.value) || 0)}
                              className="w-full text-center border border-gray-300 rounded p-1"
                              min="0"
                            />
                          ) : (
                            estadisticas[jugador.id]?.rojas ?? 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!estadisticas[jugador.id]?.presente}
                            disabled={!chargingMode}
                            onChange={(e) => {
                              const isPresente = e.target.checked;
                              if (isPresente && !estadisticas[jugador.id]) {
                                setEstadisticas((prev) => ({
                                  ...prev,
                                  [jugador.id]: {
                                    nro_camiseta: null,
                                    goles: 0,
                                    asistencias: 0,
                                    amarillas: 0,
                                    rojas: 0,
                                    partido_id: partidoId,
                                    jugador_id: jugador.id,
                                    presente: true,
                                  },
                                }));
                              } else {
                                handleInputChange(jugador.id, "presente", isPresente);
                              }
                            }}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {/* Ya no hay botones de acción aquí */}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-6 gap-3">
            <div className='flex flex-col justify-center gap-2'>
            <div className="flex items-center justify-start px-4">
              <Info className="w-4 h-4 mr-2" />
              <p className="text-gray-500 text-sm">
                Solo los jugadores <span className="font-bold">marcados como presente</span> seran tenidos en cuenta para el marcador final
              </p>
            </div>
            <div className="flex items-center justify-start px-4">
              <Trash className="w-4 h-4 mr-2" />
              <p className="text-gray-500 text-sm">
                Para eliminar la estadistica de un jugador, <span className="font-bold">desmarque el checkbox de presente</span>
              </p>
            </div>
            </div>
            <div className="flex gap-3">
              {!chargingMode && Object.keys(originalEstadisticas).length === 0 && (
                <button
                  onClick={() => setChargingMode(true)}
                  className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-[8px] shadow-sm hover:bg-green-700 transition-colors"
                  disabled={jugadoresEnAlta.length > 0}
                >
                  Cargar Resultados
                </button>
              )}
              {!chargingMode && Object.keys(originalEstadisticas).length > 0 && (
                <button
                  onClick={() => setChargingMode(true)} 
                  className="px-4 py-2.5 bg-yellow-500 text-white font-medium rounded-[8px] shadow-sm hover:bg-yellow-600 transition-colors"
                  disabled={jugadoresEnAlta.length > 0}
                >
                  Editar Resultados
                </button>
              )}
              {chargingMode && changesDetected && (
                <button
                  onClick={handleOpenConfirmation}
                  disabled={loadingApply}
                  className={`px-4 py-2.5 text-white font-medium rounded-[8px] shadow-sm transition-colors ${loadingApply ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {loadingApply ? "Aplicando Cambios..." : "Aplicar Cambios"}
                </button>
              )}
              {chargingMode && (
                <button
                  onClick={handleCancelChanges}
                  className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-[8px] shadow-sm hover:bg-red-700 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
        <ResultadoModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmApply}
          resumen={resumenPartido}
          equipoLocalNombre={equipoLocal?.nombre || ''}
          equipoVisitanteNombre={equipoVisitante?.nombre || ''}
          loading={loadingApply}
        />
      </main>
      <Footer />
    </div>
  );
}