import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BtnLoading from '@/components/BtnLoading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Star, Users, ChevronLeft, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useTorneos } from '@/context/TorneosContext';
import api from '@/lib/axiosConfig';
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal';

export default function Zonas() {
  const { torneoId } = useParams();
  const { torneos, setTorneos } = useTorneos();
  const [loading, setLoading] = useState(false);
  const [zonaToDelete, setZonaToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zonaIdFinalizar, setZonaIdFinalizar] = useState(null);
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false);
  const [searchYear, setSearchYear] = useState('');
  const navigate = useNavigate();

  // Buscar el torneo y sus zonas desde el contexto
  const torneo = torneos.find(t => String(t.id) === String(torneoId));
  const zonas = torneo?.zonas || [];

  // Procesar zonas para agregar siguienteFecha (como antes)
  const zonasConFecha = zonas.map(zona => {
    const siguienteFecha = zona.fechas?.find(fecha => fecha.estado === 'Pendiente');
    return { 
      ...zona, 
      siguienteFecha: siguienteFecha 
        ? format(parseISO(siguienteFecha.fecha_inicio), "EEE, dd/MM/yyyy", { locale: es }) 
        : 'No disponible' 
    };
  });

  // FILTRO: solo zonas activas por defecto, o todas las que coincidan con el año si hay búsqueda
  const zonasFiltradas = searchYear
    ? zonasConFecha.filter(z => String(z.año).includes(searchYear))
    : zonasConFecha.filter(z => z.activo === 1 || z.activo === true);

  const handleDeleteZona = async (zonaId) => {
    try {
      setLoading(true);
      // Aquí sí haces el delete al backend
      const response = await api.delete(`/zonas/${zonaId}`);
      if (response.status === 200) {
        // Actualiza el contexto eliminando la zona del torneo correspondiente
        const nuevosTorneos = torneos.map(t => {
          if (String(t.id) === String(torneoId)) {
            return {
              ...t,
              zonas: t.zonas.filter(z => z.id !== zonaId)
            };
          }
          return t;
        });
        setTorneos(nuevosTorneos);
        setShowDeleteModal(false);
        toast.success('Zona eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar la zona:', error);
      toast.error('Error al eliminar la zona');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (zona) => {
    setZonaToDelete(zona);
    setShowDeleteModal(true);
  };

  // Finalizar zona
  const finalizarZona = async (zonaId) => {
    try {
      setLoading(true);
      const response = await api.put(`/zonas/${zonaId}`, { activo: false });
      if (response.data.status === 200) {
        // Actualiza el contexto eliminando la zona activa
        const nuevosTorneos = torneos.map(t => {
          if (String(t.id) === String(torneoId)) {
            return {
              ...t,
              zonas: t.zonas.map(z =>
                z.id === zonaId ? { ...z, activo: false } : z
              ),
            };
          }
          return t;
        });
        setTorneos(nuevosTorneos);
        setModalFinalizarOpen(false);
        toast.success('Zona finalizada correctamente');
      } else {
        toast.error(response.data.message || 'Error al finalizar la zona');
      }
    } catch (error) {
      toast.error('Error al finalizar la zona');
    } finally {
      setLoading(false);
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
        <div className="w-full flex mb-4">
          <button onClick={() => navigate('/torneos-admi')} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-2xl font-bold">Zonas del Torneo <span className='text-blue-600'>{torneo.nombre}</span></h1>
            <button onClick={() => navigate(`/alta-zona/${torneoId}`)} className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white">
              + Nueva Zona
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
          {zonasFiltradas.length === 0 ? (
            <p className="text-center text-gray-500">No se encontraron zonas {searchYear ? `para el año ${searchYear}` : 'activas'}.</p>
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
                    <div className="flex mt-4 gap-3 text-sm justify-center">
                      <button onClick={() => navigate(`/detalle-zona/${zona.id}`)} className="flex-1 border text-center border-gray-300 p-1 hover:bg-naranja hover:text-white" style={{ borderRadius: '8px' }}>Ver Detalles</button>
                      <button
                        onClick={() => navigate(`/editar-zona/${zona.id}`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(zona)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => {
                          setZonaIdFinalizar(zona.id);
                          setModalFinalizarOpen(true);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                        disabled={zona.activo === false}
                      >
                        Finalizar
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar la zona <strong>{zonaToDelete?.nombre}</strong>? 
              Esta acción eliminará todos los equipos, grupos y fechas asociados a esta zona.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteZona(zonaToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para finalizar zona */}
      {modalFinalizarOpen && (
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
        />
      )}
      <Footer />
    </div>
  );
}