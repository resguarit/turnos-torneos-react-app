import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ChevronLeft, PlusCircle, Trash2, Check, Save } from 'lucide-react';

export default function AltaEquipo() {
  const { zonaId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    zona_id: zonaId, // Obtener el zona_id de la URL
  });
  const [jugadores, setJugadores] = useState([]);
  const [jugadorFormData, setJugadorFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    fecha_nacimiento: '',
  });
  const navigate = useNavigate();
  const tablaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/equipos', formData);
      if (response.status === 201) {
        // Redirigir a /detalle-zona después de crear el equipo
        setLoading(false);
        navigate(`/detalle-zona/${zonaId}`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setLoading(false);
    }
  };

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

  const handleConfirmarJugador = (id) => {
    setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...jugador, editando: false } : jugador)));
  };

  const handleEditarJugador = (id) => {
    setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...jugador, editando: true } : jugador)));
  };

  const handleEliminarJugador = (id) => {
    setJugadores(jugadores.filter((jugador) => jugador.id !== id));
  };

  const handleGuardarEquipo = async () => {
    if (!formData.nombre.trim()) {
      alert('Debe ingresar un nombre para el equipo');
      return;
    }

    // Verificar que no haya jugadores en modo edición
    if (jugadores.some((j) => j.editando)) {
      alert('Debe confirmar todos los jugadores antes de guardar');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/equipos', { nombre: formData.nombre, zona_id: zonaId });
      if (response.status === 201) {
        const equipoId = response.data.equipo.id;
        if (jugadores.length > 0) {
          await Promise.all(
            jugadores.map((jugador) =>
              api.post('/jugadores', { ...jugador, equipo_id: equipoId })
            )
          );
        }
        setLoading(false);
        alert('Equipo guardado correctamente');
        navigate(`/detalle-zona/${zonaId}`);
      }
    } catch (error) {
      console.error('Error guardando equipo:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-col grow p-6 bg-gray-100 flex items-center ">
        <div className="w-full flex mb-2">
          <button onClick={() => navigate(`/detalle-zona/${zonaId}`)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <Card className="bg-white w-[70%] rounded-[8px] shadow-md mb-6">
          <CardHeader className="w-full p-4 rounded-t-[8px]">
            <h2 className="flex items-center gap-2 text-2xl  font-medium ">
              <Users className="h-5 w-5" />
              Información del Equipo
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col">
                <Label htmlFor="nombreEquipo" className="text-[17px] font-semibold">
                  Nombre del Equipo
                </Label>
                <input
                  id="nombreEquipo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ingrese el nombre del equipo"
                  className="mt-1 border border-gray-300 p-1 rounded-[6px] w-full"
                  required
                />
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[17px] font-semibold">Jugadores</h3>
                  <button
                    onClick={handleAddJugador}
                    className="flex items-center gap-1 bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Agregar Jugador
                  </button>
                </div>

                <div className="overflow-x-auto " ref={tablaRef}>
                  <table className="w-full border-collapse rounded-[8px]">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left text-sm">Nombre</th>
                        <th className="border border-gray-300 p-2 text-left text-sm">Apellido</th>
                        <th className="border border-gray-300 p-2 text-left text-sm">DNI</th>
                        <th className="border border-gray-300 p-2 text-left text-sm">Teléfono</th>
                        <th className="border border-gray-300 p-2 text-left text-sm">Fecha de Nacimiento</th>
                        <th className="border border-gray-300 p-2 text-center text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jugadores.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                            No hay jugadores agregados. Haga clic en "Agregar Jugador" para comenzar.
                          </td>
                        </tr>
                      ) : (
                        jugadores.map((jugador) => (
                          <tr key={jugador.id} className={jugador.editando ? 'bg-blue-50' : ''}>
                            <td className="border border-gray-300 px-4 py-2">
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
                            <td className="border border-gray-300 px-4 py-2">
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
                            <td className="border border-gray-300 px-4 py-2">
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
                            <td className="border border-gray-300 px-4 py-2">
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
                            <td className="border border-gray-300 px-4 py-2">
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
                            <td className="border flex justify-center border-gray-300 px-4 py-2 text-center">
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
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleGuardarEquipo}
                className="flex items-center gap-2 bg-black hover:bg-black/80 p-3 text-sm font-inter rounded-[6px] text-white"
                disabled={!formData.nombre || jugadores.some((j) => j.editando)}
              >
                <Save className="h-4 w-4" />
                Guardar Equipo
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}