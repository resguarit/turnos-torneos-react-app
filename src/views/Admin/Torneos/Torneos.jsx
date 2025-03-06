import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { X, Trophy, List } from 'lucide-react';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';

export default function Torneos() {
  const [showModal, setShowModal] = useState(false);
  const [torneos, setTorneos] = useState([]);
  const [zonasCount, setZonasCount] = useState({});
  const [loadingTorneos, setLoadingTorneos] = useState(false);
  const [loadingZonas, setLoadingZonas] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoadingTorneos(true);
        
        const response = await api.get('/torneos');
        setTorneos(response.data);

        // Fetch zones count for each tournament
        const zonasPromises = response.data.map(async (torneo) => {
          const zonasResponse = await api.get(`/torneos/${torneo.id}/zonas`);
          return { torneoId: torneo.id, count: zonasResponse.data.length };
        });

        const zonasCounts = await Promise.all(zonasPromises);
        const zonasCountMap = zonasCounts.reduce((acc, { torneoId, count }) => {
          acc[torneoId] = count;
          return acc;
        }, {});

        setZonasCount(zonasCountMap);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoadingTorneos(false);
        setLoadingZonas(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleNuevoTorneo = (e) => {
    e.preventDefault();
    setShowModal(true); // Mostrar modal de confirmación
  };

  const confirmSubmit = async () => {
    setShowModal(false); // Cierra el modal
    // Lógica para reservar la cancha
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

  const Modal = ({ onConfirm, onCancel }) => (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ">
      <div className="bg-white text-black z-20 p-4 rounded-xl shadow-lg w-11/12 lg:w-1/2">
        <div className="flex justify-between">
          <h2 className="text-2xl font-sans font-medium mb-1">Crear Nuevo Torneo</h2>
          <X onClick={onCancel} className="cursor-pointer" />
        </div>
        <p className="mb-4 text-sm text-gray-500">Complete los datos para crear un nuevo torneo</p>
        <div className='flex flex-col space-y-8'>
          <div>
            <label className="font-medium font-sans text-lg">Nombre del Torneo:</label>
            <input className='bg-gray-200 w-full p-1 rounded-xl' ></input>
          </div>
          <div>
            <label className="font-medium font-sans text-lg">Año del Torneo:</label>
            <input className='bg-gray-200 w-full p-1 rounded-xl' ></input>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onConfirm}
              className="p-2 px-4  bg-naranja text-white"
              style={{ borderRadius: '6px' }}
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
                    <h2 className="text-2xl font-medium">{torneo.nombre}</h2>
                    <span className="text-gray-500 lg:text-lg"> <Trophy /></span>
                  </div>
                  <p className="text-sm text-gray-500">{torneo.deporte.nombre} {torneo.deporte.jugadores_por_equipo}</p>
                </CardHeader>
                <CardContent className="p-4 ">
                  <p className="w-full flex gap-2 items-center "><List size={24} className="text-gray-600" /> {zonasCount[torneo.id] || 0} zonas</p>
                  <div className="flex mt-4 gap-3 text-sm justify-center">
                    <Link to="/zonas-admi" className="flex-1 border text-center border-gray-300  p-1 hover:bg-naranja hover:text-white" style={{ borderRadius: '8px' }}>Ver Zonas</Link>
                    <button className="flex-1 border  p-1 border-gray-300 hover:bg-naranja hover:text-white" style={{ borderRadius: '8px' }}>Editar</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {showModal && <Modal onConfirm={confirmSubmit} onCancel={() => setShowModal(false)} />}
      </main>
      <Footer />
    </div>
  );
}

