import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, UserCircle, Calendar, CreditCard, Search } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PestanaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUsuario, setNewUsuario] = useState({
    name: '',
    email: '',
    dni: '',
    telefono: '',
    rol: 'cliente',
  });

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get('/usuarios');
        if (response.data.status === 200) {
          setUsuarios(response.data.usuarios);
        }
      } catch (error) {
        console.error('Error fetching usuarios:', error);
        toast.error('Error al cargar los usuarios');
      }
    };

    fetchUsuarios();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario && usuario.dni && usuario.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUsuario = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/usuarios/${editando.id}`, newUsuario);
      if (response.status === 200) {
        const updatedUsuarios = usuarios.map(usuario => 
          usuario.id === editando.id ? { ...usuario, ...newUsuario } : usuario
        );
        setUsuarios(updatedUsuarios);
        setNewUsuario({
          name: '',
          email: '',
          dni: '',
          telefono: '',
          rol: 'cliente',
        });
        setEditando(null);
        setAgregando(false);
        toast.success('Usuario editado correctamente');
      }
    } catch (error) {
      console.error('Error editing usuario:', error);
      toast.error('Error al editar el usuario');
    }
  };

  const handleEditClick = (usuario) => {
    setNewUsuario(usuario);
    setEditando(usuario);
    setAgregando(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors duration-200 transform hover:scale-105">
          <Plus className="h-5 w-5 mr-2" />
          Añadir Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por DNI"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Formulario de Edición */}
      {agregando && (
        <form onSubmit={handleEditUsuario} className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={newUsuario.name}
                onChange={(e) => setNewUsuario({ ...newUsuario, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newUsuario.email}
                onChange={(e) => setNewUsuario({ ...newUsuario, email: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI</label>
              <input
                type="text"
                value={newUsuario.dni}
                onChange={(e) => setNewUsuario({ ...newUsuario, dni: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={newUsuario.telefono}
                onChange={(e) => setNewUsuario({ ...newUsuario, telefono: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                value={newUsuario.rol}
                onChange={(e) => setNewUsuario({ ...newUsuario, rol: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
                <option value="moderador">Moderador</option>
              </select>
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

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <ul className="divide-y divide-gray-100">
          {filteredUsuarios.map((usuario) => (
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
                    <button onClick={() => handleEditClick(usuario)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Información del Usuario */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{usuario.email}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span>{usuario.dni}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{usuario.telefono}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(usuario.created_at)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PestanaUsuarios;