import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function CargarEquipo({ onEquipoSeleccionado }) {
  const { zonaId } = useParams();
  const [searchParams] = useSearchParams();
  const equipoToReplace = searchParams.get('reemplazar');
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoEquipo, setNuevoEquipo] = useState('');
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);

  const fetchEquipos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipos/exclude-zona/${zonaId}`);
      setEquipos(response.data);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, [zonaId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEquipos([]);
      return;
    }

    const filtered = equipos.filter((equipo) =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEquipos(filtered);
  }, [searchTerm, equipos]);

  const handleSeleccionarEquipo = (equipoId) => {
    setEquiposSeleccionados(prev => {
      if (prev.includes(equipoId)) {
        return prev.filter(id => id !== equipoId);
      } else {
        return [...prev, equipoId];
      }
    });
  };

  const handleAgregarNuevoEquipo = async () => {
    if (!nuevoEquipo.trim()) {
      toast.error('El nombre del equipo no puede estar vacío.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/equipos', {
        nombre: nuevoEquipo
      });

      if (response.status === 201) {
        const equipoCreado = response.data.equipo;
        setEquipos(prev => [...prev, equipoCreado]);
        setEquiposSeleccionados(prev => [...prev, equipoCreado.id]);
        setNuevoEquipo('');
        toast.success('Equipo creado correctamente');
      }
    } catch (error) {
      console.error('Error al crear el equipo:', error);
      toast.error(error.response?.data?.message || 'Error al crear el equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCambios = async () => {
    if (equiposSeleccionados.length === 0) {
      toast.error('Debes seleccionar al menos un equipo');
      return;
    }

    try {
      setLoading(true);

      // Asignar todos los equipos a la zona
      const response = await api.post(`/zonas/${zonaId}/equipos`, {
        equipo_ids: equiposSeleccionados
      });

      if (response.status === 200) {
        toast.success('Equipos agregados a la zona correctamente.');
        navigate(`/detalle-zona/${zonaId}`);
      }
    } catch (error) {
      console.error('Error al guardar los equipos:', error);
      toast.error(error.response?.data?.message || 'Error al guardar los equipos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gray-100">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <BackButton />
        <h1 className="text-2xl font-bold mb-6 lg:text-4xl">
          Cargar Equipos
        </h1>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Búsqueda y creación de equipos */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Buscar o crear equipos</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Escribe el nombre del equipo"
                    className="w-full p-2 border rounded-md"
                    disabled={loading}
                  />
                </div>

                {/* Input para nuevo equipo */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={nuevoEquipo}
                    onChange={(e) => setNuevoEquipo(e.target.value)}
                    placeholder="Nombre del nuevo equipo"
                    className="w-full p-2 border rounded-md"
                    disabled={loading}
                  />
                  <button
                    onClick={handleAgregarNuevoEquipo}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    disabled={loading || !nuevoEquipo.trim()}
                  >
                    Crear
                  </button>
                </div>

                {loading && <p className="text-center">Cargando equipos...</p>}

                {filteredEquipos.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-bold mb-2">Equipos encontrados:</h3>
                    <div className="max-h-[150px] overflow-y-auto pr-2 border border-gray-200 rounded-md">
                      <ul className="list-none pl-0">
                        {filteredEquipos.map((equipo) => (
                          <li
                            key={equipo.id}
                            className="text-gray-700 flex justify-between items-center py-2 px-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={equiposSeleccionados.includes(equipo.id)}
                                onChange={() => handleSeleccionarEquipo(equipo.id)}
                                className="mr-2"
                              />
                              <span className="font-medium">{equipo.nombre}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de equipos seleccionados */}
              {equiposSeleccionados.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Equipos seleccionados:</h2>
                  <ul className="space-y-2">
                    {equiposSeleccionados.map(id => {
                      const equipo = equipos.find(e => e.id === id);
                      return (
                        <li key={id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                          <span className="font-medium">{equipo?.nombre}</span>
                          <button
                            onClick={() => handleSeleccionarEquipo(id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    onClick={handleGuardarCambios}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}