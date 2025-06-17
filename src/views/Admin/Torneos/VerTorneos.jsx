import react, {useState, useEffect} from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Trophy, Search } from 'lucide-react';

export default function VerTorneos() {
  const [torneos, setTorneos] = useState([]);
  const [loadingTorneos, setLoadingTorneos] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTorneos(true);
        const torneosResponse = await api.get('/torneos');
        const torneosActivos = torneosResponse.data.filter(torneo => torneo.activo !== 0);
        setTorneos(torneosActivos);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingTorneos(false);
      }
    };
    fetchData();
  }, []);

  const handleVerZonas = (torneoId) => {
    navigate(`/zonas-user/${torneoId}`);
  };

  // Filtrado por búsqueda
  const torneosFiltrados = torneos.filter(torneo =>
    torneo.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gray-50">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex flex-col items-center mb-6 gap-2">
            <Trophy className="w-8 h-8 text-naranja" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Torneos Disponibles</h1>
          </div>

          {/* Buscador */}
          <div className="relative mb-6 w-full">
            <input
              type="text"
              placeholder="Buscar torneo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-naranja focus:ring-2 focus:ring-naranja outline-none transition text-sm bg-white shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {loadingTorneos ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {torneosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay torneos activos disponibles</div>
              ) : (
                torneosFiltrados.map((torneo) => (
                  <div
                    key={torneo.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2"
                  >
                    <span className="font-medium text-gray-800 text-base break-words flex-1">{torneo.nombre}</span>
                    <button
                      onClick={() => handleVerZonas(torneo.id)}
                      className="px-4 py-2 rounded-md text-sm font-semibold bg-naranja text-white hover:bg-naranja/90 transition-colors duration-200 shadow"
                    >
                      Ver zonas
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}