import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ChevronLeft, PlusCircle, Trash2, Check, Save, Edit3 } from 'lucide-react';

export default function AltaEquipo() {
  const { zonaId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    zona_id: zonaId, // Obtener el zona_id de la URL
  });
  const [jugadores, setJugadores] = useState([]);
  const [jugadoresNuevos, setJugadoresNuevos] = useState([]);
  const [jugadorEditando, setJugadorEditando] = useState(null);
  const navigate = useNavigate();
  const tablaRef = useRef(null);

  const handleAddFilaJugador = () => {
    setJugadoresNuevos([...jugadoresNuevos, { id: Date.now(), nombre: '', apellido: '', dni: '', telefono: '', fecha_nacimiento: '' }]);
  };

  const handleInputChangeNuevo = (e, id, campo) => {
    const valor = e.target.value;
    setJugadoresNuevos(jugadoresNuevos.map((jugador) => (jugador.id === id ? { ...jugador, [campo]: valor } : jugador)));
  };

  const handleInputChange = (e, id, campo) => {
    const valor = e.target.value;
    setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...jugador, [campo]: valor } : jugador)));
  };

  const handleGuardarJugadores = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/equipos/${formData.zona_id}/jugadores/multiple`, { jugadores: jugadoresNuevos, equipo_id: formData.zona_id });
      if (response.status === 201) {
        setJugadores([...jugadores, ...response.data.jugadores]);
        setJugadoresNuevos([]);
      }
    } catch (error) {
      console.error('Error adding players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarJugador = async (id) => {
    const jugador = jugadores.find((jugador) => jugador.id === id);
    try {
      setLoading(true);
      const response = await api.put(`/jugadores/${id}`, { ...jugador, equipo_id: formData.zona_id });
      if (response.status === 200) {
        setJugadores(jugadores.map((jugador) => (jugador.id === id ? { ...response.data.jugador, editando: false } : jugador)));
        setJugadorEditando(null);
      }
    } catch (error) {
      console.error('Error updating player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarJugador = (id) => {
    setJugadorEditando(id);
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
          try {
            const jugadoresResponses = await Promise.all(
              jugadores.map((jugador) =>
                api.post('/jugadores', { ...jugador, equipo_id: equipoId })
              )
            );
            alert('Equipo y jugadores guardados correctamente');
            navigate(`/detalle-zona/${zonaId}`);
          } catch (error) {
            console.error('Error guardando jugadores:', error);
            // Eliminar el equipo si falla la creación de jugadores
            await api.delete(`/equipos/${equipoId}`);
            alert('Error guardando jugadores. El equipo no se ha guardado.');
          }
        } else {
          alert('Equipo guardado correctamente');
          navigate(`/detalle-zona/${zonaId}`);
        }
      }
    } catch (error) {
      console.error('Error guardando equipo:', error);
      // Eliminar los jugadores creados si falla la creación del equipo
      if (jugadores.length > 0) {
        try {
          await Promise.all(
            jugadores.map((jugador) =>
              api.delete(`/jugadores/${jugador.id}`)
            )
          );
        } catch (deleteError) {
          console.error('Error eliminando jugadores:', deleteError);
        }
      }
      alert('Error guardando equipo');
    } finally {
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
                      {jugadores.map((jugador) => (
                        <tr key={jugador.id} className="border-b">
                          <td className="py-2">
                            {jugadorEditando === jugador.id ? (
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
                            {jugadorEditando === jugador.id ? (
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
                            {jugadorEditando === jugador.id ? (
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
                            {jugadorEditando === jugador.id ? (
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
                            {jugadorEditando === jugador.id ? (
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
                          <td className="py-2 text-center flex">
                            {jugadorEditando === jugador.id ? (
                              <button
                                onClick={() => handleActualizarJugador(jugador.id)}
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
                                <Edit3 className="h-5 w-5" />
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
                      ))}
                      {jugadoresNuevos.map((jugador) => (
                        <tr key={jugador.id} className="border-b">
                          <td className="py-2">
                            <input
                              value={jugador.nombre}
                              onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'nombre')}
                              placeholder="Nombre"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              value={jugador.apellido}
                              onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'apellido')}
                              placeholder="Apellido"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              value={jugador.dni}
                              onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'dni')}
                              placeholder="DNI"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              value={jugador.telefono}
                              onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'telefono')}
                              placeholder="Teléfono"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="date"
                              value={jugador.fecha_nacimiento}
                              onChange={(e) => handleInputChangeNuevo(e, jugador.id, 'fecha_nacimiento')}
                              placeholder="Fecha de Nacimiento"
                              className="p-1 text-sm border border-black w-full rounded-[6px]"
                            />
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => setJugadoresNuevos(jugadoresNuevos.filter((j) => j.id !== jugador.id))}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="6" className="text-end py-2">
                          <button
                            onClick={handleAddFilaJugador}
                            className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white"
                          >
                            + Agregar Jugador
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {jugadoresNuevos.length > 0 && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleGuardarJugadores}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-[6px] text-sm"
                      >
                        Guardar Jugadores
                      </button>
                    </div>
                  )}
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