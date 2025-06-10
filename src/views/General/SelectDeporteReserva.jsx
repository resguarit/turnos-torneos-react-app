import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BackButton from '@/components/BackButton';
import BtnLoading from '@/components/BtnLoading';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useDeportes } from '@/context/DeportesContext'; // Usa el contexto
import { useConfiguration } from '@/context/ConfigurationContext';
import api from '@/lib/axiosConfig';

const sportIcons = {
  futbol: "⚽",
  fútbol: "⚽",
  padel: "🎾",
  tenis: "🎾",
  basquet: "🏀",
  básquet: "🏀",
  voley: "🏐",
  hockey: "🏑",
  default: "🏆",
}

const SelectDeporteReserva = () => {
  const navigate = useNavigate();
  const { deportes, setDeportes, isLoading: isLoadingDeportes } = useDeportes(); // Usa el contexto con estado de carga
  const [selectedSport, setSelectedSport] = useState(null);
  const [localConfig, setLocalConfig] = useState(null);
  const [isLoadingLocalConfig, setIsLoadingLocalConfig] = useState(true);
  const [localDeportes, setLocalDeportes] = useState(null);
  const [isLoadingLocalDeportes, setIsLoadingLocalDeportes] = useState(true);
  // Usamos un ref para controlar que solo se haga una llamada a la API
  const deportesApiCalled = useRef(false);

  const { config, isLoading: isLoadingConfig } = useConfiguration();

  // Efecto para obtener la configuración actualizada al montar el componente
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const response = await api.get('/configuracion-usuario');
        setLocalConfig(response.data);
      } catch (error) {
        console.error('Error al obtener la configuración directa:', error);
      } finally {
        setIsLoadingLocalConfig(false);
      }
    };

    fetchConfiguracion();
  }, []);
  
  // Efecto para obtener los deportes actualizados al montar el componente (una sola vez)
  useEffect(() => {
    // Solo ejecutamos si no se ha llamado a la API antes
    if (!deportesApiCalled.current) {
      const fetchDeportes = async () => {
        try {
          const response = await api.get('/deportes');
          setLocalDeportes(response.data);
          
          // También actualizar el contexto global para el resto de la aplicación
          if (setDeportes) {
            setDeportes(response.data);
          }
        } catch (error) {
          console.error('Error al obtener deportes directamente:', error);
        } finally {
          setIsLoadingLocalDeportes(false);
          deportesApiCalled.current = true; // Marcamos que ya se llamó a la API
        }
      };

      fetchDeportes();
    } else {
      // Si ya se llamó a la API, simplemente marcamos como no cargando
      setIsLoadingLocalDeportes(false);
    }
  }, []); // Sin dependencias para que solo se ejecute una vez al montar
  
  // Usar la configuración local si está disponible, de lo contrario usar la del contexto
  const configActual = localConfig || config;
  
  // Usar los deportes locales si están disponibles, de lo contrario usar los del contexto
  const deportesActuales = localDeportes || deportes;
  
  // Verificar de forma segura si los turnos están habilitados usando la configuración más actual
  const turnosHabilitados = configActual ? (configActual.habilitar_turnos === true || configActual.habilitar_turnos === "1" || configActual.habilitar_turnos === 1) : false;
  
  // Solo hacer console.log si configActual existe
  if (configActual) {
    console.log('Estado actual de habilitar_turnos:', configActual.habilitar_turnos);
  }
  
  // Determinar si la aplicación está cargando
  const isLoading = isLoadingDeportes || isLoadingConfig || isLoadingLocalConfig || isLoadingLocalDeportes || 
                  (!config && !localConfig) || (!deportes && !localDeportes);

  // Function to format sport display name
  const formatDeporteName = (deporte) => {
    if (deporte.nombre.toLowerCase().includes("futbol") || deporte.nombre.toLowerCase().includes("fútbol")) {
      return `${deporte.nombre} ${deporte.jugadores_por_equipo}`
    }
    return deporte.nombre
  }

  // Function to get icon for a sport
  const getSportIcon = (nombre) => {
    const lowerName = nombre.toLowerCase()
    for (const key in sportIcons) {
      if (lowerName.includes(key)) {
        return sportIcons[key]
      }
    }
    return sportIcons.default
  }

  // Function to get a gradient based on sport name
  const getSportGradient = (nombre) => {
    const lowerName = nombre.toLowerCase()
    if (lowerName.includes("futbol") || lowerName.includes("fútbol")) {
      return "from-green-400 to-emerald-600"
    } else if (lowerName.includes("padel") || lowerName.includes("tenis")) {
      return "from-yellow-400 to-orange-500"
    } else if (lowerName.includes("basquet") || lowerName.includes("básquet")) {
      return "from-orange-400 to-red-600"
    } else if (lowerName.includes("voley")) {
      return "from-blue-400 to-indigo-600"
    } else if (lowerName.includes("hockey")) {
      return "from-purple-400 to-pink-600"
    }
    return "from-blue-500 to-purple-600"
  }

  const handleSportClick = (deporte) => {
    setSelectedSport(deporte.id)
    setTimeout(() => {
      navigate(`/reserva-mobile/${deporte.id}`)
    }, 300)
  }

  // Filtra deportes que tengan canchas disponibles
  const deportesConCanchas = deportesActuales ? deportesActuales.filter(d => d.canchas && d.canchas.length > 0) : [];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="flex items-start justify-start p-4">
          <BackButton ruta="/" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-8 text-center font-[Poppins]">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
            ¡Elegí tu deporte!
          </h1>
          <p className="text-gray-600 mt-2">Selecciona una opción para ver disponibilidad</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <BtnLoading />
            <p className="text-gray-500 mt-4">Cargando información...</p>
          </div>
        ) : !turnosHabilitados ? (
          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-yellow-700">Reservas temporalmente desactivadas</h3>
            <p className="text-yellow-600 mt-2 mb-1">En este momento las reservas de turnos están desactivadas.</p>
            <p className="text-yellow-500">Por favor, intenta más tarde.</p>
          </div>
        ) : (
          <>
            {deportesConCanchas.length > 0 ? (
              <div className="perspective-1000">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-[Poppins]">
                  {deportesConCanchas.map((deporte) => (
                    <button
                      key={deporte.id}
                      onClick={() => handleSportClick(deporte)}
                      className={`
                        group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300
                        hover:shadow-2xl hover:-translate-y-2 focus:outline-none
                        ${selectedSport === deporte.id ? "scale-95 opacity-80" : ""}
                      `}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${getSportGradient(deporte.nombre)} opacity-90`}
                      ></div>

                      {/* Background pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div
                          className="absolute top-0 left-0 w-full h-full bg-white opacity-10"
                          style={{
                            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)",
                            backgroundSize: "20px 20px",
                          }}
                        ></div>
                      </div>

                      <div className="relative p-6 h-44 flex flex-col justify-between">
                        <div className="text-6xl mb-4 transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                          {getSportIcon(deporte.nombre)}
                        </div>

                        <div>
                          <h2 className="text-xl font-bold text-white tracking-wide">{formatDeporteName(deporte)}</h2>
                          <div className="mt-2 flex items-center">
                            <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium">
                              Ver disponibilidad
                            </span>
                            <svg
                              className="w-4 h-4 ml-2 text-white transform transition-transform duration-300 group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md p-8">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-gray-600 text-lg">No hay deportes disponibles en este momento.</p>
                <p className="text-gray-400 mt-2">¡Vuelve a intentarlo más tarde!</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SelectDeporteReserva;

