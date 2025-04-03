import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Star, Users, ChevronLeft, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

export default function Zonas() {
  const { torneoId } = useParams();
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zonaToDelete, setZonaToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/torneos/${torneoId}/zonas`);
        console.log('Datos de las zonas:', response.data); // Agrega este log
        const zonasConFecha = response.data.map(zona => {
          const siguienteFecha = zona.fechas?.find(fecha => fecha.estado === 'Pendiente');
          return { 
            ...zona, 
            siguienteFecha: siguienteFecha 
              ? format(parseISO(siguienteFecha.fecha_inicio), "EEE, dd/MM/yyyy", { locale: es }) 
              : 'No disponible' 
          };
        });
        setZonas(zonasConFecha);
      } catch (error) {
        console.error('Error fetching zones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZonas();
  }, [torneoId]);

  const handleDeleteZona = async (zonaId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/zonas/${zonaId}`);
      
      if (response.status === 200) {
        setZonas(zonas.filter(zona => zona.id !== zonaId));
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
            <h1 className="text-2xl lg:text-2xl font-bold">Zonas del Torneo</h1>
            <button onClick={() => navigate(`/alta-zona/${torneoId}`)} className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white">
              + Nueva Zona
            </button>
          </div>
          {zonas.length === 0 ? (
            <p className="text-center text-gray-500">No hay zonas disponibles.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zonas.map((zona) => (
                <Card className="bg-white rounded-[8px] shadow-md" key={zona.id} >
                  <CardHeader className="w-full p-4 bg-gray-200 rounded-t-[8px]">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-medium">{zona.nombre} {zona.año}</h2>
                      <span className="text-gray-500 lg:text-lg"> <Star /></span>
                    </div>
                    {zona.formato !== 'Grupos' && (
                    <p className="text-sm text-gray-500">{zona.formato} </p>
                      )
                    }
                    {zona.formato === 'Grupos' && (
                      <p className="text-sm text-gray-500">{zona.formato} ({zona.grupos.length})</p>
                    )
                    }
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
      <Footer />
    </div>
  );
}