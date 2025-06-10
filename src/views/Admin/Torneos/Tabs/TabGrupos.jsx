import React, { useState } from 'react';
import { Trash2, Edit3, Shuffle } from 'lucide-react';
import api from '@/lib/axiosConfig'; // Asegúrate de importar tu configuración de Axios
import { toast } from 'react-toastify'; // Importar toastify para notificaciones
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos de toastify

export function TabGrupos({
  zona,
  grupos,
  numGrupos,
  setNumGrupos,
  handleActualizarGrupos,
  handleEliminarEquipoDeGrupo,
  handleEliminarGrupos,
  editMode,
  setModalVisible,
  gruposCreados,
  handleAgregarEquipoAGrupo,
}) {
  
  const [editingGroupId, setEditingGroupId] = useState(null)

  return (
    <div>
      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-2xl font-medium mb-4">Grupos</h2>
        {gruposCreados && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label htmlFor="numGrupos" className="text-sm font-medium">
                Cantidad de Grupos:
              </label>
              <input
                id="numGrupos"
                type="number"
                min="1"
                value={numGrupos}
                onChange={(e) => setNumGrupos(e.target.value)}
                className="w-16 border border-gray-300 rounded-[6px] p-1 text-center"
              />
            </div>

            <button
              onClick={handleActualizarGrupos}
              className="py-2 px-4 text-sm rounded-[6px] items-center flex gap-2 bg-green-500  hover:bg-green-600 text-white"
            >
              Sortear Grupos <Shuffle size={16}  />
            </button>
          </div>
          )}
        </div>
    
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.isArray(grupos) && grupos.length > 0 ? (
          grupos.map((grupo, index) => (
            <div key={grupo.id || index} className="bg-white p-4 rounded-[6px] shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold">Grupo {index + 1}</h3>
                {/* Mostrar botón de editar solo si el grupo tiene equipos */}
                {Array.isArray(grupo.equipos) && grupo.equipos.length > 0 && (
                  <button
                    onClick={() => setEditingGroupId(grupo.id === editingGroupId ? null : grupo.id)}
                    className="text-gray-500 hover:text-blue-500"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-2 w-full">
                {(grupo.equipos || []).map((equipo) => (
                  <div key={equipo.id} className="flex items-center  gap-1">
                    {editingGroupId === grupo.id ? (
                      <>
                        <input
                          type="text"
                          value={equipo.nombre}
                          disabled
                          className="flex-1 w-full border border-gray-300  p-1"
                        />
                        <button
                          onClick={() => handleEliminarEquipoDeGrupo(grupo.id, equipo.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <span className="flex-1">{equipo.nombre}</span>
                    )}
                  </div>
                ))}
                {/* Dropdown para agregar equipos */}
                {editingGroupId === grupo.id && Array.isArray(grupo.equipos) && grupo.equipos.length > 0 && (
                  <div className="mt-2">
                    <select
                      onChange={(e) => {
                        const equipoId = e.target.value;
                        if (equipoId) {
                          handleAgregarEquipoAGrupo(grupo.id, equipoId);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md p-2"
                      defaultValue=""
                    >
                      <option value="">Agregar equipo...</option>
                      {zona.equipos
                        .filter(
                          (equipo) =>
                            Array.isArray(grupo.equipos) &&
                            !grupo.equipos.some((e) => e.id === equipo.id)
                        )
                        .map((equipo) => (
                          <option key={equipo.id} value={equipo.id}>
                            {equipo.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No hay grupos disponibles.</p>
        )}
      </div>

        {editMode && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleActualizarGrupos}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Guardar Cambios
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        {zona.formato === 'Grupos' && !gruposCreados && zona.equipos.length > 0 && (
          <button
            onClick={() => setModalVisible(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-[6px] text-sm"
          >
            Crear Grupos
          </button>
        )}
        {zona.formato === 'Grupos' && gruposCreados && (
          <button
            onClick={handleEliminarGrupos}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-[6px] text-sm mt-2"
          >
            Eliminar Grupos
          </button>
        )}
      </div>
    </div>
  );
}