import react, {useState, useEffect} from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function VerTorneos() {
const [torneos, setTorneos] = useState([]);
const navigate = useNavigate();
const [loadingTorneos, setLoadingTorneos] = useState(false);

useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTorneos(true);
        const torneosResponse = await api.get('/torneos')
        setTorneos(torneosResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingTorneos(false);
      }
    };

    fetchData();
  }, []);

  const handleVerZonas = (torneoId) => {
    navigate(`/zonas-user/${torneoId}`); // Navegar a la pantalla de zonas con el ID del torneo
  };


    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex flex-col justify-center items-center h-full">
            <h1 className="text-center text-2xl font-sans font-semibold ">Torneos</h1>
            <div className='flex flex-col w-1/2'>
            {torneos.map((torneo) => (
                <div key={torneo.id} className="bg-black text-white shadow-md rounded-[6px] p-2 mt-4">
                    <div className="flex items-center justify-between">
                        <h2>{torneo.nombre}</h2>
                        <button
                          onClick={() => handleVerZonas(torneo.id)} // Envolver en una función anónima
                          className="bg-white text-black px-2 py-1 rounded-[8px]"
                        >
                          Ver zonas
                        </button>
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