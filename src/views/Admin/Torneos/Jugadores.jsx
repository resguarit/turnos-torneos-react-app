import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ChevronLeft, PlusCircle, Trash2, Check } from 'lucide-react';

export default function Jugadores() {
  const { equipoId } = useParams();
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jugadorFormData, setJugadorFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    fecha_nacimiento: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/equipos/${equipoId}/jugadores`);
        setJugadores(response.data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJugadores();
  }, [equipoId]);

  const handleAddJugador = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/jugadores', { ...jugadorFormData, equipo_id: equipoId });
      if (response.status === 201) {
        setJugadores([...jugadores, response.data.jugador]);
        setJugadorFormData({
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          fecha_nacimiento: '',
        });
      }
    } catch (error) {
      console.error('Error adding player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarJugador = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/jugadores/${id}`);
      setJugadores(jugadores.filter((jugador) => jugador.id !== id));
    } catch (error) {
      console.error('Error deleting player:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button onClick={() => navigate(-1)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-2xl font-bold">Jugadores del Equipo</h1>
            <button
              onClick={() => navigate(`/alta-jugador/${equipoId}`)}
              className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white"
            >
              + Agregar Jugador
            </button>
          </div>
          <Card className="bg-white rounded-[8px] shadow-md mb-6">
            <CardHeader className="w-full p-4 bg-gray-200 rounded-t-[8px]">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información del Jugador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleAddJugador}>
                <div>
                  <Label htmlFor="nombreJugador" className="text-sm font-medium">
                    Nombre
                  </Label>
                  <Input
                    id="nombreJugador"
                    value={jugadorFormData.nombre}
                    onChange={(e) => setJugadorFormData({ ...jugadorFormData, nombre: e.target.value })}
                    placeholder="Ingrese el nombre del jugador"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellidoJugador" className="text-sm font-medium">
                    Apellido
                  </Label>
                  <Input
                    id="apellidoJugador"
                    value={jugadorFormData.apellido}
                    onChange={(e) => setJugadorFormData({ ...jugadorFormData, apellido: e.target.value })}
                    placeholder="Ingrese el apellido del jugador"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dniJugador" className="text-sm font-medium">
                    DNI
                  </Label>
                  <Input
                    id="dniJugador"
                    value={jugadorFormData.dni}
                    onChange={(e) => setJugadorFormData({ ...jugadorFormData, dni: e.target.value })}
                    placeholder="Ingrese el DNI del jugador"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefonoJugador" className="text-sm font-medium">
                    Teléfono
                  </Label>
                  <Input
                    id="telefonoJugador"
                    value={jugadorFormData.telefono}
                    onChange={(e) => setJugadorFormData({ ...jugadorFormData, telefono: e.target.value })}
                    placeholder="Ingrese el teléfono del jugador"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fechaNacimientoJugador" className="text-sm font-medium">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    type="date"
                    id="fechaNacimientoJugador"
                    value={jugadorFormData.fecha_nacimiento}
                    onChange={(e) => setJugadorFormData({ ...jugadorFormData, fecha_nacimiento: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-black hover:bg-black/80 p-3 text-sm font-inter rounded-[6px] text-white"
                    disabled={loading}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Agregar Jugador
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="bg-white rounded-[8px] shadow-md p-4">
            <h2 className="text-2xl font-medium mb-4">Lista de Jugadores</h2>
            {jugadores.length === 0 ? (
              <p className="text-center text-gray-500">No hay jugadores en este equipo.</p>
            ) : (
              <ul className="space-y-4">
                {jugadores.map((jugador) => (
                  <li key={jugador.id} className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                      <p className="text-lg font-medium">{jugador.nombre} {jugador.apellido}</p>
                      <p className="text-sm text-gray-500">DNI: {jugador.dni}</p>
                      <p className="text-sm text-gray-500">Teléfono: {jugador.telefono}</p>
                      <p className="text-sm text-gray-500">Fecha de Nacimiento: {jugador.fecha_nacimiento}</p>
                    </div>
                    <button
                      onClick={() => handleEliminarJugador(jugador.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}