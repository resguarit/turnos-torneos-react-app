import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trophy, List } from 'lucide-react';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';

export default function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [zonasCount, setZonasCount] = useState({});
  const [loadingTorneos, setLoadingTorneos] = useState(false);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [deportes, setDeportes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTorneos(true);
        setLoadingZonas(true);

        const [torneosResponse, deportesResponse, zonasResponse] = await Promise.all([
          api.get('/torneos'),
          api.get('/deportes'),
          api.get('/zonas')
        ]);

        setTorneos(torneosResponse.data);
        setDeportes(deportesResponse.data);

        // Contar la cantidad de zonas por torneo
        const zonasCountMap = zonasResponse.data.reduce((acc, zona) => {
          acc[zona.torneo_id] = (acc[zona.torneo_id] || 0) + 1;
          return acc;
        }, {});

        setZonasCount(zonasCountMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingTorneos(false);
        setLoadingZonas(false);
      }
    };

    fetchData();
  }, []);

  const handleNuevoTorneo = (e) => {
    e.preventDefault();
    navigate('/alta-torneo'); // Navegar a la pantalla de creación de torneos
  };

  const handleVerZonas = (torneoId) => {
    navigate(`/zonas-admi/${torneoId}`); // Navegar a la pantalla de zonas con el ID del torneo
  };

  if (loadingTorneos || loadingZonas) {
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
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-2xl font-bold">Torneos</h1>
            <button variant="default" className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white" onClick={handleNuevoTorneo}>
              + Nuevo Torneo
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {torneos.map((torneo) => (
              <Card className="bg-white rounded-[8px] shadow-md" key={torneo.id} >
                <CardHeader className="w-full p-4 bg-gray-200 rounded-t-[8px]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-medium">{torneo.nombre} {torneo.año}</h2>
                    <span className="text-gray-500 lg:text-lg"> <Trophy /></span>
                  </div>
                  <p className="text-sm text-gray-500">{torneo.deporte.nombre} {torneo.deporte.jugadores_por_equipo}</p>
                </CardHeader>
                <CardContent className="p-4 ">
                  <p className="w-full flex gap-2 items-center "><List size={24} className="text-gray-600" /> {zonasCount[torneo.id] || 0} zonas</p>
                  <div className="flex mt-4 gap-3 text-sm justify-center">
                    <button onClick={() => handleVerZonas(torneo.id)} className="flex-1 border text-center border-gray-300 p-1 hover:bg-naranja hover:text-white" style={{ borderRadius: '8px' }}>Ver Zonas</button>
                    <button
                      onClick={() => navigate(`/editar-torneo/${torneo.id}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Editar
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

