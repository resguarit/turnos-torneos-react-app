import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, UserPlus } from "lucide-react";
import api from "@/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import BackButton from "@/components/BackButton";

export default function CargarJugadores() {
  const [jugadores, setJugadores] = useState([
    { nombre: "", apellido: "", dni: "", telefono: "", fecha_nacimiento: "" }
  ]);
  const [loading, setLoading] = useState(false);

  // Agregar fila vacía
  const handleAddJugador = () => {
    setJugadores([
      ...jugadores,
      { nombre: "", apellido: "", dni: "", telefono: "", fecha_nacimiento: "" }
    ]);
  };

  // Eliminar fila
  const handleRemoveJugador = (idx) => {
    setJugadores(jugadores.filter((_, i) => i !== idx));
  };

  // Editar campo de jugador
  const handleChange = (idx, field, value) => {
    setJugadores(jugadores.map((j, i) => i === idx ? { ...j, [field]: value } : j));
  };

  // Enviar todos los jugadores
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validar que todos los campos estén completos
    for (const jugador of jugadores) {
      if (!jugador.nombre || !jugador.apellido || !jugador.dni || !jugador.fecha_nacimiento) {
        toast.error("Completa todos los campos obligatorios de cada jugador");
        return;
      }
    }
    setLoading(true);
    try {
      // Usar la nueva ruta para crear jugadores múltiples sin equipo
      await api.post("/jugadores/multiple-sin-equipo", { jugadores });
      toast.success("Jugadores cargados correctamente");
      setJugadores([{ nombre: "", apellido: "", dni: "", telefono: "", fecha_nacimiento: "" }]);
    } catch (err) {
      if (err.response?.data?.errors) {
        // Mostrar errores de validación específicos
        const errores = err.response.data.errors;
        Object.values(errores).forEach(msgs => {
          msgs.forEach(msg => toast.error(msg));
        });
      } else {
        toast.error("Error al cargar jugadores");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <ToastContainer position="top-right" />
      <main className="flex-1  items-center justify-center p-6 bg-gray-100">
        <BackButton ruta={'/ver-jugadores'}/>
        <div className="flex justify-center items-center w-full">
        <div className="bg-white shadow rounded-[8px] p-6 w-full max-w-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <UserPlus /> Cargar Jugadores
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 mb-4">
                <thead className="bg-black text-sm text-white">
                  <tr>
                    <th className="py-2 px-3">Nombre</th>
                    <th className="py-2 px-3">Apellido</th>
                    <th className="py-2 px-3">DNI</th>
                    <th className="py-2 px-3">Teléfono</th>
                    <th className="py-2 px-3">Fecha Nac.</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {jugadores.map((jugador, idx) => (
                    <tr key={idx} className="border-b">
                      <td>
                        <input
                          type="text"
                          className="border bg-gray-100 rounded p-1 w-full"
                          value={jugador.nombre}
                          onChange={e => handleChange(idx, "nombre", e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="border bg-gray-100  rounded p-1 w-full"
                          value={jugador.apellido}
                          onChange={e => handleChange(idx, "apellido", e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="border bg-gray-100  rounded p-1 w-full"
                          value={jugador.dni}
                          onChange={e => handleChange(idx, "dni", e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="border bg-gray-100 rounded p-1 w-full"
                          value={jugador.telefono}
                          onChange={e => handleChange(idx, "telefono", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="border bg-gray-100  rounded p-1 w-full"
                          value={jugador.fecha_nacimiento}
                          onChange={e => handleChange(idx, "fecha_nacimiento", e.target.value)}
                          required
                        />
                      </td>
                      <td >
                        {jugadores.length > 1 && (
                          <button
                            type="button"
                            className="text-red-600  hover:text-red-800"
                            onClick={() => handleRemoveJugador(idx)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="bg-green-600 text-sm flex items-center py-2 px-3 rounded-[6px] hover:bg-green-700 text-white"
                onClick={handleAddJugador}
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar Jugador
              </button>
              <button
                type="submit"
                className="bg-blue-500 flex text-sm items-center py-2 px-3 rounded-[6px] hover:bg-blue-500/80 text-white"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Cargar Todos los Jugadores"}
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}