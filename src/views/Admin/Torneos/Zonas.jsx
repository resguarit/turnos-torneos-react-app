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

export default function Zonas() {
  const { torneoId } = useParams();
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}