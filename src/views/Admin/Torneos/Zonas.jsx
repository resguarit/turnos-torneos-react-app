import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BtnLoading from '@/components/BtnLoading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Star, Users, ChevronLeft, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import api from '@/lib/axiosConfig';
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal';
import { formatearFechaCorta } from '@/utils/dateUtils';
import BackButton from '@/components/BackButton';

export default function Zonas() {
  const { torneoId } = useParams();
  const [torneo, setTorneo] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [zonaIdFinalizar, setZonaIdFinalizar] = useState(null);
  const [zonaIdReactivar, setZonaIdReactivar] = useState(null);
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
  const [modalReactivarOpen, setModalReactivarOpen] = useState(false);
  const [searchCriterion, setSearchCriterion] = useState('nombre'); // 'nombre' o 'año'
  const [searchValue, setSearchValue] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const navigate = useNavigate();

  const fetchTorneoData = async () => {
    setPageLoading(true);
    try {
      // Como no hay un endpoint para un solo torneo con sus zonas, traemos todos y filtramos.
      const response = await api.get('/torneos');
      const currentTorneo = response.data.find(t => String(t.id) === String(torneoId));
      setTorneo(currentTorneo);
    } catch (error) {
      toast.error("Error al cargar los datos del torneo.");
      console.error(error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchTorneoData();
  }, [torneoId]);

  const zonas = torneo?.zonas || [];

  // Procesar zonas para agregar siguienteFecha (como antes)
  const zonasConFecha = zonas.map(zona => {
    const siguienteFecha = zona.fechas?.find(fecha => fecha.estado === 'Pendiente');
    return { 
      ...zona, 
      siguienteFecha: siguienteFecha 
        ? formatearFechaCorta(siguienteFecha.fecha_inicio)
        : 'No disponible' 
    };
  });

  // Filtrar zonas según el criterio seleccionado
  const zonasFiltradas = searchValue
    ? zonas.filter(z => {
        if (searchCriterion === 'nombre') {
          return z.nombre.toLowerCase().includes(searchValue.toLowerCase());
        }
        if (searchCriterion === 'año') {
          return String(z.año).includes(searchValue);
        }
        return true;
      })
    : zonas;

  // Finalizar zona
  const finalizarZona = async (zonaId) => {
    try {
      setLoading(true);
      const response = await api.put(`/zonas/${zonaId}`, { activo: false });
      if (response.data.status === 200) {
        toast.success('Zona finalizada correctamente');
        fetchTorneoData(); // Refetch
        setModalFinalizarOpen(false);
      } else {
        toast.error(response.data.message || 'Error al finalizar la zona');
      }
    } catch (error) {
      toast.error('Error al finalizar la zona');
    } finally {
      setLoading(false);
    }
  };

  const reactivarZona = async (zonaId) => {
    try {
      setLoading(true);
      const response = await api.put(`/zonas/${zonaId}`, { activo: true });
      if (response.data.status === 200) {
        toast.success('Zona reactivada correctamente');
        fetchTorneoData(); // Refetch
        setModalReactivarOpen(false);
      } else {
        toast.error(response.data.message || 'Error al reactivar la zona');
      }
    } catch (error) {
      toast.error('Error al reactivar la zona');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
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
        <div className="w-full flex mb-4">
          <BackButton ruta={'/torneos-admi'} />
        </div>
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl lg:text-2xl font-bold">
              Zonas del Torneo <span className='text-secundario'>{torneo ? torneo.nombre : ''}</span>
            </h1>
            <button onClick={() => navigate(`/alta-zona/${torneoId}`)} className="bg-secundario hover:bg-secundario/80 p-2 text-sm font-inter rounded-[6px] text-white">
              + Nueva Zona
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between mb-6 items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <select
                value={searchCriterion}
                onChange={e => setSearchCriterion(e.target.value)}
                className="border border-gray-300 text-gray-600 rounded-[6px] py-1 px-2 text-sm"
              >
                <option value="nombre">Nombre</option>
                <option value="año">Año</option>
              </select>
              <input
                type={searchCriterion === 'año' ? 'number' : 'text'}
                placeholder={
                  searchCriterion === 'nombre'
                    ? 'Buscar por nombre'
                    : 'Buscar por año (ej: 2025)'
                }
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="border border-gray-300 rounded-[6px] py-1 px-2 text-sm flex-grow sm:flex-grow-0"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className="text-sm px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="checkbox"
                checked={mostrarTodos}
                onChange={e => setMostrarTodos(e.target.checked)}
                className="accent-naranja"
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">Mostrar todas las zonas</span>
            </label>
          </div>
          {zonasFiltradas.length === 0 ? (
            <p className="text-center text-gray-500">No se encontraron zonas {searchValue ? `para el año ${searchValue}` : 'activas'}.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zonasFiltradas.map((zona) => (
                <Card className="bg-white rounded-[8px] shadow-md" key={zona.id} >
                  <CardHeader className="w-full p-4 bg-gray-200 rounded-t-[8px]">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-medium">{zona.nombre} {zona.año}</h2>
                      <span className="text-gray-500 lg:text-lg"> <Star /></span>
                    </div>
                    {zona.formato !== 'Grupos' && (
                      <p className="text-sm text-gray-500">{zona.formato} </p>
                    )}
                    {zona.formato === 'Grupos' && (
                      <p className="text-sm text-gray-500">{zona.formato} ({zona.grupos.length})</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 ">
                    <div className='flex flex-col gap-2'>
                      <p className="w-full flex gap-2 items-center "><Users size={18}/> Equipos: {zona.equipos.length}</p>
                      <p className="w-full flex gap-2 items-center "><CalendarDays size={18} />Siguiente Fecha: {zona.siguienteFecha}</p>
                    </div>
                    <div className="flex flex-wrap mt-4 gap-3 text-sm justify-center">
                      <button onClick={() => navigate(`/detalle-zona/${zona.id}?tab=equipos`)} className="flex-1 border text-center border-gray-300 p-1 hover:bg-naranja hover:text-white" style={{ borderRadius: '8px' }}>Ver Detalles</button>
                      <button
                        onClick={() => navigate(`/editar-zona/${zona.id}`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (zona.activo) {
                            setZonaIdFinalizar(zona.id);
                            setModalFinalizarOpen(true);
                          }
                          else {
                            setZonaIdReactivar(zona.id);
                            setModalReactivarOpen(true);
                          }
                        }}
                        className={`${zona.activo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}  text-white px-4 py-2 rounded`}
                      >
                        {zona.activo ? 'Finalizar' : 'Reactivar'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

        <ConfirmDeleteModal
          isOpen={modalFinalizarOpen}
          onClose={() => setModalFinalizarOpen(false)}
          onConfirm={() => finalizarZona(zonaIdFinalizar)}
          loading={loading}
          accionTitulo="Finalización"
          accion="finalizar"
          pronombre="la"
          entidad="zona"
          accionando="finalizando"
          nombreElemento={
            zonaIdFinalizar
              ? (() => {
                  const zona = zonas.find(z => z.id === zonaIdFinalizar);
                  return zona ? `${zona.nombre} ${zona.año}` : undefined;
                })()
              : undefined
          }
        />

        <ConfirmDeleteModal
          isOpen={modalReactivarOpen}
          onClose={() => setModalReactivarOpen(false)}
          onConfirm={() => reactivarZona(zonaIdReactivar)}
          loading={loading}
          accionTitulo="Reactivación"
          accion="reactivar"
          pronombre="la"
          entidad="zona"
          accionando="reactivando"
          nombreElemento={
            zonaIdReactivar
              ? (() => {
                  const zona = zonas.find(z => z.id === zonaIdReactivar);
                  return zona ? `${zona.nombre} ${zona.año}` : undefined;
                })()
              : undefined
          }
        />
      <Footer />
    </div>
  );
}