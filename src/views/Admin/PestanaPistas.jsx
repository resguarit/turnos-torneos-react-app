import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalConfirmation from '@/components/ModalConfirmation';
import BtnLoading from '@/components/BtnLoading';

const PestanaPistas = () => {
  const [pistas, setPistas] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [pistaToDelete, setPistaToDelete] = useState(null);
  const [newPista, setNewPista] = useState({
    nro: '',
    deporte_id: '',
    precio_por_hora: '',
    seña: '',
    descripcion: '',
    activa: true,
  });
  const [loading, setLoading] = useState(true);
  const [loadingDeportes, setLoadingDeportes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agregandoDeporte, setAgregandoDeporte] = useState(false);
  const [editandoDeporte, setEditandoDeporte] = useState(null); 
  const [deporteToDelete, setDeporteToDelete] = useState(null);
  const [newDeporte, setNewDeporte] = useState({
    nombre: '',
    jugadores_por_equipo: '',
    duracion_turno: ''
  });

  const fetchDeportes = async () => {
    try {
      const response = await api.get('/deportes');
      if (response.data) {
        setDeportes(response.data);
      }
    } catch (error) {
      console.error('Error fetching deportes:', error);
      toast.error('Error al cargar los deportes');
    } finally {
      setLoadingDeportes(false);
    }
  };

  const fetchPistas = async (signal) => {
    setLoading(true);
    try {
      const response = await api.get('/canchas', { signal });
      if (response.status === 200) {
        setPistas(response.data.canchas);
      }
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error fetching canchas:', error);
        toast.error('Error al cargar las canchas');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPistas(controller.signal);
    fetchDeportes();
    return () => {
      controller.abort();
    };
  }, []);

  const handleAddPista = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.post('/canchas', newPista);
      if (response.status === 201) {
        setPistas([...pistas, response.data.cancha]);
        setNewPista({
          nro: '',
          deporte_id: '',
          precio_por_hora: '',
          seña: '',
          descripcion: '',
          activa: true,
        });
        setAgregando(false);
        toast.success('Cancha añadida correctamente');
      }
    } catch (error) {
      console.error('Error adding cancha:', error);
      toast.error('Error al añadir la cancha');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPista = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.patch(`/canchas/${editando.id}`, newPista);
      if (response.status === 200) {
        const updatedPistas = pistas.map(pista => 
          pista.id === editando.id ? { ...pista, ...newPista } : pista
        );
        setPistas(updatedPistas);
        setNewPista({
          nro: '',
          deporte_id: '',
          precio_por_hora: '',
          seña: '',
          descripcion: '',
          activa: true,
        });
        setEditando(null);
        setAgregando(false);
        toast.success('Cancha editada correctamente');
      }
    } catch (error) {
      console.error('Error editing cancha:', error);
      toast.error('Error al editar la cancha');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePista = async () => {
    try {
      const response = await api.delete(`/canchas/${pistaToDelete.id}`);
      if (response.status === 200) {
        setPistas(pistas.filter(pista => pista.id !== pistaToDelete.id));
        setPistaToDelete(null);
        toast.success('Cancha eliminada correctamente');
      }
    } catch (error) {
      console.error('Error deleting cancha:', error);
      toast.error('Error al eliminar la cancha');
    }
  };

  const handleEditClick = (pista) => {
    setNewPista({
      ...pista,
      deporte_id: pista.deporte_id || ''
    });
    setEditando(pista);
    setAgregandoDeporte(false);
    setAgregando(true);
  };

  const handleDeleteDeporte = async () => {
    try {
      const response = await api.delete(`/deportes/${deporteToDelete.id}`);
      if (response.status === 200) {
        setDeportes(deportes.filter(deporte => deporte.id !== deporteToDelete.id));
        setDeporteToDelete(null);
        toast.success('Deporte eliminado correctamente');
      }
    } catch (error) {
      console.error('Error deleting deporte:', error);
      toast.error('Error al eliminar el deporte');
    }
  };

  const handleEditDeporteClick = (deporte) => {
    setNewDeporte({
      ...deporte,
      duracion_turno: deporte.duracion_turno
    });
    setEditandoDeporte(deporte);
    setAgregandoDeporte(true);
    setAgregando(false);
    setEditando(null);
  }

  const handleEditDeporte = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put(`/deportes/${editandoDeporte.id}`, newDeporte);
      if (response.status === 200) {
        const updatedDeportes = deportes.map(deporte => 
          deporte.id === editandoDeporte.id ? { ...deporte, ...newDeporte } : deporte
        );
        setDeportes(updatedDeportes);
        setNewDeporte({
          nombre: '',
          jugadores_por_equipo: '',
          duracion_turno: ''
        });
        setEditandoDeporte(null);
        setAgregandoDeporte(false);
        toast.success('Deporte editado correctamente');
      }
    } catch (error) {
      console.error('Error editing deporte:', error);
      toast.error('Error al editar el deporte');
    } finally {
      setIsSaving(false);
    }
  }

  const handleAddDeporte = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.post('/deportes', newDeporte);
      if (response.status === 201) {
        setDeportes([...deportes, response.data.deporte]);
        setNewDeporte({
          nombre: '',
          jugadores_por_equipo: '',
          duracion_turno: ''
        });
        setAgregandoDeporte(false);
        toast.success('Deporte añadido correctamente');
      }
    } catch (error) {
      console.error('Error adding deporte:', error);
      toast.error('Error al añadir el deporte');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />
      <div className="flex justify-end gap-4 mb-4">
        <div className="flex justify-center items-center">
        <button
          onClick={() => {
            setAgregando(true);
            setAgregandoDeporte(false);
            setEditando(null);
            setNewPista({
              nro: '',
              deporte_id: '',
              precio_por_hora: '',
              seña: '',
              descripcion: '',
              activa: true,
            });
          }}
          className="inline-flex items-center text-sm sm:text-base px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] shadow transition-colors duration-200 transform hover:scale-105"
          disabled={isSaving}
        >
          <Plus className="h-5 w-5 mr-2" />
          Añadir Cancha
        </button>
        </div>
        <div className="flex justify-center items-center">
        <button
          onClick={() => {
            setAgregando(false);
            setAgregandoDeporte(true);
            setEditandoDeporte(null);  
            setNewDeporte({
              nombre: '',
              jugadores_por_equipo: '',
              duracion_turno: ''
            });
          }}
          className="inline-flex items-center text-sm sm:text-base px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-[10px] shadow transition-colors duration-200 transform hover:scale-105"
          disabled={isSaving}
        >
          <Plus className="h-5 w-5 mr-2" />
          Añadir Deporte
        </button>
        </div>
      </div>

      {loading || loadingDeportes ? (
        <div className='flex justify-center items-center h-[50vh]'>
          <BtnLoading />
        </div>
      ) : (
        <>
          {agregando && !agregandoDeporte && (
            <form onSubmit={editando ? handleEditPista : handleAddPista} className="mb-6 bg-white p-4 rounded-xl shadow">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número <span className="text-xs text-gray-500">Para identificar la cancha</span></label>
                  <input
                    type="text"
                    value={newPista.nro}
                    onChange={(e) => setNewPista({ ...newPista, nro: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deporte</label>
                  <select
                    value={newPista.deporte_id}
                    onChange={(e) => setNewPista({ ...newPista, deporte_id: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Seleccionar deporte</option>
                    {deportes.map((deporte) => (
                      <option key={deporte.id} value={deporte.id}>
                        {`${deporte.nombre} ${deporte.jugadores_por_equipo}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio por Hora <span className="text-xs text-gray-500">ej. 60000 sin , ni .</span></label>
                  <input
                    type="number"
                    value={newPista.precio_por_hora}
                    onChange={(e) => setNewPista({ ...newPista, precio_por_hora: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seña <span className="text-xs text-gray-500">ej. 10000 sin , ni .</span></label>
                  <input
                    type="number"
                    value={newPista.seña}
                    onChange={(e) => setNewPista({ ...newPista, seña: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción <span className="text-xs text-gray-500">ej: Al aire libre, Techada, etc.</span></label>
                  <input
                    type="text"
                    value={newPista.descripcion}
                    onChange={(e) => setNewPista({ ...newPista, descripcion: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPista.activa}
                    onChange={(e) => setNewPista({ ...newPista, activa: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">Activa</label>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAgregando(false)}
                  className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-[8px] shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-[8px] shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Guardar')}
                </button>
              </div>
            </form>
          )}

          {agregandoDeporte && !agregando && (
            <form onSubmit={editandoDeporte ? handleEditDeporte : handleAddDeporte} className="mb-6 bg-white p-4 rounded-xl shadow">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={newDeporte.nombre}
                    onChange={(e) => setNewDeporte({ ...newDeporte, nombre: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jugadores por Equipo</label>
                  <input
                    type="number"
                    value={newDeporte.jugadores_por_equipo}
                    onChange={(e) => setNewDeporte({ ...newDeporte, jugadores_por_equipo: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duración Turno <span className="text-xs text-gray-500">(en minutos)</span></label>
                  <input
                    type="number"
                    value={newDeporte.duracion_turno}
                    onChange={(e) => setNewDeporte({ ...newDeporte, duracion_turno: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required  
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAgregandoDeporte(false)}
                  className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-[8px] shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancelar
                </button> 
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-[8px] shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'} 
                </button>
              </div>
            </form>
          )}

          <div className="text-2xl font-bold mb-4">
            Canchas
          </div>

          <div className="bg-white w-full rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
            <div className="max-h-[40vh] overflow-y-auto">
            <ul className="divide-y divide-gray-100 w-full">
              {pistas.map((pista) => (
                <li key={pista.id} className="hover:bg-gray-50 transition-colors duration-150 w-full">
                  <div className="p-6 flex justify-between items-center space-x-8 sm:space-x-3">
                    <div className="flex items-center space-x-8">
                      <div className="bg-blue-600 text-center rounded-[8px] p-2">
                        <span className="text-sm sm:text-base font-semibold text-white">
                          {`Cancha ${pista.nro} - ${pista.tipo_cancha}`}
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-gray-700">
                        Precio por Hora: <span className="font-normal">${pista.precio_por_hora}</span>
                      </span>
                      <span className="text-sm sm:text-base font-bold text-gray-700">
                        Seña: <span className="font-normal">${pista.seña}</span>
                      </span>
                      <span className="text-sm sm:text-base font-bold text-gray-700">
                        Descripción: <span className="font-normal">{pista.descripcion}</span>
                      </span>
                      <span className="text-sm sm:text-base font-bold text-gray-700">
                        Activa: <span className="font-normal">{pista.activa ? 'Sí' : 'No'}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-3">
                      <button 
                        onClick={() => handleEditClick(pista)} 
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200" 
                        disabled={isSaving}
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setPistaToDelete(pista)} 
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200" 
                        disabled={isSaving}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div>
          
          <div className="text-2xl font-bold mb-4 pt-4">
            Deportes
          </div>

          <div className="bg-white w-1/2 rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
            <div className="max-h-[40vh] overflow-y-auto">
            <ul className="divide-y divide-gray-100 w-full">
              {deportes.map((deporte) => (
                <li key={deporte.id} className="hover:bg-gray-50 transition-colors duration-150 w-full">
                  <div className="p-6 flex justify-between items-center space-x-8 sm:space-x-3">
                    <div className="flex items-center space-x-8">
                      <div className="bg-green-600 text-center rounded-[8px] p-2">
                        <span className="text-sm sm:text-base font-semibold text-white">
                          {`${deporte.nombre} - ${deporte.jugadores_por_equipo}`}
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-gray-700">
                        Duración Turno: <span className="font-normal">{deporte.duracion_turno} min.</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-3">
                      <button 
                        onClick={() => handleEditDeporteClick(deporte)} 
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200" 
                        disabled={isSaving}
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setDeporteToDelete(deporte)} 
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200" 
                        disabled={isSaving}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div> 

          {pistaToDelete && (
            <ModalConfirmation
              onConfirm={handleDeletePista}
              onCancel={() => setPistaToDelete(null)}
              title="Eliminar Cancha"
              subtitle={`¿Estás seguro de que deseas eliminar la cancha ${pistaToDelete.nro}?`}
              botonText1="Cancelar"
              botonText2="Eliminar"
            />
          )}

          {deporteToDelete && (
            <ModalConfirmation
              onConfirm={handleDeleteDeporte}
              onCancel={() => setDeporteToDelete(null)}
              title="Eliminar Deporte"
              subtitle={`¿Estás seguro de que deseas eliminar el deporte ${deporteToDelete.nombre}?`}
              botonText1="Cancelar"
              botonText2="Eliminar"
            />
          )}
        </>
      )}
    </div>
  );
};

export default PestanaPistas;