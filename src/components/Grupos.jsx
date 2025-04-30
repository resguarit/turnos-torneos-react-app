import { PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Grupos({ teams }) {
  // Divide teams into 4 groups
  const groupSize = Math.ceil(teams.length / 4)
  const groups = {
    A: teams.slice(0, groupSize),
    B: teams.slice(groupSize, groupSize * 2),
    C: teams.slice(groupSize * 2, groupSize * 3),
    D: teams.slice(groupSize * 3, groupSize * 4)
  }

  return (
    {zona.formato === 'Grupos' && (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium">Grupos</h2>
          <button
            onClick={handleToggleEditMode}
            className={`py-2 px-4 rounded-md text-white ${
              editMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {editMode ? 'Cancelar Edición' : 'Editar Grupos'}
          </button>
        </div>
    
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map((grupo, index) => (
            <div key={grupo.id || index} className="bg-white p-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold mb-2">Grupo {index + 1}</h3>
              <div className="space-y-2">
                {grupo.equipos.map((equipo) => (
                  <div key={equipo.id} className="flex items-center gap-2">
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
                ))}
              </div>
              {editMode && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={grupo.searchTerm || ''}
                    onChange={(e) => handleBuscarEquipoEnGrupo(index, e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                  {grupo.filteredEquipos && grupo.filteredEquipos.length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                      {grupo.filteredEquipos.map((equipo) => (
                        <li
                          key={equipo.id}
                          className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleAgregarEquipoAGrupo(grupo.id, equipo)}
                        >
                          <span>{equipo.nombre}</span>
                          <button className="text-blue-500">Agregar</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
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
    )}
}
