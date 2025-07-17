import React from 'react';
import { X, User } from 'lucide-react';

const ProfesorModal = ({
  isOpen,
  onClose,
  formProfesor,
  handleProfesorChange,
  handleCreateProfesor,
  validationErrorsProfesor,
  isSavingProfesor,
  editando = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-[8px] w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            {editando ? 'Editar Profesor' : 'Crear Nuevo Profesor'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleCreateProfesor} className="space-y-2">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formProfesor.nombre}
              onChange={handleProfesorChange}
              className={`block w-full px-2 py-1 border rounded-[6px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                validationErrorsProfesor.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrorsProfesor.nombre && (
              <p className="text-red-500 text-sm mt-1">{validationErrorsProfesor.nombre[0]}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="apellido"
              value={formProfesor.apellido}
              onChange={handleProfesorChange}
              className={`block w-full px-2 py-1 border rounded-[6px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                validationErrorsProfesor.apellido ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrorsProfesor.apellido && (
              <p className="text-red-500 text-sm mt-1">{validationErrorsProfesor.apellido[0]}</p>
            )}
          </div>

          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              DNI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="dni"
              value={formProfesor.dni}
              onChange={handleProfesorChange}
              className={`block w-full px-2 py-1 border rounded-[6px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                validationErrorsProfesor.dni ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrorsProfesor.dni && (
              <p className="text-red-500 text-sm mt-1">{validationErrorsProfesor.dni[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formProfesor.email}
              onChange={handleProfesorChange}
              className={`block w-full px-2 py-1 border rounded-[6px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                validationErrorsProfesor.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ejemplo@email.com"
            />
            {validationErrorsProfesor.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrorsProfesor.email[0]}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formProfesor.telefono}
              onChange={handleProfesorChange}
              className={`block w-full px-2 py-1 border rounded-[6px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                validationErrorsProfesor.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+54 9 11 1234-5678"
            />
            {validationErrorsProfesor.telefono && (
              <p className="text-red-500 text-sm mt-1">{validationErrorsProfesor.telefono[0]}</p>
            )}
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Especialidad
            </label>
            <input
              type="text"
              name="especialidad"
              value={formProfesor.especialidad}
              onChange={handleProfesorChange}
              className={`block w-full px-2 py-1 border rounded-[6px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                validationErrorsProfesor.especialidad ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Fútbol, Tenis, Gimnasia, etc."
            />
            {validationErrorsProfesor.especialidad && (
              <p className="text-red-500 text-sm mt-1">{validationErrorsProfesor.especialidad[0]}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 border border-gray-300 rounded-[6px] hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={isSavingProfesor}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-green-600 border border-transparent rounded-[6px] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSavingProfesor}
            >
              {isSavingProfesor ? 
                (editando ? 'Actualizando...' : 'Creando...') : 
                (editando ? 'Actualizar Profesor' : 'Crear Profesor')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfesorModal;