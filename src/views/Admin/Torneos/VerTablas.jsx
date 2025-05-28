import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BtnLoading from '@/components/BtnLoading';
import { TablaPuntaje } from './Tablas/TablaPuntaje';
import { TablaProximaFecha } from './Tablas/TablaProximaFecha';
import { TablasEstadisticasJugadores } from './Tablas/TablasEstadisticasJugadores';
import { TablaSanciones } from './Tablas/TablaSanciones';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify'; // Import toast for error messages
import ArañaEliminacionUsuario from './ArañaEliminacionUsuario';

export default function VerTablas() {
  const { zonaId } = useParams();
  const [zonaInfo, setZonaInfo] = useState(null); // Store zone info (like format)
  const [tablaPuntaje, setTablaPuntaje] = useState([]); // For Liga format
  const [estadisticasGrupos, setEstadisticasGrupos] = useState([]); // For Grupos format
  const [goleadores, setGoleadores] = useState([]);
  const [amonestados, setAmonestados] = useState([]);
  const [expulsados, setExpulsados] = useState([]);
  const [proximaFecha, setProximaFecha] = useState(null);
  const [partidosProximaFecha, setPartidosProximaFecha] = useState([]);
  const [sanciones, setSanciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Zone Info first to determine format
        const zonaResponse = await api.get(`/zonas/${zonaId}`);
        if (zonaResponse.status !== 200 || !zonaResponse.data) {
          throw new Error('No se pudo obtener la información de la zona.');
        }
        const currentZonaInfo = zonaResponse.data;
        setZonaInfo(currentZonaInfo);

        // 2. Fetch Standings based on format
        if (currentZonaInfo.formato === 'Grupos') {
          const gruposStatsResponse = await api.get(`/zonas/${zonaId}/estadisticas-grupos`);
          if (gruposStatsResponse.status === 200 && Array.isArray(gruposStatsResponse.data)) {
            setEstadisticasGrupos(gruposStatsResponse.data);
          } else {
            console.warn('Respuesta inválida para estadísticas de grupos.');
            setEstadisticasGrupos([]);
            toast.error('No se pudieron cargar las estadísticas de los grupos.');
          }
        } else if (currentZonaInfo.formato === 'Liga' || currentZonaInfo.formato === 'Liga + Playoff') {
          // Fetch Liga stats only for these formats
          const ligaStatsResponse = await api.get(`/zonas/${zonaId}/estadisticas-liga`);
          if (ligaStatsResponse.status === 200 && Array.isArray(ligaStatsResponse.data)) {
            setTablaPuntaje(ligaStatsResponse.data);
          } else {
            console.warn('Respuesta inválida para estadísticas de liga.');
            setTablaPuntaje([]);
            toast.error('No se pudieron cargar las estadísticas de la liga.');
          }
        }
        // For other formats (like Eliminatoria, Liga Ida y Vuelta if not handled above), tablaPuntaje and estadisticasGrupos will remain empty arrays

        // 3. Fetch Player Statistics (Common for all formats)
        const playerStatsResponse = await api.get(`/zonas/${zonaId}/estadisticas/jugadores`);
        if (playerStatsResponse.status === 200 && playerStatsResponse.data) {
          setGoleadores(playerStatsResponse.data.goleadores || []);
          setAmonestados(playerStatsResponse.data.amonestados || []);
        } else {
          console.warn('Respuesta inválida para estadísticas de jugadores.');
          setGoleadores([]);
          setAmonestados([]);
          toast.error('No se pudieron cargar las estadísticas de jugadores.');
        }

        // --- Fetch Sanciones ---
        const sancionesResponse = await api.get(`/zonas/${zonaId}/sanciones`);
        const userRole = localStorage.getItem('user_role');
        if (userRole !== 'admin') {
          setSanciones(sancionesResponse.data?.sanciones?.filter(s => s.sancion?.estado === 'activa') || []);
        } else {
          setSanciones([]); // No mostrar sanciones para otros roles o usuarios no logueados
        }

        // 4. Fetch Next Matchday (Common for all formats)
        const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`);
        const fechas = Array.isArray(fechasResponse.data) ? fechasResponse.data : [];
        const fechaProxima = fechas.find((fecha) => fecha.estado === 'Pendiente');
        setProximaFecha(fechaProxima);

        if (fechaProxima && Array.isArray(fechaProxima.partidos)) {
          setPartidosProximaFecha(fechaProxima.partidos);
        } else {
          setPartidosProximaFecha([]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos de las tablas.');
        // Clear state on error
        setZonaInfo(null);
        setTablaPuntaje([]);
        setEstadisticasGrupos([]);
        setGoleadores([]);
        setAmonestados([]);
        setProximaFecha(null);
        setPartidosProximaFecha([]);
        setSanciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zonaId]);

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

  // Handle case where zone info couldn't be loaded
  if (!zonaInfo) {
     return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
           <div className="w-full flex mb-2">
            <button onClick={() => navigate(-1)} className="bg-black rounded-xl text-white px-4 py-2 text-sm flex items-center justify-center hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-5 mr-1" /> Atrás
            </button>
           </div>
          <p className="text-center text-red-500">No se pudo cargar la información de la zona.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="w-full flex mb-4"> {/* Increased margin-bottom */}
          <button onClick={() => navigate(-1)} className="bg-black rounded-xl text-white px-4 py-2 text-sm flex items-center justify-center hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 mr-1" /> Atrás
          </button>
        </div>
        <div className="flex flex-col items-center w-full space-y-8"> {/* Use space-y for consistent spacing */}
          <h1 className="text-center text-3xl font-bold  mb-4">Tablas <span className='text-orange-600'> {zonaInfo.torneo.nombre} - {zonaInfo.nombre}</span></h1> {/* Larger title */}

          {/* Render Standings based on format */}
          {zonaInfo.formato === 'Grupos' ? (
            // --- GRUPOS FORMAT ---
            estadisticasGrupos.length > 0 ? (
              <div className="w-full max-w-6xl"> {/* Constrain width */}
                <h2 className="text-2xl font-semibold mb-4 ">Tabla de Posiciones por Grupo</h2>
                <div className="flex flex-col gap-6">
                  {estadisticasGrupos.map((grupo) => (
                    <div key={grupo.id} className="">
                       <h3 className="text-xl font-semibold mb-3 ">{grupo.nombre}</h3>
                      <TablaPuntaje data={grupo.equipos} formato="Grupos" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 w-full max-w-4xl">No hay datos de tabla de posiciones disponibles para los grupos.</p>
            )
          ) : (zonaInfo.formato === 'Liga' || zonaInfo.formato === 'Liga + Playoff') ? (
            // --- LIGA or LIGA + PLAYOFF FORMAT ---
            tablaPuntaje.length > 0 ? (
              <div className="w-full max-w-6xl"> {/* Constrain width */}
                <h2 className="text-2xl font-semibold mb-4 ">Tabla de Posiciones</h2>
                <div className="">
                  <TablaPuntaje data={tablaPuntaje} formato="Liga" />
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 w-full max-w-4xl">No hay datos de tabla de posiciones disponibles.</p>
            )
          ) : null /* Or render a message for other formats if needed */}

          {/* Próxima Fecha */}
          {proximaFecha ? (
            <div className="w-full max-w-6xl"> {/* Constrain width */}
               <div className="">
                 <TablaProximaFecha
                   fecha={proximaFecha}
                   partidos={partidosProximaFecha}
                   zonaId={zonaId}
                 />
               </div>
            </div>
          ) : (
             <p className="text-center text-gray-500 w-full max-w-4xl">No hay próxima fecha programada.</p>
          )}

          
          {zonaInfo.formato === 'Eliminatoria' && (
            <div className="w-full max-w-6xl">
              <ArañaEliminacionUsuario equipos={zonaInfo.equipos} />
            </div>
          )}

          {/* Estadísticas de Jugadores */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Wider container for stats */}
            <TablasEstadisticasJugadores
              titulo="Goleadores"
              datos={goleadores}
              columnaEstadistica="Goles"
              valorKey="goles"
              nombreKey="nombre_completo"
              equipoKey="equipo"
            />
            <TablasEstadisticasJugadores
              titulo="Amonestados"
              datos={amonestados}
              columnaEstadistica="Amarillas"
              valorKey="amarillas"
              nombreKey="nombre_completo"
              equipoKey="equipo"
            />
          </div>
          <div className="w-full max-w-6xl mt-8">
            <TablaSanciones sanciones={sanciones} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}