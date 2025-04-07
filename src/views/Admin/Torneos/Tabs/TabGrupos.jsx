import React from 'react';
import { Trash2 } from 'lucide-react';
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
}) {
  
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
                className="w-16 border border-gray-300 rounded-md p-1 text-center"
              />
            </div>

            <button
              onClick={handleActualizarGrupos}
              className="py-2 px-4 rounded-md bg-green-500 hover:bg-green-600 text-white"
            >
              Sortear Grupos de Nuevo
            </button>
          </div>
          )}
        </div>
    
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(grupos) && grupos.length > 0 ? (
            grupos.map((grupo, index) => (
              <div key={grupo.id || index} className="bg-white p-4 rounded-md shadow-md">
                <h3 className="text-lg font-bold mb-2">Grupo {index + 1}</h3>
                <div className="space-y-2">
                  {Array.isArray(grupo.equipos) && grupo.equipos.length > 0 ? (
                    grupo.equipos.map((equipo) => (
                      <div key={equipo.id} className="flex items-center gap-1">
                        {editMode ? (
                          <>
                            <input
                              type="text"
                              value={equipo.nombre}
                              disabled
                              className="flex-1 border border-gray-300 rounded-md p-2"
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
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No hay equipos en este grupo.</p>
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
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-[6px] text-sm mt-4"
          >
            Eliminar Grupos
          </button>
        )}
      </div>
    </div>
  );
}