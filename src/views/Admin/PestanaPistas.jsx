import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSinHF from '@/components/LoadingSinHF';
import ModalConfirmation from '@/components/ModalConfirmation';

const PestanaPistas = () => {
  const [pistas, setPistas] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [pistaToDelete, setPistaToDelete] = useState(null);
  const [newPista, setNewPista] = useState({
    nro: '',
    tipo_cancha: '',
    precio_por_hora: '',
    seña: '',
    activa: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Estado de guardado

  const fetchPistas = async (signal) => {
    setLoading(true);
    try {
      const response = await api.get('/canchas', { signal });
      if (response.status === 200) {
        setPistas(response.data.canchas);
      }
      setLoading(false);
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error fetching pistas:', error);
        toast.error('Error al cargar las pistas');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchPistas(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const handleAddPista = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Iniciar estado de guardado
    try {
      const response = await api.post('/canchas', newPista);
      if (response.status === 201) {
        setPistas([response.data.cancha, ...pistas]); // Agregar la nueva pista al principio de la lista
        setNewPista({
          nro: '',
          tipo_cancha: '',
          precio_por_hora: '',
          seña: '',
          activa: true,
        });
        setAgregando(false);
        toast.success('Pista añadida correctamente');
      }
    } catch (error) {
      console.error('Error adding cancha:', error);
      toast.error('Error al añadir la pista');
    } finally {
      setIsSaving(false); // Finalizar estado de guardado
    }
  };

  const handleEditPista = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Iniciar estado de guardado
    try {
      const response = await api.patch(`/canchas/${editando.id}`, newPista);
      if (response.status === 200) {
        const updatedPistas = pistas.map(pista => 
          pista.id === editando.id ? { ...pista, ...newPista } : pista
        );
        setPistas(updatedPistas);
        setNewPista({
          nro: '',
          tipo_cancha: '',
          precio_por_hora: '',
          seña: '',
          activa: true,
        });
        setEditando(null);
        setAgregando(false);
        toast.success('Pista editada correctamente');
      }
    } catch (error) {
      console.error('Error editing cancha:', error);
      toast.error('Error al editar la pista');
    } finally {
      setIsSaving(false); // Finalizar estado de guardado
    }
  };

  const handleDeletePista = async () => {
    try {
      const response = await api.delete(`/canchas/${pistaToDelete.id}`);
      if (response.status === 200) {
        setPistas(pistas.filter(pista => pista.id !== pistaToDelete.id));
        setPistaToDelete(null);
        toast.success('Pista eliminada correctamente');
      }
    } catch (error) {
      console.error('Error deleting cancha:', error);
      toast.error('Error al eliminar la pista');
    }
  };

  const handleEditClick = (pista) => {
    setNewPista(pista);
    setEditando(pista);
    setAgregando(true);
  };

  return (
    <div className=" max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => {
            setAgregando(true);
            setEditando(null);
            setNewPista({
              nro: '',
              tipo_cancha: '',
              precio_por_hora: '',
              seña: '',
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

      {loading ? (
        <LoadingSinHF />
      ) : (
        <>
          {agregando && (
            <form onSubmit={editando ? handleEditPista : handleAddPista} className="mb-6 bg-white p-4 rounded-xl shadow">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número</label>
                  <input
                    type="text"
                    value={newPista.nro}
                    onChange={(e) => setNewPista({ ...newPista, nro: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Cancha</label>
                  <input
                    type="text"
                    value={newPista.tipo_cancha}
                    onChange={(e) => setNewPista({ ...newPista, tipo_cancha: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio por Hora</label>
                  <input
                    type="number"
                    value={newPista.precio_por_hora}
                    onChange={(e) => setNewPista({ ...newPista, precio_por_hora: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seña</label>
                  <input
                    type="number"
                    value={newPista.seña}
                    onChange={(e) => setNewPista({ ...newPista, seña: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
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

          <div className="bg-white w-full rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
            <ul className="divide-y divide-gray-100 w-full ">
              {pistas.map((pista) => (
                <li key={pista.id} className="hover:bg-gray-50 transition-colors duration-150 w-full">
                  <div className="p-6 flex justify-between items-center space-x-8 sm:space-x-3 ">
                    <div className="flex  items-center space-x-8 ">
                      <div className="bg-orange-500 text-center rounded-[8px] p-2">
                        <span className="text-sm sm:text-base  font-semibold text-white">{`Cancha ${pista.nro} - ${pista.tipo_cancha}`}</span>
                      </div>
                      <span className=" text-sm sm:text-base font-bold">Precio por Hora: <span className="font-normal">${pista.precio_por_hora}</span></span>
                      <span className=" text-sm sm:text-base font-bold">Seña: <span className="font-normal">${pista.seña}</span></span>
                      <span className=" text-sm sm:text-base font-bold">Activa: <span className="font-normal">{pista.activa ? 'Sí' : 'No'}</span></span>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-3">
                      <button onClick={() => handleEditClick(pista)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200" disabled={isSaving}>
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => setPistaToDelete(pista)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200" disabled={isSaving}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {pistaToDelete && (
            <ModalConfirmation
              onConfirm={handleDeletePista}
              onCancel={() => setPistaToDelete(null)}
              title="Eliminar Pista"
              subtitle={`¿Estás seguro de que deseas eliminar la pista ${pistaToDelete.nro}?`}
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