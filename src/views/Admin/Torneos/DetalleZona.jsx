import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, ChevronLeft, Edit3, Trash2 } from 'lucide-react';
import CarruselFechas from './CarruselFechas';

export default function DetalleZona() {
  const { zonaId } = useParams();
  const [zona, setZona] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchZona = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/zonas/${zonaId}`);
        setZona(response.data);
      } catch (error) {
        console.error('Error fetching zone details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZona();
  }, [zonaId]);

  const handleEliminarEquipo = async (equipoId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/equipos/${equipoId}`);
      if (response.status === 200) {
        setZona({
          ...zona,
          equipos: zona.equipos.filter((equipo) => equipo.id !== equipoId),
        });
      }
    } catch (error) {
      console.error('Error deleting team:', error);
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

  if (!zona) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-center items-center h-full">
            <p className="text-center text-gray-500">No se encontraron detalles de la zona.</p>
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
        <div className="w-full flex mb-2">
          <button onClick={() => navigate(`/zonas-admi/${zona.torneo_id}`)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="w-full px-40">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-2xl font-bold">{zona.nombre} - {zona.año} <span className="text-sm text-gray-500 font-normal">({zona.formato})</span></h1>
            <button onClick={() => navigate(`/alta-equipo/${zonaId}`)} className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white">
              + Cargar Equipo
            </button>
          </div>
          <div className="bg-white rounded-[8px] shadow-md p-4">
            <h2 className="text-2xl font-medium">Equipos</h2>
            <div className="mt-4">
              {zona.equipos && zona.equipos.length === 0 ? (
                <p className="text-center text-gray-500">No hay equipos en esta zona.</p>
              ) : (
                <div className="overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow">
                  <table className="w-full">
                    <tbody>
                      {zona.equipos && zona.equipos.map((equipo) => (
                        <tr key={equipo.id} className="border-b items-center rounded-[6px] border-gray-200 last:border-0">
                          <td className="p-3 flex items-center">
                            <div className="w-6 bg-primary items-center justify-center"></div>
                            <span className="font-medium">{equipo.nombre}</span>
                          </td>
                          <td className="text-right p-3 items-center flex-row justify-center">
                            <div className='flex items-center w-full justify-end space-x-8'>
                              <button
                                onClick={() => navigate(`/jugadores/${equipo.id}`)}
                                className=" bg-green-500 hover:bg-blue-600 text-white py-1 px-3 rounded-[6px] text-sm"
                              >
                                Ver jugadores
                              </button>
                              <button
                                onClick={() => navigate(`/editar-equipo/${equipo.id}`)}
                                className=" items-center flex-row text-blue-500  py-1   text-sm"
                              >
                                <Edit3 className="w-5" />
                              </button>
                              <button
                                onClick={() => handleEliminarEquipo(equipo.id)}
                                className="text-red-500   py-1  rounded-[6px] text-sm"
                              >
                                <Trash2 className="w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <CarruselFechas zonaId={zonaId} equipos={zona.equipos} />
        </div>
      </main>
      <Footer />
    </div>
  );
}