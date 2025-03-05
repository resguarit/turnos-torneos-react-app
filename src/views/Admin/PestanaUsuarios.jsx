import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, Eraser, UserCircle, Calendar, CreditCard, Search } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BtnLoading from '@/components/BtnLoading';

const PestanaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('dni');
  const [newUsuario, setNewUsuario] = useState({
    name: '',
    email: '',
    dni: '',
    telefono: '',
    password: '',
    password_confirmation: '',
    rol: 'cliente',
  });
  const [editUsuario, setEditUsuario] = useState({
    name: '',
    email: '',
    dni: '',
    telefono: '',
    rol: 'cliente',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clear, setClear] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado de guardado
  const [validationErrors, setValidationErrors] = useState({}); // Estado para errores de validación

  const fetchUsuarios = async (signal) => {
    setLoading(true);
    try {
      const response = await api.get(`/usuarios`, {
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
      if (response.data.status === 200) {
        setUsuarios(response.data.usuarios);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError'){
        console.error('Error fetching usuarios:', error);
        toast.error('Error al cargar los usuarios');
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

    fetchUsuarios(signal);

    return () => {
      controller.abort();
    };
  }, [page, clear]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleEditUsuario = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Iniciar estado de guardado
    try {
      const response = await api.patch(`/usuarios/${editando.id}`, editUsuario);
      if (response.status === 200) {
        const updatedUsuarios = usuarios.map(usuario => 
          usuario.id === editando.id ? { ...usuario, ...editUsuario } : usuario
        );
        setUsuarios(updatedUsuarios);
        setEditUsuario({
          name: '',
          email: '',
          dni: '',
          telefono: '',
          rol: 'cliente',
        });
        setEditando(null);
        setValidationErrors({});
        setAgregando(false);
        toast.success('Usuario editado correctamente');
      }
    } catch (error) {
      console.error('Error editing usuario:', error);
      toast.error('Error al editar el usuario');
    } finally {
      setIsSaving(false); // Finalizar estado de guardado
    }
  };

  const handleEditClick = (usuario) => {
    setEditUsuario({
      name: usuario.name || '',
      email: usuario.email || '',
      dni: usuario.dni || '',
      telefono: usuario.telefono || '',
      rol: usuario.rol || 'cliente',
    });
    setEditando(usuario);
    setAgregando(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTurnosClick = (usuarioDni) => {
    window.location.href = `/panel-admin?tab=turnos&usuario=${usuarioDni}`;
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    if (page > 1){
    setPage(1);
    } else {
    fetchUsuarios();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if(page > 1){
    setPage(1);
    } else {
      setClear(true);
    }
  };

  const handleAddUsuario = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Iniciar estado de guardado
    setValidationErrors({}); // Limpiar errores de validación
    try {
      const response = await api.post('/create-user', newUsuario);
      if (response.status === 201) {
        setUsuarios([response.data.user, ...usuarios]); // Agregar el nuevo usuario al principio de la lista
        setNewUsuario({
          name: '',
          email: '',
          dni: '',
          telefono: '',
          password: '',
          password_confirmation: '',
          rol: 'cliente',
        });
        setAgregando(false);
        toast.success('Usuario creado con éxito');
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setValidationErrors(error.response.data.errors);
      } else {
        console.error('Error creating usuario:', error);
        toast.error('Error al crear el usuario');
      }
    } finally {
      setIsSaving(false); // Finalizar estado de guardado
    }
  };

  return (
    <div className=" max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => {
            setAgregando(true);
            setEditando(null);
            setNewUsuario({
              name: '',
              email: '',
              dni: '',
              telefono: '',
              password: '',
              password_confirmation: '',
              rol: 'cliente',
            });
          }}
          className="inline-flex sm:text-base text-sm rounded-[10px] items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors duration-200 transform hover:scale-105"
          disabled={isSaving}
        >
          <Plus className="h-5 w-5 mr-2" />
          Añadir Usuario
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
      {/* Selector de búsqueda */}
      <div className="relative w-full sm:w-1/3">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full text-sm sm:text-base px-2 py-1 border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Nombre</option>
          <option value="dni">DNI</option>
          <option value="telefono">Teléfono</option>
          <option value="email">Email</option>
        </select>
      </div>

      {/* Input de búsqueda */}
      <div className="relative flex w-full gap-2">
        <input
          type="text"
          placeholder={`Buscar por ${searchType}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-1 pl-8 text-sm sm:text-base border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-2 top-2 h-5 w-5 text-gray-400" />
        <button
          onClick={handleSearch}
          className="flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-green-600 border border-green-600 rounded-[10px] shadow hover:bg-white hover:text-green-600"
          disabled={isSaving}
        >
          <Search className="w-5 h-5 sm:hidden" /> {/* Icono en móvil */}
          <span className="hidden sm:block">Buscar</span> {/* Texto en escritorio */}
        </button>

        <button
          onClick={handleClearSearch}
          className="flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-red-600 border border-red-600 rounded-[10px] shadow hover:bg-white hover:text-red-600"
          disabled={isSaving}
        >
          <Eraser className="w-5 h-5 sm:hidden"/>
          <span className="hidden sm:block">Limpiar </span> {/* Texto en escritorio */}
        </button>
      </div>

     
    </div>


      {/* Loading */}
      {loading && <div className='flex justify-center items-center h-[50vh]'>
    <BtnLoading />
    </div>}

      {/* Formulario de Creación/Edición */}
      {!loading && agregando && (
        <form onSubmit={editando ? handleEditUsuario : handleAddUsuario} className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={editando ? editUsuario.name : newUsuario.name}
                onChange={(e) => editando ? setEditUsuario({ ...editUsuario, name: e.target.value }) : setNewUsuario({ ...newUsuario, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editando ? editUsuario.email : newUsuario.email}
                onChange={(e) => editando ? setEditUsuario({ ...editUsuario, email: e.target.value }) : setNewUsuario({ ...newUsuario, email: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
              {validationErrors.email && <p className="text-red-500 text-sm">{validationErrors.email[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI</label>
              <input
                type="text"
                value={editando ? editUsuario.dni : newUsuario.dni}
                onChange={(e) => editando ? setEditUsuario({ ...editUsuario, dni: e.target.value }) : setNewUsuario({ ...newUsuario, dni: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
              {validationErrors.dni && <p className="text-red-500 text-sm">{validationErrors.dni[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={editando ? editUsuario.telefono : newUsuario.telefono}
                onChange={(e) => editando ? setEditUsuario({ ...editUsuario, telefono: e.target.value }) : setNewUsuario({ ...newUsuario, telefono: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            {!editando && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    value={newUsuario.password}
                    onChange={(e) => setNewUsuario({ ...newUsuario, password: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={newUsuario.password_confirmation}
                    onChange={(e) => setNewUsuario({ ...newUsuario, password_confirmation: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                value={editando ? editUsuario.rol : newUsuario.rol}
                onChange={(e) => editando ? setEditUsuario({ ...editUsuario, rol: e.target.value }) : setNewUsuario({ ...newUsuario, rol: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="cliente">Cliente</option>
                <option value="moderador">Moderador</option>
                <option value="admin">Admin</option>
              </select>
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

      {/* Lista de Usuarios */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {usuarios.map((usuario) => (
              <li key={usuario.id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="p-6">
                  {/* Cabecera del Usuario */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <UserCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{usuario.name}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.rol === 'admin' ? 'bg-green-100 text-green-800' : usuario.rol === 'moderador' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {usuario.rol}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEditClick(usuario)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200" disabled={isSaving}>
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200" disabled={isSaving}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleViewTurnosClick(usuario.dni)} className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200" disabled={isSaving}>
                        Ver Turnos
                      </button>
                    </div>
                  </div>

                  {/* Información del Usuario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-bold">Email: </span>
                      <span>{usuario.email}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="font-bold">DNI: </span>
                      <span>{usuario.dni}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-bold">Teléfono: </span>
                      <span>{usuario.telefono}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-bold">Fecha de registro: </span>
                      <span>{formatDate(usuario.created_at)}</span>
                    </div>
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
    </div>
  );
};

export default PestanaUsuarios;