import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, User, Mail, Phone, Award } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import BtnLoading from '@/components/BtnLoading';
import ProfesorModal from './Modals/ProfesorModal';
import ConfirmDeleteModal from './Modals/ConfirmDeleteModal';

const TabProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profesorToDelete, setProfesorToDelete] = useState(null);
  
  // Estados para el formulario
  const [formProfesor, setFormProfesor] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    especialidad: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profesores');
      setProfesores(response.data.profesores || response.data || []);
    } catch (error) {
      toast.error('Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditando(null);
    setFormProfesor({
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      especialidad: "",
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleEdit = (profesor) => {
    setEditando(profesor);
    setFormProfesor({
      nombre: profesor.nombre || "",
      apellido: profesor.apellido || "",
      dni: profesor.dni || "",
      telefono: profesor.telefono || "",
      email: profesor.email || "",
      especialidad: profesor.especialidad || "",
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDelete = (profesor) => {
    setProfesorToDelete(profesor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsSaving(true);
    try {
      await api.delete(`/profesores/${profesorToDelete.id}`);
      setProfesores(prev => prev.filter(p => p.id !== profesorToDelete.id));
      toast.success('Profesor eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el profesor');
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
      setProfesorToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setValidationErrors({});

    try {
      if (editando) {
        const response = await api.put(`/profesores/${editando.id}`, formProfesor);
        setProfesores(prev => 
          prev.map(p => p.id === editando.id ? response.data.profesor : p)
        );
        toast.success('Profesor actualizado correctamente');
      } else {
        const response = await api.post('/profesores', formProfesor);
        setProfesores(prev => [response.data.profesor, ...prev]);
        toast.success('Profesor creado correctamente');
      }
      setShowModal(false);
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Error al guardar el profesor');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormProfesor(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo que se está editando
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Filtrar profesores
  const profesoresFiltrados = profesores.filter(profesor => {
    const term = searchTerm.toLowerCase();
    return (
      profesor.nombre?.toLowerCase().includes(term) ||
      profesor.apellido?.toLowerCase().includes(term) ||
      profesor.dni?.toLowerCase().includes(term) ||
      profesor.email?.toLowerCase().includes(term) ||
      profesor.especialidad?.toLowerCase().includes(term)
    );
  });

  // Paginación
  const totalPages = Math.ceil(profesoresFiltrados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = profesoresFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset página cuando cambia búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between  mb-6 items-center">
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar profesores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 pl-8 py-1 border text-sm border-gray-300 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Botón crear */}
          <button
            onClick={handleCreate}
            className="inline-flex items-center text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white  rounded-[6px] shadow transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Profesor
          </button>
      </div>

     

      {/* Lista de profesores */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <BtnLoading />
        </div>
      ) : (
        <>
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No se encontraron profesores' : 'No hay profesores registrados'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? `No hay profesores que coincidan con "${searchTerm}"`
                  : 'Comienza agregando un nuevo profesor.'
                }
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer profesor
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4 mb-6">
                {currentItems.map((profesor) => (
                  <div
                    key={profesor.id}
                    className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-2">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {profesor.nombre} {profesor.apellido}
                            </h3>
                            <p className="text-sm text-gray-500">DNI: {profesor.dni}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(profesor)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(profesor)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {profesor.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{profesor.email}</span>
                          </div>
                        )}
                        
                        {profesor.telefono && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{profesor.telefono}</span>
                          </div>
                        )}
                        
                        {profesor.especialidad && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="h-4 w-4 mr-2" />
                            <span className="truncate">{profesor.especialidad}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        (pageNumber === currentPage - 2 && pageNumber > 1) ||
                        (pageNumber === currentPage + 2 && pageNumber < totalPages)
                      ) {
                        return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {/* Info de paginación */}
              {profesoresFiltrados.length > 0 && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, profesoresFiltrados.length)} de {profesoresFiltrados.length} profesores
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal de profesor */}
      <ProfesorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        formProfesor={formProfesor}
        handleProfesorChange={handleFormChange}
        handleCreateProfesor={handleSubmit}
        validationErrorsProfesor={validationErrors}
        isSavingProfesor={isSaving}
        editando={editando}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProfesorToDelete(null);
        }}
        onConfirm={confirmDelete}
        loading={isSaving}
        accionTitulo="Eliminación"
        accion="eliminar"
        pronombre="el"
        entidad="profesor"
        accionando="Eliminando"
        nombreElemento={
          profesorToDelete
            ? `${profesorToDelete.nombre} ${profesorToDelete.apellido}`
            : ""
        }
      />
    </div>
  );
};

export default TabProfesores;