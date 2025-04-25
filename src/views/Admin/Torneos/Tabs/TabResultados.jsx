import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { TablaPuntaje } from '../Tablas/TablaPuntaje';
import { TablaProximaFecha } from '../Tablas/TablaProximaFecha';
import { TablasEstadisticasJugadores } from '../Tablas/TablasEstadisticasJugadores';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify'; // Import toast

export function TabResultados({ zonaId, abortController }) { // Add abortController prop
  const [tablaPuntaje, setTablaPuntaje] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [amonestados, setAmonestados] = useState([]);
  const [expulsados, setExpulsados] = useState([]);
  const [proximaFecha, setProximaFecha] = useState(null);
  const [partidosProximaFecha, setPartidosProximaFecha] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // --- Fetch League Standings (Tabla de Puntaje) ---
        const tablaResponse = await api.get(`/zonas/${zonaId}/estadisticas-liga`, {
          signal: abortController?.signal
        });
        if (tablaResponse.status === 200 && Array.isArray(tablaResponse.data)) {
          setTablaPuntaje(tablaResponse.data);
        } else {
          console.warn('Respuesta inválida para estadísticas de liga.');
          setTablaPuntaje([]);
          toast.error('No se pudieron cargar las estadísticas de la liga.');
        }

        // --- Fetch Player Statistics (Goleadores, Amonestados, Expulsados) ---
        // Traer todos los jugadores de la zona
        const jugadoresResponse = await api.get(`/jugadores/zona/${zonaId}`, {
          signal: abortController?.signal
        });
        const jugadores = jugadoresResponse.data;

        // Crear un mapa para relacionar IDs de jugadores con sus nombres y equipos
        const jugadoresMap = {};
        jugadores.forEach((jugador) => {
          jugadoresMap[jugador.id] = {
            nombre: jugador.nombre,
            apellido: jugador.apellido,
            equipo: jugador.equipo.nombre, // Assuming jugador.equipo is available
          };
        });

        // Traer las estadísticas individuales de la zona
        const estadisticasResponse = await api.get(`/zonas/${zonaId}/estadisticas`, {
          signal: abortController?.signal
        });
        const estadisticas = estadisticasResponse.data;

        // Crear mapas para goleadores, amonestados y expulsados
        const goleadoresMap = {};
        const amonestadosMap = {};
        const expulsadosMap = {};

        estadisticas.forEach((estadistica) => {
          const { jugador_id, goles, amarillas, rojas } = estadistica;
          const jugador = jugadoresMap[jugador_id];
          if (!jugador) return;

          // Initialize if not exists
          if (!goleadoresMap[jugador_id]) goleadoresMap[jugador_id] = { ...jugador, cantidad: 0 };
          if (!amonestadosMap[jugador_id]) amonestadosMap[jugador_id] = { ...jugador, cantidad: 0 };
          if (!expulsadosMap[jugador_id]) expulsadosMap[jugador_id] = { ...jugador, cantidad: 0 };

          // Sum stats
          goleadoresMap[jugador_id].cantidad += goles || 0;
          amonestadosMap[jugador_id].cantidad += amarillas || 0;
          expulsadosMap[jugador_id].cantidad += rojas || 0;
        });

        // Convert maps to arrays, filter, sort, and slice
        const goleadoresArray = Object.values(goleadoresMap)
          .filter((j) => j.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
        const amonestadosArray = Object.values(amonestadosMap)
          .filter((j) => j.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
        const expulsadosArray = Object.values(expulsadosMap)
          .filter((j) => j.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);

        setGoleadores(goleadoresArray);
        setAmonestados(amonestadosArray);
        setExpulsados(expulsadosArray);

        // --- Fetch Next Matchday (Próxima Fecha) ---
        const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`, {
          signal: abortController?.signal
        });
        const fechas = fechasResponse.data;
        const fechaProxima = fechas.find((fecha) => fecha.estado === 'Pendiente');
        setProximaFecha(fechaProxima);

        if (fechaProxima) {
          const partidosProximaResponse = await api.get(`/fechas/${fechaProxima.id}/partidos`, {
            signal: abortController?.signal
          });
          setPartidosProximaFecha(partidosProximaResponse.data);
        } else {
          setPartidosProximaFecha([]); // Clear if no next matchday
        }

      } catch (error) {
        // Check if the error is due to cancellation
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          console.log('Petición de resultados cancelada.');
          return; // Don't treat cancellation as an error
        }
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos de resultados.');
        // Optionally clear state on error
        setTablaPuntaje([]);
        setGoleadores([]);
        setAmonestados([]);
        setExpulsados([]);
        setProximaFecha(null);
        setPartidosProximaFecha([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function provided by parent (DetalleZona)
    // return () => {
    //   abortController?.abort(); // Parent handles this
    // };

  }, [zonaId, abortController]); // Add abortController to dependencies

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <BtnLoading />
      </div>
    );
  }

  return (
    <div className="space-y-8"> {/* Added spacing between sections */}
      {/* Tabla de Puntaje */}
      {tablaPuntaje.length > 0 ? (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Tabla de Posiciones</h2>
          {/* Pass the fetched data directly */}
          <TablaPuntaje data={tablaPuntaje} formato="Liga" /> {/* Assuming 'Liga' is the correct format string */}
        </div>
      ) : (
        <p className="text-center text-gray-500">No hay datos de tabla de posiciones disponibles.</p>
      )}


      {/* Próxima Fecha */}
      {proximaFecha ? (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Próxima Fecha: {proximaFecha.nombre}</h2>
          <TablaProximaFecha
            fecha={proximaFecha}
            partidos={partidosProximaFecha}
            zonaId={zonaId}
          />
        </div>
      ) : (
         <p className="text-center text-gray-500">No hay próxima fecha programada.</p>
      )}

      {/* Estadísticas de Jugadores */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8"> {/* Use grid for better layout */}
        <div>
          <TablasEstadisticasJugadores
            titulo="Goleadores"
            datos={goleadores}
            columnaEstadistica="Goles"
          />
        </div>
        <div>
          <TablasEstadisticasJugadores
            titulo="Amonestados"
            datos={amonestados}
            columnaEstadistica="Amarillas"
          />
        </div>
        <div>
          <TablasEstadisticasJugadores
            titulo="Expulsados"
            datos={expulsados}
            columnaEstadistica="Rojas"
          />
        </div>
      </div>
    </div>
  );
}