import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify'; // Importar react-toastify
import ResultadoModal from '../Modals/ResultadoModal';
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal';

export default function ResultadoPartido() {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  const [partido, setPartido] = useState(null);
  const [equipoLocal, setEquipoLocal] = useState(null);
  const [equipoVisitante, setEquipoVisitante] = useState(null);
  const [verEquipo, setVerEquipo] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [originalEstadisticas, setOriginalEstadisticas] = useState({});
  const [changesDetected, setChangesDetected] = useState(false);
  const [chargingMode, setChargingMode] = useState(false);
  const [jugadoresEnAlta, setJugadoresEnAlta] = useState([]); // Estado para jugadores en alta
  const [loadingApply, setLoadingApply] = useState(false); // Estado para el botón de aplicar cambios
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJugadorId, setSelectedJugadorId] = useState(null);
  const [resumenPartido, setResumenPartido] = useState({
    local: { goles: 0, amarillas: 0, rojas: 0 },
    visitante: { goles: 0, amarillas: 0, rojas: 0 }
  });

  useEffect(() => {
    const fetchPartido = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/partidos/${partidoId}`);
        setPartido(response.data);

        const responseEstadisticas = await api.get(`/partidos/${partidoId}/estadisticas`);
        const estadisticasMap = responseEstadisticas.data.reduce((acc, estadistica) => {
          acc[estadistica.jugador_id] = estadistica;
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
    fetchPartido();
  }, [partidoId]);

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
      // Filtrar solo los jugadores con cambios
      const updatedStats = Object.keys(estadisticas)
        .map((jugadorId) => {
          const estadistica = estadisticas[jugadorId];
          const original = originalEstadisticas[jugadorId] || {};

          return {
            nro_camiseta: estadistica?.nro_camiseta ?? null,
            goles: estadistica?.goles ?? 0,
            asistencias: estadistica?.asistencias ?? 0,
            amarillas: estadistica?.amarillas ?? 0,
            rojas: estadistica?.rojas ?? 0,
            partido_id: partidoId,
            jugador_id: jugadorId,
          };
        })
        .filter(
          (estadistica, index) =>
            JSON.stringify(estadistica) !== JSON.stringify(Object.values(originalEstadisticas)[index])
        );

      if (updatedStats.length > 0) {
        await Promise.all(updatedStats.map((estadistica) => api.post('/estadisticas', estadistica)));
      }

      // Calcular el marcador y el ganador
      let marcadorLocal = 0;
      let marcadorVisitante = 0;

      Object.keys(estadisticas).forEach((jugadorId) => {
        const jugador = estadisticas[jugadorId];
        if (equipoLocal.jugadores.some((j) => j.id === parseInt(jugadorId))) {
          marcadorLocal += jugador.goles || 0;
        } else if (equipoVisitante.jugadores.some((j) => j.id === parseInt(jugadorId))) {
          marcadorVisitante += jugador.goles || 0;
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
    } catch (error) {
      console.error('Error aplicando cambios:', error);
      toast.error('Error aplicando cambios');
    } finally{
      setLoadingApply(false);
    }
  };

  const handleEditClick = async (estadisticaId, jugadorId) => {
    try {
      const updatedData = estadisticas[jugadorId];
      if (!updatedData) {
        console.error('No hay datos para actualizar o crear');
        return;
      }

      let response;
      if (estadisticaId) {
        // Si existe un ID de estadística, realiza un PUT para actualizar
        response = await api.put(`/estadisticas/${estadisticaId}`, updatedData);
        const updatedEstadistica = response.data.estadistica;

        // Actualiza el estado con la estadística actualizada
        setEstadisticas((prevEstadisticas) => ({
          ...prevEstadisticas,
          [updatedEstadistica.jugador_id]: updatedEstadistica,
        }));
      } else if (!originalEstadisticas[jugadorId]) {
        // Si no existe un ID de estadística y no está en las estadísticas originales, realiza un POST
        response = await api.post('/estadisticas', updatedData);
        const createdEstadistica = response.data.estadistica;

        // Actualiza el estado con la nueva estadística creada
        setEstadisticas((prevEstadisticas) => ({
          ...prevEstadisticas,
          [createdEstadistica.jugador_id]: createdEstadistica,
        }));
      } else {
        console.warn('La estadística ya existe, no se realizará un POST.');
      }

      // Calcular el marcador y el ganador
      let marcadorLocal = 0;
      let marcadorVisitante = 0;

      Object.keys(estadisticas).forEach((id) => {
        const jugador = estadisticas[id];
        if (equipoLocal.jugadores.some((j) => j.id === parseInt(id))) {
          marcadorLocal += jugador.goles || 0;
        } else if (equipoVisitante.jugadores.some((j) => j.id === parseInt(id))) {
          marcadorVisitante += jugador.goles || 0;
        }
      });

      const ganadorId =
        marcadorLocal > marcadorVisitante
          ? equipoLocal.id
          : marcadorVisitante > marcadorLocal
          ? equipoVisitante.id
          : null;

      // Actualizar el partido con el nuevo marcador y ganador
      await api.put(`/partidos/${partidoId}`, {
        marcador_local: marcadorLocal,
        marcador_visitante: marcadorVisitante,
        ganador_id: ganadorId,
      });

      // Salir del modo de edición para el jugador
      setEditMode((prevEditMode) => ({
        ...prevEditMode,
        [jugadorId]: false,
      }));

      setChangesDetected(false);
      toast.success('Estadística y marcador actualizados correctamente');
    } catch (error) {
      console.error('Error al guardar la estadística:', error);
      toast.error('Error al guardar la estadística');
    }
  };

  const toggleEditMode = (jugadorId) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [jugadorId]: !prevEditMode[jugadorId],
    }));

    if (!estadisticas[jugadorId]) {
      setEstadisticas((prevEstadisticas) => ({
        ...prevEstadisticas,
        [jugadorId]: {
          nro_camiseta: null,
          goles: 0,
          asistencias: 0,
          amarillas: 0,
          rojas: 0,
          partido_id: partidoId,
          jugador_id: jugadorId,
        },
      }));
    }
  };

  const handleCancelEdit = (jugadorId) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [jugadorId]: false,
    }));
    setChangesDetected(false);
  };

  const handleCancelChanges = () => {
    setChargingMode(false);
    // Restablece los cambios detectados y vuelve al estado original
    setEstadisticas(originalEstadisticas); // Restablece las estadísticas originales
    setChangesDetected(false); // Marca que no hay cambios pendientes
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

    if (!jugador || !jugador.nombre || !jugador.apellido || !jugador.dni || !jugador.fecha_nacimiento) {
      toast.error('Por favor, completa todos los campos del jugador antes de confirmar.');
      return;
    }

    try {
      const response = await api.post(`/equipos/${verEquipo === 1 ? equipoLocal.id : equipoVisitante.id}/jugadores/multiple`, {
        jugadores: [jugador],
        equipo_id: verEquipo === 1 ? equipoLocal.id : equipoVisitante.id,
      });

      if (response.status === 201) {
        toast.success('Jugador agregado correctamente');
        setJugadoresEnAlta((prev) => prev.filter((j) => j.id !== jugadorId));

        // Actualizar la lista de jugadores del equipo
        if (verEquipo === 1) {
          setEquipoLocal((prev) => ({
            ...prev,
            jugadores: [...prev.jugadores, ...response.data.jugadores],
          }));
        } else {
          setEquipoVisitante((prev) => ({
            ...prev,
            jugadores: [...prev.jugadores, ...response.data.jugadores],
          }));
        }
      }
    } catch (error) {
      console.error('Error al agregar el jugador:', error);
      toast.error('Error al agregar el jugador. Verifica los datos e inténtalo nuevamente.');
    }
  };

  const handleCancelAlta = (jugadorId) => {
    // Cancelar el alta del jugador
    setJugadoresEnAlta((prev) => prev.filter((jugador) => jugador.id !== jugadorId));
  };

  const handleConfirmDelete = async () => {
    try {
      const estadisticaId = estadisticas[selectedJugadorId]?.id;
  
      if (!estadisticaId) {
        toast.error('No se encontró una estadística para eliminar.');
        return;
      }
  
      // Llamada al backend para eliminar la estadística
      await api.delete(`/estadisticas/${estadisticaId}`);
  
      // Actualizar el estado local eliminando la estadística del jugador
      setEstadisticas((prev) => {
        const updatedStats = { ...prev };
        delete updatedStats[selectedJugadorId];
        return updatedStats;
      });
  
      toast.success('Estadística eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar la estadística:', error);
      toast.error('Error al eliminar la estadística.');
    } finally {
      setShowDeleteModal(false); // Cerrar el modal
      setSelectedJugadorId(null); // Limpiar el jugador seleccionado
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

  const handleOpenConfirmation = () => {
    const nuevoResumen = {
      local: { goles: 0, amarillas: 0, rojas: 0 },
      visitante: { goles: 0, amarillas: 0, rojas: 0 }
    };
  
    Object.keys(estadisticas).forEach((jugadorId) => {
      const stats = estadisticas[jugadorId];
      if (equipoLocal?.jugadores?.some(j => j.id === parseInt(jugadorId))) {
        nuevoResumen.local.goles += stats.goles || 0;
        nuevoResumen.local.amarillas += stats.amarillas || 0;
        nuevoResumen.local.rojas += stats.rojas || 0;
      } else if (equipoVisitante?.jugadores?.some(j => j.id === parseInt(jugadorId))) {
        nuevoResumen.visitante.goles += stats.goles || 0;
        nuevoResumen.visitante.amarillas += stats.amarillas || 0;
        nuevoResumen.visitante.rojas += stats.rojas || 0;
      }
    });
  
    setResumenPartido(nuevoResumen);
    setShowConfirmationModal(true);
  };


  

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
                      <input
                        type="text"
                        placeholder="DNI"
                        value={jugador.dni}
                        onChange={(e) =>
                          setJugadoresEnAlta((prev) =>
                            prev.map((j) => (j.id === jugador.id ? { ...j, dni: e.target.value } : j)),
                          )
                        }
                        className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex space-x-1">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={jugador.nombre}
                          onChange={(e) =>
                            setJugadoresEnAlta((prev) =>
                              prev.map((j) => (j.id === jugador.id ? { ...j, nombre: e.target.value } : j)),
                            )
                          }
                          className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                        />
                        <input
                          type="text"
                          placeholder="Apellido"
                          value={jugador.apellido}
                          onChange={(e) =>
                            setJugadoresEnAlta((prev) =>
                              prev.map((j) => (j.id === jugador.id ? { ...j, apellido: e.target.value } : j)),
                            )
                          }
                          className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                        />
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="date"
                        placeholder="Fecha de Nacimiento"
                        value={jugador.fecha_nacimiento}
                        onChange={(e) =>
                          setJugadoresEnAlta((prev) =>
                            prev.map((j) => (j.id === jugador.id ? { ...j, fecha_nacimiento: e.target.value } : j)),
                          )
                        }
                        className="w-full text-center border border-gray-300 rounded-[6px] p-1"
                      />
                    </td>
                    <td className="p-2 text-center">{/* Espacio vacío para mantener la estructura de la tabla */}</td>
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
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.nro_camiseta || null}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "nro_camiseta", Number.parseInt(e.target.value))
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.nro_camiseta || "-"
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.goles || 0}
                              onChange={(e) => handleInputChange(jugador.id, "goles", Number.parseInt(e.target.value))}
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.goles || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.asistencias || 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "asistencias", Number.parseInt(e.target.value))
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.asistencias || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.amarillas || 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "amarillas", Number.parseInt(e.target.value))
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.amarillas || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.rojas || 0}
                              onChange={(e) => handleInputChange(jugador.id, "rojas", Number.parseInt(e.target.value))}
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.rojas || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={estadisticas[jugador.id]?.presente || false} // Marcado si tiene estadística asociada
                            onChange={(e) => handleInputChange(jugador.id, "presente", e.target.checked)}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] ? (
                            <div className="flex">
                              <button
                                onClick={() => handleEditClick(estadisticas[jugador.id].id, jugador.id)}
                                className="bg-green-600 text-white rounded-[6px] px-2 py-1 text-sm hover:bg-green-700 transition-colors"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => handleCancelEdit(jugador.id)}
                                className="bg-red-600 text-white rounded-[6px] px-2 py-1 ml-2 text-sm hover:bg-red-700 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            estadisticas[jugador.id] && Object.values(estadisticas[jugador.id]).some((value) => value > 0) && (
                              <div className="flex justify-center space-x-2">
                                {/* Botón Editar */}
                                <button
                                  onClick={() => toggleEditMode(jugador.id)}
                                  disabled={chargingMode}
                                  className="bg-blue-600 text-white rounded-[8px] px-3 py-1 text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Editar
                                </button>

                                {/* Botón Eliminar */}
                                <button
                                  onClick={() => {
                                    setSelectedJugadorId(jugador.id); // Guardar el jugador seleccionado
                                    setShowDeleteModal(true); // Mostrar el modal
                                  }}
                                  disabled={chargingMode}
                                  className="bg-red-600 text-white rounded-[8px] px-3 py-1 text-sm hover:bg-red-700 transition-colors"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )
                          )}
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
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.nro_camiseta || null}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "nro_camiseta", Number.parseInt(e.target.value))
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.nro_camiseta || "-"
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.goles || 0}
                              onChange={(e) => handleInputChange(jugador.id, "goles", Number.parseInt(e.target.value))}
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.goles || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.asistencias || 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "asistencias", Number.parseInt(e.target.value))
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.asistencias || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.amarillas || 0}
                              onChange={(e) =>
                                handleInputChange(jugador.id, "amarillas", Number.parseInt(e.target.value))
                              }
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.amarillas || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {editMode[jugador.id] || chargingMode ? (
                            <input
                              type="number"
                              value={estadisticas[jugador.id]?.rojas || 0}
                              onChange={(e) => handleInputChange(jugador.id, "rojas", Number.parseInt(e.target.value))}
                              className="w-full text-center border border-gray-300 rounded p-1"
                            />
                          ) : (
                            estadisticas[jugador.id]?.rojas || 0
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={estadisticas[jugador.id]?.presente || false} // Marcado si tiene estadística asociada
                            onChange={(e) => handleInputChange(jugador.id, "presente", e.target.checked)}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2 text-center w-fit">
                          {editMode[jugador.id] ? (
                            <div className="flex">
                              <button
                                onClick={() => handleEditClick(estadisticas[jugador.id].id, jugador.id)}
                                className="bg-green-600 text-white rounded-[6px] px-2 py-1 text-sm hover:bg-green-700 transition-colors"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => handleCancelEdit(jugador.id)}
                                className="bg-red-600 text-white rounded-[6px] px-2 py-1 ml-2 text-sm hover:bg-red-700 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            estadisticas[jugador.id] && Object.values(estadisticas[jugador.id]).some((value) => value > 0) && (
                              <div className="flex justify-center space-x-2">
                                {/* Botón Editar */}
                                <button
                                  onClick={() => toggleEditMode(jugador.id)}
                                  disabled={chargingMode}
                                  className="bg-blue-600 text-white rounded-[8px] px-3 py-1 text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Editar
                                </button>

                                {/* Botón Eliminar */}
                                <button
                                  onClick={() => {
                                    setSelectedJugadorId(jugador.id); // Guardar el jugador seleccionado
                                    setShowDeleteModal(true); // Mostrar el modal
                                  }}
                                  disabled={chargingMode}
                                  className="bg-red-600 text-white rounded-[8px] px-3 py-1 text-sm hover:bg-red-700 transition-colors"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6 gap-3">
            {!chargingMode && Object.keys(estadisticas).length === 0 && (
              <button
                onClick={() => setChargingMode(true)}
                className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-[8px] shadow-sm hover:bg-green-700 transition-colors"
                disabled={jugadoresEnAlta.length > 0}
              >
                Cargar Resultados
              </button>
            )}
            {chargingMode && changesDetected && (
              <button
                onClick={handleOpenConfirmation}
                disabled={loadingApply}
                className={`px-4 py-2.5 text-white font-medium rounded-[8px] shadow-sm transition-colors ${
                  loadingApply ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
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
        <ResultadoModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmApply}
          resumen={resumenPartido}
          equipoLocalNombre={equipoLocal?.nombre || ''}
          equipoVisitanteNombre={equipoVisitante?.nombre || ''}
          loading={loadingApply}
        />
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          loading={loading}
        />
      </main>
      <Footer />
    </div>
  );
}