import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, Eraser, UserCircle, Calendar, CreditCard, Search, DollarSign, CalendarDays } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BtnLoading from '@/components/BtnLoading';
import ConfirmDeleteModal from '../Admin/Modals/ConfirmDeleteModal';
import { useNavigate } from 'react-router-dom';
import { decryptRole } from '@/lib/getRole';
import { formatearFechaSinDia } from '@/utils/dateUtils';

const PestanaPersonas = () => {
  const [personas, setPersonas] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('dni');
  const [userRole, setUserRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  // Estructura para datos de la persona
  const [newPersona, setNewPersona] = useState({
    name: '',
    dni: '',
    telefono: '',
    direccion: '',
  });
  const [editPersona, setEditPersona] = useState({
    name: '',
    dni: '',
    telefono: '',
    direccion: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clear, setClear] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userRoleEncrypted = localStorage.getItem('user_role');
    const userRole = decryptRole(userRoleEncrypted);
    setUserRole(userRole);
  }, []);

  const isAdmin = userRole === 'admin';

  const fetchPersonas = async (signal) => {
    setLoading(true);
    try {
      const response = await api.get(`/personas`, {
        params: {
          page,
          limit: 10,
          sortBy: 'created_at',
          order: 'desc',
          searchTerm: searchTerm,
          searchType: searchType
        },
        signal
      });
      if (response.data && response.data.status === 200) {
        setPersonas(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError'){
        console.error('Error fetching personas:', error);
        toast.error('Error al cargar las personas');
      }
    } finally {
      if (!signal?.aborted){
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchPersonas(signal);

    return () => {
      controller.abort();
    };
  }, [page, clear]);

  const formatDate = (dateString) => {
    return formatearFechaSinDia(dateString);
  };

  const handleEditPersona = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setValidationErrors({});
    try {
      const response = await api.patch(`/personas/${editando.id}`, editPersona);
      
      // Verificar si la respuesta contiene errores de validación
      if (response.data.status === 400 || (response.data.errors && response.data.message === "Error de validación")) {
        // Manejar errores de validación dentro del bloque try
        console.error('Error de validación:', response.data);
        setValidationErrors(response.data.errors || {});
        
        if (response.data.message) {
          toast.error(response.data.message);
        }
        setIsSaving(false);
        return; // Detener ejecución
      }
      
      if (response.status === 200) {
        // Actualizar la vista
        const updatedPersonas = personas.map(persona => 
          persona.id === editando.id ? { 
            ...persona, 
            name: editPersona.name,
            dni: editPersona.dni,
            telefono: editPersona.telefono,
            direccion: editPersona.direccion
          } : persona
        );
        setPersonas(updatedPersonas);
        resetEditForm();
        toast.success('Persona editada correctamente');
      }
    } catch (error) {
      console.error('Error editing persona:', error);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error(error.response.data.message || 'Error de validación');
      } else {
        toast.error('Error al editar la persona');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetEditForm = () => {
    setEditPersona({
      name: '',
      dni: '',
      telefono: '',
      direccion: '',
    });
    setEditando(null);
    setValidationErrors({});
    setAgregando(false);
  };

  const handleEditClick = (persona) => {
    setEditPersona({
      name: persona.name || '',
      dni: persona.dni || '',
      telefono: persona.telefono || '',
      direccion: persona.direccion || '',
    });
    setEditando(persona);
    setAgregando(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerTurnos = (personaDni) => {
    navigate(`/panel-admin?tab=turnos&usuario=${personaDni}`);
  };

  const handleVerCuentaCorriente = (personaDni) => {
    navigate(`/panel-admin?tab=cuentacorriente&dni=${personaDni}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    if (page > 1){
      setPage(1);
    } else {
      fetchPersonas();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if(page > 1){
      setPage(1);
    } else {
      setClear(prev => !prev);
    }
  };

  const handleAddPersona = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setValidationErrors({});
    try {
      const response = await api.post('/personas', newPersona);
      
      // Verificar si la respuesta contiene errores de validación
      if (response.data.status === 400 || (response.data.errors && response.data.message === "Error de validación")) {
        // Manejar errores de validación dentro del bloque try
        console.error('Error de validación:', response.data);
        setValidationErrors(response.data.errors || {});
        
        if (response.data.message) {
          toast.error(response.data.message);
        }
        setIsSaving(false);
        return; // Detener ejecución
      }
      
      if (response.status === 201 || (response.data && response.data.status === 201)) {
        // Extraer la persona creada de la respuesta 
        const nuevaPersona = response.data.persona || response.data;
        setPersonas([nuevaPersona, ...personas]);
        initNewPersonaForm();
        toast.success('Persona creada con éxito');
      }
    } catch (error) {
      console.error('Error creating persona:', error);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error(error.response.data.message || 'Error de validación');
      } else {
        toast.error('Error al crear la persona');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetNewPersonaForm = () => {
    setNewPersona({
      name: '',
      dni: '',
      telefono: '',
      direccion: '',
    });
    setAgregando(false);
  };

  // Nueva función para inicializar el formulario sin cerrarlo
  const initNewPersonaForm = () => {
    setNewPersona({
      name: '',
      dni: '',
      telefono: '',
      direccion: '',
    });
    setValidationErrors({});
  };

  const handleDeletePersona = async (personaId) => {
    try {
      setLoadingDelete(true);
      const response = await api.delete(`/personas/${personaId}`);
      if (response.status === 200) {
        setPersonas(personas.filter(persona => persona.id !== personaId));
        toast.success('Persona eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar persona:', error);
      toast.error('Error al eliminar la persona');
    } finally {
      setLoadingDelete(false);
      setShowDeleteModal(false);
      setPersonaToDelete(null);
    }
  };

  const handleDeleteClick = (persona) => {
    setPersonaToDelete(persona);
    setShowDeleteModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="flex justify-end items-center mb-4">
        {isAdmin && (
          <button
            onClick={() => {
              setAgregando(true);
              setEditando(null);
              initNewPersonaForm();
            }}
            className="inline-flex text-sm rounded-[6px] items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors duration-200 transform hover:scale-105"
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Persona
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        {/* Selector de búsqueda */}
        <div className="relative w-full sm:w-1/3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Nombre</option>
            <option value="dni">DNI</option>
            <option value="telefono">Teléfono</option>
          </select>
        </div>

        {/* Input de búsqueda */}
        <div className="relative flex w-full gap-2">
          <input
            type="text"
            placeholder={`Buscar por ${searchType === 'name' ? 'nombre' : searchType}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1 pl-8 text-sm sm:text-base border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2 top-2 h-5 w-5 text-gray-400" />
          <button
            onClick={handleSearch}
            className="flex items-center justify-center text-sm px-3 py-2 text-white bg-green-600 border border-green-600 rounded-[6px] shadow hover:bg-white hover:text-green-600"
            disabled={isSaving}
          >
            <Search className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:block">Buscar</span>
          </button>

          <button
            onClick={handleClearSearch}
            className="flex items-center justify-center text-sm px-3 py-2 text-white bg-red-600 border border-red-600 rounded-[6px] shadow hover:bg-white hover:text-red-600"
            disabled={isSaving}
          >
            <Eraser className="w-5 h-5 sm:hidden"/>
            <span className="hidden sm:block">Limpiar</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && 
        <div className='flex justify-center items-center h-[50vh]'>
          <BtnLoading />
        </div>
      }

      {/* Formulario de Creación/Edición */}
      {!loading && agregando && (
        <form onSubmit={editando ? handleEditPersona : handleAddPersona} className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">{editando ? 'Editar Persona' : 'Crear Nueva Persona'}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {editando ? 'Modifica los datos de la persona seleccionada.' : 'Completa todos los campos para crear una nueva persona en el sistema.'}
          </p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={editando ? editPersona.name : newPersona.name}
                onChange={(e) => editando 
                  ? setEditPersona({ ...editPersona, name: e.target.value }) 
                  : setNewPersona({ ...newPersona, name: e.target.value })
                }
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                  validationErrors.name ? 'border-red-500 text-red-500' : ''
                }`}
                required
              />
              {validationErrors.name && <p className="text-red-500 text-sm mt-1">{validationErrors.name[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI</label>
              <input
                type="text"
                value={editando ? editPersona.dni : newPersona.dni}
                onChange={(e) => {
                  const value = e.target.value;
                  editando 
                    ? setEditPersona({ ...editPersona, dni: value })
                    : setNewPersona({ ...newPersona, dni: value });
                }}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                  validationErrors.dni ? 'border-red-500 text-red-500' : ''
                }`}
                required
              />
              {validationErrors.dni && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.dni[0].includes('has already been taken') 
                    ? 'Ya existe una persona con este DNI en el sistema.'
                    : validationErrors.dni[0]
                  }
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={editando ? editPersona.telefono : newPersona.telefono}
                onChange={(e) => editando 
                  ? setEditPersona({ ...editPersona, telefono: e.target.value }) 
                  : setNewPersona({ ...newPersona, telefono: e.target.value })
                }
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm ${
                  validationErrors.telefono ? 'border-red-500 text-red-500' : ''
                }`}
                required
              />
              {validationErrors.telefono && <p className="text-red-500 text-sm mt-1">{validationErrors.telefono[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección (opcional)</label>
              <input
                type="text"
                value={editando ? editPersona.direccion || '' : newPersona.direccion || ''}
                onChange={(e) => editando 
                  ? setEditPersona({ ...editPersona, direccion: e.target.value }) 
                  : setNewPersona({ ...newPersona, direccion: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setAgregando(false);
                setEditando(null);
                setValidationErrors({});
              }}
              className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Guardar')}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Personas */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {personas.map((persona) => (
              <li key={persona.id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="p-6">
                  {/* Cabecera de la Persona */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <UserCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <>
                          <button onClick={() => handleEditClick(persona)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200" disabled={isSaving}>
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(persona)} 
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200" 
                            disabled={isSaving}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleVerTurnos(persona.dni)} 
                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 flex items-center" 
                        disabled={isSaving}
                        title="Ver Turnos"
                      >
                        <CalendarDays className="h-5 w-5" />
                        <span className="ml-1 hidden sm:inline">Ver Turnos</span>
                      </button>
                      <button 
                        onClick={() => handleVerCuentaCorriente(persona.dni)} 
                        className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors duration-200 flex items-center" 
                        disabled={isSaving}
                        title="Ver Cuenta Corriente"
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="ml-1 hidden sm:inline">Cuenta Corriente</span>
                      </button>
                    </div>
                  </div>

                  {/* Información de la Persona */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="font-bold">DNI: </span>
                      <span>{persona.dni}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-bold">Teléfono: </span>
                      <span>{persona.telefono}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-bold">Fecha de registro: </span>
                      <span>{formatDate(persona.created_at)}</span>
                    </div>
                    
                    {persona.direccion && (
                      <div className="flex items-center space-x-2 text-gray-600 col-span-3">
                        <span className="font-bold">Dirección: </span>
                        <span>{persona.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paginación */}
      {!loading && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}


        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onConfirm={() => handleDeletePersona(personaToDelete.id)}
          onClose={() => {
            setShowDeleteModal(false);
            setPersonaToDelete(null);
          }}
          accionTitulo="Eliminación"
          accion="eliminar"
          pronombre="la"
          entidad="persona"
          accionando="Eliminando"
          loading={loadingDelete}
        />
    </div>
  );
};

export default PestanaPersonas;
