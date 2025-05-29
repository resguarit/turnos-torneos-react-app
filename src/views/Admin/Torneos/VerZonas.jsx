import react, {useState, useEffect} from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function VerZonas() {
const [zonas, setZonas] = useState([]);
const [loadingZonas, setLoadingZonas] = useState(false);
const { torneoId } = useParams();
const navigate = useNavigate();

useEffect(() => {
    const fetchZonas = async () => {
      try {
        setLoadingZonas(true);
        const zonasResponse = await api.get(`/torneos/${torneoId}/zonas`);
        setZonas(zonasResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingZonas(false);
      }
    };

    fetchZonas();
  }, []);

  const handleVerTablas = (zonaId) => {
    navigate(`/tablas/${zonaId}`); // Navegar a la pantalla de zonas con el ID del torneo
  };

    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="w-full flex mb-2">
            <BackButton ruta={`/torneos-user`} />
                  </div>
          <div className="flex flex-col justify-center items-center h-full">
            <h1 className="text-center text-2xl font-semibold ">Zonas</h1>
            <div className='flex flex-col w-1/2'>
            {zonas.map((zona) => (
                <div key={zona.id} className="bg-black text-white shadow-md rounded-[6px] p-2 mt-4">
                    <div className="flex items-center justify-between">
                        <h2>{zona.nombre}</h2>
                        <button onClick={() => handleVerTablas(zona.id)} className="bg-white text-black px-2 py-1 rounded-[8px]">Ver Tablas</button>
                    </div>
                    </div>
            ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
}