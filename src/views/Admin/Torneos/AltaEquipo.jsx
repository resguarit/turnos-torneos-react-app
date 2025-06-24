import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { normalize } from '@/utils/normalize'; 
import { Upload } from 'lucide-react';

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
  const [escudo, setEscudo] = useState(null);
  const [preview, setPreview] = useState(null);

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
      normalize(equipo.nombre).includes(normalize(searchTerm))
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

  // Manejar cambio de imagen
  const handleEscudoChange = (e) => {
    const file = e.target.files[0];
    setEscudo(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // Modifica la función para crear equipo para enviar la imagen
  const handleAgregarNuevoEquipo = async () => {
    if (!nuevoEquipo.trim()) {
      toast.error('El nombre del equipo no puede estar vacío.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('nombre', nuevoEquipo);
      if (escudo) formData.append('escudo', escudo);

      const response = await api.post('/equipos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201) {
        const equipoCreado = response.data.equipo;
        setEquipos(prev => [...prev, equipoCreado]);
        setEquiposSeleccionados(prev => [...prev, equipoCreado.id]);
        setNuevoEquipo('');
        setEscudo(null);
        setPreview(null);
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
        navigate(`/detalle-zona/${zonaId}?tab=equipos`);
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
      <main className="w-full  p-6 grow">
        <BackButton ruta={`/detalle-zona/${zonaId}?tab=equipos`}/>
        <div className="flex   flex-col w-full">
        <h1 className="text-2xl px-40 font-bold mb-6 lg:text-2xl">
          Cargar Equipos
        </h1>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-white p-6 rounded-[8px] shadow-md">
              {/* Búsqueda y creación de equipos */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Buscar o crear equipos</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Escribe el nombre del equipo"
                    className="w-full px-2 py-1 border rounded-[6px]"
                    disabled={loading}
                  />
                </div>

                {/* Input para nuevo equipo */}
                <div className="flex gap-2 mt-4 items-center">
                  <input
                    type="text"
                    value={nuevoEquipo}
                    onChange={(e) => setNuevoEquipo(e.target.value)}
                    placeholder="Nombre del nuevo equipo"
                    className="w-full px-2 py-1 border rounded-[6px]"
                    disabled={loading}
                  />
                  {/* Botón y campo para imagen */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="bg-gray-200 flex whitespace-nowrap gap-2 px-3 py-2 rounded text-sm items-center"><Upload size={16}/>Cargar escudo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEscudoChange}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                  <button
                    onClick={handleAgregarNuevoEquipo}
                    className="bg-green-500 text-white px-3 text-sm py-2 rounded hover:bg-green-600"
                    disabled={loading || !nuevoEquipo.trim()}
                  >
                    Crear
                  </button>
                </div>
                {/* Vista previa del escudo */}
                {preview && (
                  <div className="mt-2">
                    <img src={preview} alt="Vista previa escudo" className="h-16 object-contain border rounded" />
                  </div>
                )}

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
                  <p className="text-sm text-gray-600 mb-4">
                    Total: {equiposSeleccionados.length} equipo(s) seleccionado(s)
                  </p>
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
                    className="mt-4 bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 w-full"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}