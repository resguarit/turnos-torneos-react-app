import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { Input } from '@/components/ui/input';
import { ChevronLeft, PlusCircle, Trash2, Check } from 'lucide-react';
import BtnLoading from '@/components/BtnLoading';

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

  const handleAddJugador = () => {
    setJugadores([...jugadores, { ...jugadorFormData, id: Date.now(), editando: true }]);
    setJugadorFormData({
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      fecha_nacimiento: '',
    });
  };

  const handleInputChange = (e, id, campo) => {
    const valor = e.target.value;
    setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...jugador, [campo]: valor } : jugador)));
  };

  const handleConfirmarJugador = async (id) => {
    const jugador = jugadores.find((jugador) => jugador.id === id);
    try {
      setLoading(true);
      const response = await api.post('/jugadores', { ...jugador, equipo_id: equipoId });
      if (response.status === 201) {
        setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...response.data.jugador, editando: false } : jugador)));
      }
    } catch (error) {
      console.error('Error adding player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarJugador = (id) => {
    setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...jugador, editando: true } : jugador)));
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
      <main className="flex-1 grow p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button onClick={() => navigate(-1)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="px-40 justify-center">
          <div className="flex justify-end items-center mb-6">
            <button
              onClick={handleAddJugador}
              className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white"
            >
              + Agregar Jugador
            </button>
          </div>
          <div className="bg-white w-full rounded-[8px] shadow-md p-4">
            <h2 className="text-2xl font-medium mb-4">Lista de Jugadores</h2>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 text-left text-sm">Nombre</th>
                  <th className="py-2 text-left text-sm">Apellido</th>
                  <th className="py-2 text-left text-sm">DNI</th>
                  <th className="py-2 text-left text-sm">Teléfono</th>
                  <th className="py-2 text-left text-sm">Fecha de Nacimiento</th>
                  <th className="py-2 text-center text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">
                      No hay jugadores en este equipo.
                    </td>
                  </tr>
                ) : (
                  jugadores.map((jugador) => (
                    <tr key={jugador.id} className="border-b">
                      <td className="py-2">
                        {jugador.editando ? (
                          <input
                            value={jugador.nombre}
                            onChange={(e) => handleInputChange(e, jugador.id, 'nombre')}
                            placeholder="Nombre"
                            className="p-1 text-sm border border-black w-full rounded-[6px]"
                          />
                        ) : (
                          jugador.nombre
                        )}
                      </td>
                      <td className="py-2">
                        {jugador.editando ? (
                          <input
                            value={jugador.apellido}
                            onChange={(e) => handleInputChange(e, jugador.id, 'apellido')}
                            placeholder="Apellido"
                            className="p-1 text-sm border border-black w-full rounded-[6px]"
                          />
                        ) : (
                          jugador.apellido
                        )}
                      </td>
                      <td className="py-2">
                        {jugador.editando ? (
                          <input
                            value={jugador.dni}
                            onChange={(e) => handleInputChange(e, jugador.id, 'dni')}
                            placeholder="DNI"
                            className="p-1 text-sm border border-black w-full rounded-[6px]"
                          />
                        ) : (
                          jugador.dni
                        )}
                      </td>
                      <td className="py-2">
                        {jugador.editando ? (
                          <input
                            value={jugador.telefono}
                            onChange={(e) => handleInputChange(e, jugador.id, 'telefono')}
                            placeholder="Teléfono"
                            className="p-1 text-sm border border-black w-full rounded-[6px]"
                          />
                        ) : (
                          jugador.telefono
                        )}
                      </td>
                      <td className="py-2">
                        {jugador.editando ? (
                          <input
                            type="date"
                            value={jugador.fecha_nacimiento}
                            onChange={(e) => handleInputChange(e, jugador.id, 'fecha_nacimiento')}
                            placeholder="Fecha de Nacimiento"
                            className="p-1 text-sm border border-black w-full rounded-[6px]"
                          />
                        ) : (
                          jugador.fecha_nacimiento
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {jugador.editando ? (
                          <button
                            onClick={() => handleConfirmarJugador(jugador.id)}
                            className="p-1 text-green-600 hover:text-green-800 mr-2"
                            title="Confirmar"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditarJugador(jugador.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 mr-2"
                            title="Editar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminarJugador(jugador.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}