import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trophy, List } from 'lucide-react';
import BtnLoading from '@/components/BtnLoading';
import { useTorneos } from '@/context/TorneosContext';
import { toast } from 'react-toastify';
import api from '@/lib/axiosConfig';
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal';

export default function Torneos() {
  const { torneos, setTorneos } = useTorneos();
  const [loadingTorneos, setLoadingTorneos] = useState(false);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [searchYear, setSearchYear] = useState('');
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false); // solo para mostrar/ocultar modal
  const [torneoIdFinalizar, setTorneoIdFinalizar] = useState(null);    // guarda el id del torneo
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filtrar torneos activos si no hay búsqueda, o todos los que coincidan con el año si hay búsqueda
  const torneosFiltrados = searchYear
    ? torneos.filter(t => String(t.año).includes(searchYear))
    : torneos.filter(t => t.activo === 1 || t.activo === true);

  // Calcular la cantidad de zonas por torneo
  const zonasCount = torneosFiltrados.reduce((acc, torneo) => {
    acc[torneo.id] = torneo.zonas ? torneo.zonas.length : 0;
    return acc;
  }, {});

  const handleNuevoTorneo = (e) => {
    e.preventDefault();
    navigate('/alta-torneo');
  };

  const handleVerZonas = (torneoId) => {
    navigate(`/zonas-admi/${torneoId}`);
  };

  const finalizarTorneo = async (torneoId) => {
    try {
      setLoading(true);
      const response = await api.put(`/torneos/${torneoId}`, { activo: false });
      if (response.data.status === 200) {
        toast.success('Torneo finalizado correctamente');
        setModalFinalizarOpen(false);
        // Refrescar torneos en el contexto
        const torneosResponse = await api.get('/torneos');
        setTorneos(torneosResponse.data);
      } else {
        toast.error(response.data.message || 'Error al finalizar el torneo');
      }
    } catch (error) {
      toast.error('Error al finalizar el torneo');
    } finally {
      setLoading(false);
    }
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
          <div className="flex mb-6 gap-4">
            <input
              type="number"
              placeholder="Buscar por año (ej: 2025)"
              value={searchYear}
              onChange={e => setSearchYear(e.target.value)}
              className="border border-gray-300 rounded-[6px] py-1 px-2 text-sm"
            />
            {searchYear && (
              <button
                onClick={() => setSearchYear('')}
                className="text-sm px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {torneosFiltrados.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                No se encontraron torneos {searchYear ? `para el año ${searchYear}` : 'activos'}.
              </div>
            ) : (
              torneosFiltrados.map((torneo) => (
                <Card className="bg-white rounded-[8px] shadow-md" key={torneo.id} >
                  <CardHeader className="w-full p-4 bg-gray-200 rounded-t-[8px]">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-medium">{torneo.nombre} {torneo.año}</h2>
                      <span className="text-gray-500 lg:text-lg"> <Trophy /></span>
                    </div>
                    <p className="text-sm text-gray-500">{torneo.deporte?.nombre} {torneo.deporte?.jugadores_por_equipo}</p>
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
                      <button
                        onClick={() => {
                          setTorneoIdFinalizar(torneo.id);
                          setModalFinalizarOpen(true);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Finalizar
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ConfirmDeleteModal 
                isOpen={modalFinalizarOpen}
                onClose={() => setModalFinalizarOpen(false)}
                onConfirm={() => finalizarTorneo(torneoIdFinalizar)}
                loading={loading}
                accionTitulo="Finalización"
                accion="finalizar"
                pronombre="este"
                entidad="torneo"
                accionando="Finalizando"
      />
    </div>
  );
}

