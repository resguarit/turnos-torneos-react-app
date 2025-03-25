import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';

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

  const handleApplyChanges = async () => {
    try {
        // Filtrar solo los jugadores con cambios
        const updatedStats = Object.keys(estadisticas).map((jugadorId) => {
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
        }).filter((estadistica, index) => 
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
        });

        setChargingMode(false);
        setOriginalEstadisticas(estadisticas);
        setChangesDetected(false);

        alert('Cambios aplicados correctamente');
    } catch (error) {
        console.error('Error aplicando cambios:', error);
        alert('Error aplicando cambios');
    }
};

const handleEditClick = async (estadisticaId, jugadorId) => {
  try {
    const updatedData = estadisticas[jugadorId];
    if (!updatedData) {
      console.error('No data to update');
      return;
    }

    if (estadisticaId) {
      const response = await api.put(`/estadisticas/${estadisticaId}`, updatedData);
      const updatedEstadistica = response.data.estadistica;
      setEstadisticas((prevEstadisticas) => ({
        ...prevEstadisticas,
        [updatedEstadistica.jugador_id]: updatedEstadistica,
      }));
    } else {
      const response = await api.post('/estadisticas', updatedData);
      const createdEstadistica = response.data.estadistica;
      setEstadisticas((prevEstadisticas) => ({
        ...prevEstadisticas,
        [createdEstadistica.jugador_id]: createdEstadistica,
      }));
    }

    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [jugadorId]: false,
    }));
    setChangesDetected(false);
    alert('Estadística actualizada correctamente');
  } catch (error) {
    console.error('Error updating estadistica:', error);
    alert('Error updating estadistica');
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
    setEstadisticas(originalEstadisticas);
    setChargingMode(false);
    setChangesDetected(false);
  };

  const handleCancelChanges = () => {
    // Restablece los cambios detectados y vuelve al estado original
    setEstadisticas(originalEstadisticas); // Restablece las estadísticas originales
    setChangesDetected(false); // Marca que no hay cambios pendientes
    setChargingMode(false); // Sale del modo de edición
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
        <h2>{partido.equipos[0].nombre} vs {partido.equipos[1].nombre}</h2>
        <p>{partido.fecha.nombre}</p>
        <p>Horario: {partido.horario ? `${partido.horario.hora_inicio} - ${partido.horario.hora_fin}` : "Indefinido"}</p>
        <p>Cancha: {partido.cancha ? `${partido.cancha.nro} - ${partido.cancha.tipo_cancha}` : "Indefinida"}</p>
        <div>
          <div className="space-x-4">
            <button
              onClick={() => setVerEquipo(1)}
              className={`rounded-[8px] p-2 ${verEquipo === 1 ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            >
              {equipoLocal.nombre}
            </button>
            <button
              onClick={() => setVerEquipo(2)}
              className={`rounded-[8px] p-2 ${verEquipo === 2 ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            >
              {equipoVisitante.nombre}
            </button>
          </div>
          <table className="w-full bg-white rounded-[8px] mt-4 p-1">
            <thead>
              <tr className="p-1">
                <td className="p-2 text-center font-sans font-semibold">DNI</td>
                <td className="p-2 text-center font-sans font-semibold">Nombre y Apellido</td>
                <td className="p-2 text-center font-sans font-semibold">Fecha Nacimiento</td>
                <td className="p-2 text-center font-sans font-semibold">Numero Camiseta</td>
                <td className="p-2 text-center font-sans font-semibold">Goles</td>
                <td className="p-2 text-center font-sans font-semibold">Asistencias</td>
                <td className="p-2 text-center font-sans font-semibold">Amarillas</td>
                <td className="p-2 text-center font-sans font-semibold">Rojas</td>
                <td className="p-2 text-center font-sans font-semibold">Presente</td>
                <td className="p-2 text-center font-sans font-semibold">Acción</td>
              </tr>
            </thead>
            <tbody>
  {verEquipo === 1 ? equipoLocal.jugadores.map((jugador) => (
    <tr key={jugador.id} className="p-1">
      <td className="p-2 text-center">{jugador.dni}</td>
      <td className="p-2 text-center">{jugador.nombre} {jugador.apellido}</td>
      <td className="p-2 text-center">{jugador.fecha_nacimiento}</td>
      <td className="p-2 text-center">
        {editMode[jugador.id] || chargingMode ? (
          <input
            type="number"
            value={estadisticas[jugador.id]?.nro_camiseta || null}
            onChange={(e) => handleInputChange(jugador.id, 'nro_camiseta', parseInt(e.target.value))}
            className="w-full text-center"
          />
        ) : (
          estadisticas[jugador.id]?.nro_camiseta || '-'
        )}
      </td>
      <td className="p-2 text-center">
        {editMode[jugador.id] || chargingMode ? (
          <input
            type="number"
            value={estadisticas[jugador.id]?.goles || 0}
            onChange={(e) => handleInputChange(jugador.id, 'goles', parseInt(e.target.value))}
            className="w-full text-center"
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
            onChange={(e) => handleInputChange(jugador.id, 'asistencias', parseInt(e.target.value))}
            className="w-full text-center"
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
            onChange={(e) => handleInputChange(jugador.id, 'amarillas', parseInt(e.target.value))}
            className="w-full text-center"
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
            onChange={(e) => handleInputChange(jugador.id, 'rojas', parseInt(e.target.value))}
            className="w-full text-center"
          />
        ) : (
          estadisticas[jugador.id]?.rojas || 0
        )}
      </td>
      <td className="p-2 text-center">
        <input
          type="checkbox"
          checked={estadisticas[jugador.id]?.presente || false}
          onChange={(e) => handleInputChange(jugador.id, 'presente', e.target.checked)}
          className="w-full text-center"
        />
      </td>
      <td className="p-2 text-center">
        {editMode[jugador.id] ? (
          <div className="flex">
          <button onClick={() => handleEditClick(estadisticas[jugador.id].id, jugador.id)} className="bg-green-500 text-white rounded-[8px] p-1 ">Guardar</button>
          <button onClick={() => handleCancelEdit(jugador.id)} className="bg-red-500 text-white rounded-[8px] p-1 ml-2 ">Cancelar</button>
        </ div>
        ) : (
          <button onClick={() => toggleEditMode(jugador.id)} className="bg-blue-500 text-white rounded-[8px] p-1">Editar</button>
        )}
      </td>
    </tr>
  )) : equipoVisitante.jugadores.map((jugador) => (
    <tr key={jugador.id} className="p-1">
      <td className="p-2 text-center">{jugador.dni}</td>
      <td className="p-2 text-center">{jugador.nombre} {jugador.apellido}</td>
      <td className="p-2 text-center">{jugador.fecha_nacimiento}</td>
      <td className="p-2 text-center">
        {editMode[jugador.id] || chargingMode ? (
          <input
            type="number"
            value={estadisticas[jugador.id]?.nro_camiseta || null}
            onChange={(e) => handleInputChange(jugador.id, 'nro_camiseta', parseInt(e.target.value))}
            className="w-full text-center"
          />
        ) : (
          estadisticas[jugador.id]?.nro_camiseta || '-'
        )}
      </td>
      <td className="p-2 text-center">
        {editMode[jugador.id] || chargingMode ? (
          <input
            type="number"
            value={estadisticas[jugador.id]?.goles || 0}
            onChange={(e) => handleInputChange(jugador.id, 'goles', parseInt(e.target.value))}
            className="w-full text-center"
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
            onChange={(e) => handleInputChange(jugador.id, 'asistencias', parseInt(e.target.value))}
            className="w-full text-center"
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
            onChange={(e) => handleInputChange(jugador.id, 'amarillas', parseInt(e.target.value))}
            className="w-full text-center"
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
            onChange={(e) => handleInputChange(jugador.id, 'rojas', parseInt(e.target.value))}
            className="w-full text-center"
          />
        ) : (
          estadisticas[jugador.id]?.rojas || 0
        )}
      </td>
      <td className="p-2 text-center">
        <input
          type="checkbox"
          checked={estadisticas[jugador.id]?.presente || false}
          onChange={(e) => handleInputChange(jugador.id, 'presente', e.target.checked)}
          className="w-full text-center"
        />
      </td>
      <td className="p-2 text-center w-fit">
        {editMode[jugador.id] ? (
          <div className="flex">
          <button onClick={() => handleEditClick(estadisticas[jugador.id].id, jugador.id)} className="bg-green-500 text-white rounded-[8px] p-1 text-xs">Guardar</button>
          <button onClick={() => handleCancelEdit(jugador.id)} className="bg-red-500 text-white rounded-[8px] p-1 ml-2 text-xs">Cancelar</button>
        </ div>
        ) : (
          <button onClick={() => toggleEditMode(jugador.id)} className="bg-blue-500 text-white rounded-[8px] p-1">Editar</button>
        )}
      </td>
    </tr>
  ))}
</tbody>
          </table>
          <div className="flex justify-end mt-4 space-x-2">
          {!chargingMode &&  Object.keys(estadisticas).length === 0 && <button onClick={() => setChargingMode(true)} className="bg-green-500 text-white p-2">Cargar Resultados</button>}
          {chargingMode && changesDetected && <button onClick={handleApplyChanges} className="bg-blue-500 text-white p-2">Aplicar Cambios</button>}
          {chargingMode  && <button onClick={handleCancelChanges} className="bg-red-500 text-white p-2">Cancelar</button>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
