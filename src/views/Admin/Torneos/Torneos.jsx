import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trophy, List } from 'lucide-react';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify';
import api from '@/lib/axiosConfig';
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal';

export default function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchYear, setSearchYear] = useState('');
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
  const [modalReactivarOpen, setModalReactivarOpen] = useState(false);
  const [torneoIdFinalizar, setTorneoIdFinalizar] = useState(null);
  const [torneoIdReactivar, setTorneoIdReactivar] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const navigate = useNavigate();

  const fetchTorneos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/torneos');
      setTorneos(response.data);
    } catch (error) {
      toast.error('Error al cargar los torneos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTorneos();
  }, []);

  const torneosFiltrados = searchYear
    ? torneos.filter(t => String(t.año).includes(searchYear))
    : mostrarTodos
      ? torneos
      : torneos.filter(t => t.activo === 1 || t.activo === true);

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
      setActionLoading(true);
      const response = await api.put(`/torneos/${torneoId}`, { activo: false });
      if (response.data.status === 200) {
        toast.success('Torneo finalizado correctamente');
        setModalFinalizarOpen(false);
        fetchTorneos();
      } else {
        toast.error(response.data.message || 'Error al finalizar el torneo');
      }
    } catch (error) {
      toast.error('Error al finalizar el torneo');
    } finally {
      setActionLoading(false);
    }
  };

  const reactivarTorneo = async (torneoId) => {
    try {
      setActionLoading(true);
      const response = await api.put(`/torneos/${torneoId}`, { activo: true });
      if (response.data.status === 200) {
        toast.success('Torneo reactivado correctamente');
        setModalReactivarOpen(false);
        fetchTorneos();
      } else {
        toast.error(response.data.message || 'Error al reactivar el torneo');
      }
    } catch (error) {
      toast.error('Error al reactivar el torneo');
    } finally {
      setActionLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Torneos</h1>
            <button variant="default" className="bg-secundario hover:bg-secundario/80 p-2 text-sm font-inter rounded-[6px] text-white" onClick={handleNuevoTorneo}>
              + Nuevo Torneo
            </button>
          </div>
          <div className="flex justify-between mb-6 items-center">
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
            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={mostrarTodos}
                onChange={e => setMostrarTodos(e.target.checked)}
                className="accent-naranja"
              />
              <span className="text-sm text-gray-700">Mostrar todos los torneos</span>
            </label>
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
                          if (torneo.activo) {
                            setTorneoIdFinalizar(torneo.id);
                            setModalFinalizarOpen(true);
                          } else {
                            setTorneoIdReactivar(torneo.id);
                            setModalReactivarOpen(true);
                          }
                        }}
                        className={`text-white px-4 py-2 rounded ${torneo.activo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                        {torneo.activo ? 'Finalizar' : 'Reactivar'}
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
                loading={actionLoading}
                accionTitulo="Finalización"
                accion="finalizar"
                pronombre="el"
                entidad="torneo"
                accionando="Finalizando"
                nombreElemento={
                            torneoIdFinalizar
                              ? (() => {
                                  const torneo = torneos.find(j => j.id === torneoIdFinalizar);
                                  return torneo ? `${torneo.nombre} ${torneo.año}` : undefined;
                                })()
                              : undefined
                          }   
      />
      <ConfirmDeleteModal 
                isOpen={modalReactivarOpen}
                onClose={() => setModalReactivarOpen(false)}
                onConfirm={() => reactivarTorneo(torneoIdReactivar)}
                loading={actionLoading}
                accionTitulo="Activación"
                accion="activar"
                pronombre="el"
                entidad="torneo"
                accionando="Reactivando"
                nombreElemento={
                            torneoIdReactivar
                              ? (() => {
                                  const torneo = torneos.find(j => j.id === torneoIdReactivar);
                                  return torneo ? `${torneo.nombre} ${torneo.año}` : undefined;
                                })()
                              : undefined
                          }
      />
    </div>
  );
}

