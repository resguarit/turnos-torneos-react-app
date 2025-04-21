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
  const [modoOperacion, setModoOperacion] = useState(null);
  const [equipoAReemplazar, setEquipoAReemplazar] = useState(null);

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
    
    // Si hay un equipo para reemplazar, obtener sus datos
    if (equipoToReplace) {
      fetchEquipoAReemplazar(equipoToReplace);
    }
  }, [zonaId, equipoToReplace]);

  const fetchEquipoAReemplazar = async (equipoId) => {
    try {
      const response = await api.get(`/equipos/${equipoId}`);
      setEquipoAReemplazar(response.data);
    } catch (error) {
      console.error('Error al cargar el equipo a reemplazar:', error);
      toast.error('Error al cargar el equipo a reemplazar');
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEquipos([]);
      return;
    }

    const filtered = equipos.filter((equipo) =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEquipos(filtered);
    
    // Si hay resultados y escribimos en el buscador, activar el modo selección
    if (filtered.length > 0) {
      setModoOperacion('seleccion');
    }
  }, [searchTerm, equipos]);

  const handleAgregarEquipoAZona = async (equipoId) => {
    try {
      setLoading(true);
      setModoOperacion('seleccion');

      if (equipoToReplace) {
        // Si estamos reemplazando un equipo
        const response = await api.post(`/zonas/${zonaId}/reemplazar-equipo`, {
          equipo_viejo_id: equipoToReplace,
          equipo_nuevo_id: equipoId
        });
        
        if (response.status === 200) {
          toast.success('Equipo reemplazado correctamente');
          navigate(`/detalle-zona/${zonaId}`);
        }
      } else {
        const equipoSeleccionado = equipos.find((equipo) => equipo.id === equipoId);

        if (!equipoSeleccionado) {
          toast.error('Equipo no encontrado.');
          return;
        }

        const response = await api.put(`/equipos/${equipoId}`, {
          nombre: equipoSeleccionado.nombre,
          zona_id: zonaId,
        });

        if (response.status === 200) {
          toast.success('Equipo agregado a la zona correctamente.');
          
          // Navegar de vuelta a la página de detalles de la zona
          navigate(`/detalle-zona/${zonaId}`);
        } else {
          throw new Error('Error al agregar el equipo a la zona');
        }
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message || error);
      toast.error(equipoToReplace ? 'Error al reemplazar el equipo' : 'Error al agregar el equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoEquipo = async () => {
    if (!nuevoEquipo.trim()) {
      toast.error('El nombre del equipo no puede estar vacío.');
      return;
    }

    try {
      setLoading(true);
      setModoOperacion('creacion');
      console.log('zonaId:', zonaId); 
      
      // Crear el equipo directamente con el ID de la zona actual
      const response = await api.post('/equipos', { 
        nombre: nuevoEquipo, 
        zona_id: zonaId 
      });
      
      if (response.status === 201) {
        const equipoCreado = response.data.equipo;
        
        if (equipoToReplace) {
          // Si estamos reemplazando un equipo
          const replaceResponse = await api.post(`/zonas/${zonaId}/reemplazar-equipo`, {
            equipo_viejo_id: equipoToReplace,
            equipo_nuevo_id: equipoCreado.id
          });
          
          if (replaceResponse.status === 200) {
            toast.success('Equipo creado y reemplazado correctamente');
            navigate(`/detalle-zona/${zonaId}`);
          }
        } else {
          // Equipo creado directamente en la zona, mostrar éxito y redirigir
          toast.success('Equipo creado y agregado a la zona correctamente.');
          navigate(`/detalle-zona/${zonaId}`);
        }
      }
    } catch (error) {
      console.error('Error al crear equipo:', error);
      toast.error(error.response?.data?.message || 'Error al crear el equipo');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar la operación actual
  const handleCancelar = () => {
    setModoOperacion(null);
    setSearchTerm('');
    setNuevoEquipo('');
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gray-100">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <BackButton />
        <h1 className="text-2xl font-bold mb-6 lg:text-4xl">
          {equipoToReplace ? 'Reemplazar Equipo' : 'Cargar Equipo'}
        </h1>
        
        {equipoToReplace && equipoAReemplazar && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-yellow-700">
              Estás a punto de reemplazar el equipo <strong>{equipoAReemplazar.nombre}</strong>. 
              El nuevo equipo heredará todos los partidos y asignaciones del equipo actual.
            </p>
          </div>
        )}
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Sección de búsqueda */}
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-1">
                  Nombre del Equipo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.trim() === '') {
                        // Si se limpia este campo, permitir escritura en el otro campo
                        setModoOperacion(null);
                      }
                    }}
                    placeholder="Escribe el nombre del equipo"
                    className="w-full p-2 border rounded-md"
                    disabled={loading || modoOperacion === 'creacion'}
                  />
                  {modoOperacion === 'seleccion' && ( // Modificado: ahora solo aparece en modo selección
                    <button
                      onClick={handleCancelar}
                      className="p-2 bg-red-500 text-white rounded-md"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
  
              {loading && <p className="text-center">Cargando equipos...</p>}
  
              {/* Lista de equipos encontrados */}
              {filteredEquipos.length > 0 && modoOperacion !== 'creacion' && (
                <div className="mt-4">
                  <h2 className="text-md font-bold mb-2">Equipos encontrados:</h2>
                  <div className="max-h-[150px] overflow-y-auto pr-2 border border-gray-200 rounded-md">
                    <ul className="list-none pl-0">
                      {filteredEquipos.map((equipo) => (
                        <li
                          key={equipo.id}
                          className="text-gray-700 flex justify-between items-center py-2 px-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >
                          <span className="font-medium">{equipo.nombre}</span>
                          <button
                            onClick={() => handleAgregarEquipoAZona(equipo.id)}
                            className={`ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                          >
                            {loading ? 'Procesando...' : 'Seleccionar'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
  
              {searchTerm && filteredEquipos.length === 0 && !loading && modoOperacion !== 'creacion' && (
                <p className="text-red-500 text-center">
                  No se encontraron equipos con ese nombre.
                </p>
              )}
  
              {/* Sección para agregar nuevo equipo */}
              <div className={`mt-6 ${modoOperacion === 'seleccion' ? 'opacity-50' : ''}`}>
                <h2 className="text-lg font-semibold mb-2">Agregar Nuevo Equipo</h2>
                <input
                  type="text"
                  value={nuevoEquipo}
                  onChange={(e) => {
                    setNuevoEquipo(e.target.value);
                    if (e.target.value.trim() !== '') {
                      setModoOperacion('creacion');
                    } else if (e.target.value.trim() === '') {
                      // Solo resetear el modo si no hay texto en el campo de búsqueda
                      if (!searchTerm.trim()) {
                        setModoOperacion(null);
                      }
                    }
                  }}
                  placeholder="Nombre del nuevo equipo"
                  className="w-full p-2 border rounded-md mb-2"
                  disabled={loading || (modoOperacion === 'seleccion' && searchTerm.trim() !== '')}
                />
                <button
                  onClick={handleNuevoEquipo}
                  className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full ${(loading || modoOperacion === 'seleccion') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading || modoOperacion === 'seleccion' || !nuevoEquipo.trim()}
                >
                  {loading ? 'Creando equipo...' : 'Crear Equipo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}