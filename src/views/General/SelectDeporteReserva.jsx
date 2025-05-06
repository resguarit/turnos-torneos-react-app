import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import BackButton from '@/components/BackButton';
import BtnLoading from '@/components/BtnLoading';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
    const [deportes, setDeportes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSport, setSelectedSport] = useState(null);

    useEffect(() => {
        const fetchDeportes = async () => {
            try {
                setLoading(true);
                const response = await api.get('/deportes');
                const filteredDeportes = response.data.filter(deporte => deporte.canchas.length > 0);
                setDeportes(filteredDeportes);
            } catch (error) {
                console.error('Error fetching deportes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeportes();
    }, []);

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
    // Add a small delay before navigating for animation effect
    setTimeout(() => {
      navigate(`/reserva-mobile/${deporte.id}`)
    }, 300)
  }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
            ¡Elegí tu deporte!
          </h1>
          <p className="text-gray-600 mt-2">Selecciona una opción para ver disponibilidad</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <BtnLoading />
          </div>
        ) : (
          <div className="perspective-1000">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deportes.map((deporte) => (
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
        )}

        {!loading && deportes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md p-8">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-600 text-lg">No hay deportes disponibles en este momento.</p>
            <p className="text-gray-400 mt-2">¡Vuelve a intentarlo más tarde!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
    );
};

export default SelectDeporteReserva;

