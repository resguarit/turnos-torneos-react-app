import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, ChevronLeft, Edit3, Trash2, Shuffle, Calendar } from 'lucide-react';
import CarruselFechas from './CarruselFechas';
import Grupos from './Grupos';
import ArañaEliminacion from './ArañaEliminacion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function DetalleZona() {
  const { zonaId } = useParams();
  const [zona, setZona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechas, setFechas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [gruposCreados, setGruposCreados] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [numGrupos, setNumGrupos] = useState(1);
  const [fechasSorteadas, setFechasSorteadas] = useState(false);
  const [fechaInicial, setFechaInicial] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchZona = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/zonas/${zonaId}`);
        setZona(response.data);
        console.log(response.data);
        if (response.data.formato === 'Grupos') {
          const gruposResponse = await api.get(`/zonas/${zonaId}/grupos`);
          setGrupos(gruposResponse.data);
          setGruposCreados(gruposResponse.data.length > 0);
        }
        if (response.data.equipos.length > 0 && response.data.fechas_sorteadas) {
          const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`);
          setFechas(fechasResponse.data);
          setFechasSorteadas(true); // Establecer fechasSorteadas en true si ya hay fechas cargadas
        }
      } catch (error) {
        console.error('Error fetching zone details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZona();
  }, [zonaId]);

  // Cerrar el calendario al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortearFechas = async () => {
    if (!fechaInicial) {
      toast.error('Por favor, selecciona una fecha inicial.');
      return; // No permitir sortear sin fecha inicial
    }
  
    try {
      setLoading(true);
  
      // Formatear la fecha inicial al formato esperado por el backend
      const formattedFechaInicial = format(fechaInicial, 'yyyy-MM-dd');
  
      const requestData = {
        ...(zona.formato === 'Grupos' ? { num_grupos: numGrupos } : {}),
        fecha_inicial: formattedFechaInicial, // Incluir la fecha inicial en la solicitud
      };
  
      console.log('Datos enviados al backend:', requestData); // Debug para verificar los datos enviados
  
      const response = await api.post(`/zonas/${zonaId}/fechas`, requestData);
  
      if (response.status === 201) {
        setFechas(response.data.fechas);
        setFechasSorteadas(true);
        toast.success('Fechas sorteadas correctamente.');
      }
    } catch (error) {
      console.error('Error al sortear fechas:', error);
      toast.error('Error al sortear las fechas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearGrupos = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/zonas/${zonaId}/crear-grupos`, { num_grupos: numGrupos });
      if (response.status === 201) {
        setGrupos(response.data.grupos);
        setGruposCreados(true);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error creating groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarEquipo = async (equipoId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/equipos/${equipoId}`);
      if (response.status === 200) {
        setZona({
          ...zona,
          equipos: zona.equipos.filter((equipo) => equipo.id !== equipoId),
        });
        // Eliminar los grupos y actualizar el estado
        for (const grupo of grupos) {
          await api.delete(`/grupo/${grupo.id}`);
        }
        setGrupos([]);
        setGruposCreados(false);
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
            <div className='w-full flex items-center justify-between'>
              <h2 className="text-2xl font-medium">Equipos</h2>
            </div>
            <div className="mt-4">
              {zona.equipos && zona.equipos.length === 0 ? (
                <p className="text-center text-gray-500">No hay equipos en esta zona.</p>
              ) : (
                <div className="overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow">
                  <div className="max-h-[300px] overflow-y-auto"> {/* Limitar la altura y permitir scroll */}
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
                                  className="bg-green-500 hover:bg-blue-600 text-white py-1 px-3 rounded-[6px] text-sm"
                                >
                                  Ver jugadores
                                </button>
                                <button
                                  onClick={() => navigate(`/editar-equipo/${equipo.id}`)}
                                  className="items-center flex-row text-blue-500 py-1 text-sm"
                                >
                                  <Edit3 className="w-5" />
                                </button>
                                <button
                                  onClick={() => handleEliminarEquipo(equipo.id)}
                                  className="text-red-500 py-1 rounded-[6px] text-sm"
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
                </div>
              )}
            </div>
          </div>
          {zona.formato === 'Grupos' && (
            <div className="mt-6">
              <Grupos zonaId={zonaId} />
            </div>
          )}
          <div className="mt-6">
            {zona.formato === 'Grupos' && !gruposCreados && zona.equipos.length > 0 && (
              <button
                onClick={() => setModalVisible(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-[6px] text-sm"
              >
                Crear Grupos
              </button>
            )}
            {((zona.formato === 'Grupos' && gruposCreados) || (zona.formato !== 'Grupos' && zona.equipos.length > 2)) && (
              <div className="mt-6 flex gap-2 items-center">
                {/* Botón para seleccionar fecha inicial */}
                <div className="relative" ref={calendarRef}>
                  <button
                    onClick={() => setCalendarOpen(!calendarOpen)}
                    className="py-2 px-3 flex items-center gap-2 rounded-[6px] text-sm bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {fechaInicial
                      ? format(fechaInicial, "d 'de' MMMM yyyy", { locale: es })
                      : 'Inicio de Fecha'}{' '}
                    <Calendar size={18} />
                  </button>

                  {calendarOpen && (
                    <div
                      className="absolute z-50 bg-white shadow-lg rounded-md p-2 border"
                      style={{
                        top: '-200px', // Ajusta la posición hacia arriba
                        right: '0', // O usa `left: 0` para alinearlo a la izquierda
                      }}
                    >
                      <DayPicker
                        mode="single"
                        selected={fechaInicial}
                        onSelect={(date) => {
                          setFechaInicial(date);
                          setCalendarOpen(false);
                        }}
                        locale={es}
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Botón para sortear fechas */}
                <button
                  onClick={handleSortearFechas}
                  className={`py-2 px-3 flex items-center gap-2 rounded-[6px] text-sm ${
                    !fechaInicial || loading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  disabled={!fechaInicial || loading}
                >
                  {loading ? 'Sorteando...' : 'Sortear Fechas'} <Shuffle size={18} />
                </button>
              </div>
            )}
            {((zona.formato === 'Grupos' && gruposCreados) || (zona.formato !== 'Grupos' && zona.equipos.length > 1)) && (
              <CarruselFechas zonaId={zonaId} equipos={zona.equipos} fechas={fechas} />
            )}
            {(zona.formato === 'Eliminatoria' ) && (
            <ArañaEliminacion fechaId={zona.fechas[0].id} />
          )  
            }
          </div>
        </div>
      </main>
      <Footer />

      
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Crear Grupos</h2>
            <label className="block mb-2">
              Cantidad de Grupos:
              <input
                type="number"
                min="1"
                value={numGrupos}
                onChange={(e) => setNumGrupos(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </label>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearGrupos}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}