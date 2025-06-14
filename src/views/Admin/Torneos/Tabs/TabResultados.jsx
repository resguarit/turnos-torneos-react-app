import React, { useEffect, useState } from 'react'; // Removed useRef as it's not directly used here anymore for this specific logic
import { TablaPuntaje } from '../Tablas/TablaPuntaje';
import { TablaProximaFecha } from '../Tablas/TablaProximaFecha';
import { TablasEstadisticasJugadores } from '../Tablas/TablasEstadisticasJugadores';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify';
import { TablaSanciones } from '../Tablas/TablaSanciones';

export function TabResultados({ zonaId, abortController }) {
  const [tablaPuntaje, setTablaPuntaje] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [amonestados, setAmonestados] = useState([]);
  const [sanciones, setSanciones] = useState([]);
  const [proximaFecha, setProximaFecha] = useState(null);
  const [partidosProximaFecha, setPartidosProximaFecha] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechas, setFechas] = useState([]); // Added to store fechas for the sanciones table


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
          // Keep showing toast only if it's not an abort error later
        }

        // --- Fetch Player Statistics (Goleadores, Amonestados, Expulsados) ---
        // Call the new endpoint
        const playerStatsResponse = await api.get(`/zonas/${zonaId}/estadisticas/jugadores`, {
          signal: abortController?.signal
        });

        if (playerStatsResponse.status === 200 && playerStatsResponse.data) {
          // Directly set state from the response
          setGoleadores(playerStatsResponse.data.goleadores || []);
          setAmonestados(playerStatsResponse.data.amonestados || []);
        } else {
          console.warn('Respuesta inválida para estadísticas de jugadores.');
          setGoleadores([]);
          setAmonestados([]);
          // Keep showing toast only if it's not an abort error later
        }

        const sancionesResponse = await api.get(`/zonas/${zonaId}/sanciones`, {
          signal: abortController?.signal
        });
        if (sancionesResponse.status === 200 && sancionesResponse.data?.sanciones) {
          setSanciones(sancionesResponse.data.sanciones);
        } else {
          setSanciones([]);
        }


        // --- Fetch Next Matchday (Próxima Fecha) ---
        const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`, {
          signal: abortController?.signal
        });
        // Ensure response.data is an array before finding
        const fechas = Array.isArray(fechasResponse.data) ? fechasResponse.data : [];
        setFechas(fechas);
        // Find the next pending fecha
        const fechaProxima = fechas.find((fecha) => fecha.estado === 'Pendiente');
        setProximaFecha(fechaProxima);

        // Use partidos directly from the fechaProxima object if it exists
        if (fechaProxima && Array.isArray(fechaProxima.partidos)) {
          setPartidosProximaFecha(fechaProxima.partidos);
        } else {
          setPartidosProximaFecha([]); // Clear if no next matchday or no partidos array
        }

      } catch (error) {
        // Check if the error is due to cancellation
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          console.log('Petición de resultados cancelada.');
          // Clear state if requests were cancelled mid-way
          setTablaPuntaje([]);
          setGoleadores([]);
          setAmonestados([]);
          setSanciones([]);
          setProximaFecha(null);
          setPartidosProximaFecha([]);
          return; // Don't treat cancellation as an error to show toast
        }
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos de resultados.');
        // Clear state on other errors
        setTablaPuntaje([]);
        setGoleadores([]);
        setAmonestados([]);
        setSanciones([]);
        setProximaFecha(null);
        setPartidosProximaFecha([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [zonaId, abortController]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <BtnLoading />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabla de Puntaje */}
      {tablaPuntaje.length > 0 ? (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-3 ">Tabla de Posiciones</h2>
          <TablaPuntaje data={tablaPuntaje} formato="Liga" />
        </div>
      ) : (
        <p className="text-center text-gray-500">No hay datos de tabla de posiciones disponibles.</p>
      )}


      {/* Próxima Fecha */}
      {proximaFecha ? (
        <div className="w-full">
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
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <TablasEstadisticasJugadores
            titulo="Goleadores"
            datos={goleadores} // Pass the fetched goleadores
            columnaEstadistica="Goles"
            valorKey="goles" // Key for the value in the data object
            nombreKey="nombre_completo" // Key for the name in the data object
            equipoKey="equipo" // Key for the team name
          />
        </div>
        <div>
          <TablasEstadisticasJugadores
            titulo="Amonestados"
            datos={amonestados} // Pass the fetched amonestados
            columnaEstadistica="Amarillas"
            valorKey="amarillas" // Key for the value
            nombreKey="nombre_completo"
            equipoKey="equipo"
          />
        </div>
      </div>
      <div className="w-full">
          <TablaSanciones sanciones={sanciones} fechas={fechas} onRefresh={fetchData} />
        </div>
    </div>
  );
}