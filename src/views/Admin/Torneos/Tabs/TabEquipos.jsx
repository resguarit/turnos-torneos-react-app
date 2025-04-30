import { Users, Edit3, Trash2 } from 'lucide-react';

export function TabEquipos({ zona, navigate, zonaId, handleEliminarEquipo, handleReemplazarEquipo }) {
  return (
    <div className="bg-white rounded-[8px] shadow-md p-4">
      <div className="w-full flex items-center justify-between mb-4">
        <h2 className="text-2xl font-medium">Equipos</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Total de equipos: {zona.equipos?.length || 0}
          </span>
          <button onClick={() => navigate(`/alta-equipo/${zonaId}`)} className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white">
            + Cargar Equipo
          </button>
        </div>
      </div>
      <div className="mt-4">
        {zona.equipos && zona.equipos.length === 0 ? (
          <p className="text-center text-gray-500">No hay equipos en esta zona.</p>
        ) : (
          <div className="overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full">
                <tbody>
                  {zona.equipos && zona.equipos.map((equipo) => (
                    <tr key={equipo.id} className="border-b items-center rounded-[6px] border-gray-200 last:border-0">
                      <td className="p-3 flex items-center">
                        <div className="w-6 bg-primary items-center justify-center"></div>
                        <span className="font-medium">{equipo.nombre}</span>
                      </td>
                      <td className="text-right p-3 items-center flex-row justify-center">
                        <div className='flex items-center w-full justify-end space-x-4'>
                          <button
                            onClick={() => {
                              localStorage.setItem('zona_id', zonaId); 
                              navigate(`/jugadores/${equipo.id}`); 
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-[6px] text-sm"
                          >
                            Ver Jugadores
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/pagos/${equipo.id}`); 
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-[6px] text-sm"
                          >
                            Ver Pagos
                          </button>
                          <button
                            onClick={() => handleReemplazarEquipo(equipo.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded-[6px] text-sm"
                          >
                            Reemplazar
                          </button>
                          <button
                            onClick={() => navigate(`/editar-equipo/${equipo.id}`)}
                            className="items-center flex-row text-blue-500 py-1 text-sm"
                          >
                            <Edit3 className="w-5" />
                          </button>
                          <button
                            onClick={() => handleEliminarEquipo(equipo.id)}
                            className="text-red-500 py-1 rounded-[6px] text-sm"
                          >
                            <Trash2 className="w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}