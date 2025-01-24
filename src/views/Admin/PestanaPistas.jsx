import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  useEffect(() => {
    const fetchPistas = async () => {
      try {
        const response = await api.get('/canchas');
        if (response.data.status === 200) {
          setPistas(response.data.canchas);
        }
      } catch (error) {
        console.error('Error fetching canchas:', error);
      }
    };

    fetchPistas();
  }, []);

  const handleAddPista = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/canchas', newPista);
      if (response.status === 201) {
        const formattedPista = {
          ...response.data.cancha,
          precio_por_hora: parseFloat(response.data.cancha.precio_por_hora).toFixed(2),
          seña: parseFloat(response.data.cancha.seña).toFixed(2),
        };
        setPistas([...pistas, formattedPista]);
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
    }
  };

  const handleEditPista = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/canchas/${editando.id}`, newPista);
      if (response.status === 200) {
        const formattedPista = {
          ...response.data.cancha,
          precio_por_hora: parseFloat(response.data.cancha.precio_por_hora).toFixed(2),
          seña: parseFloat(response.data.cancha.seña).toFixed(2),
        };
        setPistas(pistas.map(pista => pista.id === editando.id ? formattedPista : pista));
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
    <div className="py-6">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Gestión de Pistas</h2>
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
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Pista
        </button>
      </div>

      {agregando && (
        <form onSubmit={editando ? handleEditPista : handleAddPista} className="mb-6 bg-white p-4 rounded-lg shadow">
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
              className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {editando ? 'Guardar Cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {pistas.map((pista) => (
            <li key={pista.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-orange-500 truncate">{`Cancha ${pista.nro} - ${pista.tipo_cancha}`}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <button onClick={() => handleEditClick(pista)} className="text-gray-400 hover:text-indigo-500">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button onClick={() => setPistaToDelete(pista)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Tipo: {pista.tipo_cancha}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Precio: ${pista.precio_por_hora}/hora
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Seña: ${pista.seña}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Activa: {pista.activa ? 'Si' : 'No'}
                    </p>
                  </div>
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
    </div>
  );
};

export default PestanaPistas;