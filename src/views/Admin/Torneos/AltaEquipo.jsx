import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { useParams } from 'react-router-dom';

export default function CargarEquipo({ onEquipoSeleccionado }) {
  const { zonaId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoEquipo, setNuevoEquipo] = useState('');
  // Estado para controlar si estamos en modo selección o modo creación
  const [modoOperacion, setModoOperacion] = useState(null); // null, 'seleccion', 'creacion'

  const fetchEquipos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipos?excluirZona=${zonaId}`);
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
    
    // Si hay resultados y escribimos en el buscador, activar el modo selección
    if (filtered.length > 0) {
      setModoOperacion('seleccion');
    }
  }, [searchTerm, equipos]);

  const handleAgregarEquipoAZona = async (equipoId) => {
    try {
      setLoading(true);
      setModoOperacion('seleccion');

      const equipoSeleccionado = equipos.find((equipo) => equipo.id === equipoId);

      if (!equipoSeleccionado) {
        alert('Equipo no encontrado.');
        return;
      }

      await api.put(`/equipos/${equipoId}`, {
        nombre: equipoSeleccionado.nombre,
        zona_id: zonaId,
      });

      alert('Equipo agregado a la zona correctamente.');

      setEquipos((prev) => prev.filter((equipo) => equipo.id !== equipoId));
      setFilteredEquipos((prev) => prev.filter((equipo) => equipo.id !== equipoId));
      
      // Resetear el modo después de completar la operación
      setModoOperacion(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error al agregar equipo a la zona:', error);
      alert('Error al agregar el equipo a la zona.');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoEquipo = async () => {
    if (!nuevoEquipo.trim()) {
      alert('El nombre del equipo no puede estar vacío.');
      return;
    }

    try {
      setLoading(true);
      setModoOperacion('creacion');
      
      const response = await api.post('/equipos', { 
        nombre: nuevoEquipo, 
        zona_id: zonaId
      });
      const equipoCreado = response.data;

      setEquipos((prev) => prev.filter((equipo) => equipo.id !== equipoCreado.id));
      setFilteredEquipos((prev) => prev.filter((equipo) => equipo.id !== equipoCreado.id));

      setNuevoEquipo('');
      alert('Equipo creado y agregado a la zona correctamente.');
      
      // Resetear el modo después de completar la operación
      setModoOperacion(null);
    } catch (error) {
      console.error('Error al crear equipo:', error);
      alert('Error al crear el equipo.');
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
        <h1 className="text-2xl font-bold mb-6 lg:text-4xl">Cargar Equipo</h1>
        
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