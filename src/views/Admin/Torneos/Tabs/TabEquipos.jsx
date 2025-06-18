import { Users, Edit3, Trash2, Eye, CreditCard, RefreshCw, MoreHorizontal } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import ConfirmDeleteModal from '@/views/Admin/Modals/ConfirmDeleteModal';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function TabEquipos({ zona, navigate, zonaId, handleEliminarEquipo, handleReemplazarEquipo, handleNavigateToVerPagos }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipoAEliminar, setEquipoAEliminar] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const dropdownRefs = useRef({});

  // Estado para manejar la carga de imágenes
  useEffect(() => {
    const initialImageState = {};
    if (zona.equipos) {
      zona.equipos.forEach(equipo => {
        initialImageState[equipo.id] = !!equipo.escudo;
      });
      setImageLoading(initialImageState);
    }
  }, [zona.equipos]);

  // Cierra el dropdown si se hace click fuera
  const handleClickOutside = (event) => {
    if (
      dropdownOpenId &&
      dropdownRefs.current[dropdownOpenId] &&
      !dropdownRefs.current[dropdownOpenId].contains(event.target)
    ) {
      setDropdownOpenId(null);
    }
  };

  useEffect(() => {
    if (dropdownOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpenId]);

  const handleConfirmDelete = async () => {
    setLoadingDelete(true);
    await handleEliminarEquipo(equipoAEliminar);
    setLoadingDelete(false);
    setShowDeleteModal(false);
    setEquipoAEliminar(null);
  };

  const handleImageLoad = (equipoId) => {
    setImageLoading(prev => ({ ...prev, [equipoId]: false }));
  };

  const handleImageError = (equipoId) => {
    setImageLoading(prev => ({ ...prev, [equipoId]: true }));
  };

  return (
    <div className="bg-white rounded-[8px] shadow-md p-4">
      <div className="w-full flex items-center justify-between mb-4">
        <h2 className="text-2xl font-medium">Equipos</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Total de equipos: {zona.equipos?.length || 0}
          </span>
          <button 
            onClick={() => navigate(`/alta-equipo/${zonaId}`)} 
            className="bg-secundario hover:bg-secundario/80 p-2 text-sm font-inter rounded-[6px] text-white transition-colors duration-200"
          >
            + Cargar Equipo
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        {zona.equipos && zona.equipos.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No hay equipos en esta zona</p>
            <button 
              onClick={() => navigate(`/alta-equipo/${zonaId}`)}
              className="text-secundario hover:text-secundario/80 font-medium"
            >
              Agregar el primer equipo
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow">
            <div className="max-h-fit overflow-y-auto">
              <table className="w-full">
                <tbody>
                  {zona.equipos && zona.equipos.map((equipo) => (
                    <tr 
                      key={equipo.id} 
                      className="border-b items-center rounded-[6px] border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2 flex items-center gap-3">
                        {/* Escudo del equipo con manejo de carga */}
                        <div className="relative">
                          {equipo.escudo ? (
                            <>
                              {(imageLoading[equipo.id] === undefined || imageLoading[equipo.id]) && (
                                <Skeleton className="w-14 h-14 rounded-full" />
                              )}
                              <img
                                src={`${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/storage/${equipo.escudo}`}
                                alt={`Escudo de ${equipo.nombre}`}
                                className={`w-14 h-14 rounded-full object-cover border border-gray-200 bg-white ${
                                  (imageLoading[equipo.id] === undefined || imageLoading[equipo.id])
                                    ? 'hidden'
                                    : 'block'
                                }`}
                                style={{ minWidth: 32, minHeight: 32 }}
                                onLoad={() => handleImageLoad(equipo.id)}
                                onError={() => handleImageError(equipo.id)}
                              />
                            </>
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400 font-bold text-lg" style={{ minWidth: 32, minHeight: 32 }}>
                              <Users className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{equipo.nombre}</span>
                      </td>
                      <td className="text-right p-3 items-center flex-row justify-center">
                        <div className='flex items-center w-full justify-end space-x-4'>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 rounded-[6px] border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                            onClick={() => {
                              localStorage.setItem('zona_id', zonaId);
                              navigate(`/jugadores/${equipo.id}`, {
                                state: {
                                  equipoNombre: equipo.nombre,
                                  zonaId: zonaId,
                                },
                              });
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Jugadores
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 rounded-[6px] border-green-200 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                            onClick={() => handleNavigateToVerPagos(equipo.id)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Ver Pagos
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 rounded-[6px] border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                            onClick={() => handleReemplazarEquipo(equipo.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reemplazar
                          </Button>
                          {/* Dropdown personalizado */}
                          <div className="relative" ref={el => dropdownRefs.current[equipo.id] = el}>
                            <button
                              className="h-8 w-8 p-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                              onClick={() => setDropdownOpenId(dropdownOpenId === equipo.id ? null : equipo.id)}
                              aria-label="Más opciones"
                              type="button"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {dropdownOpenId === equipo.id && (
                              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <button
                                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                                  onClick={() => {
                                    setDropdownOpenId(null);
                                    navigate(`/editar-equipo/${equipo.id}`);
                                  }}
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Editar equipo
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                                  onClick={() => {
                                    setDropdownOpenId(null);
                                    setEquipoAEliminar(equipo.id);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar equipo
                                </button>
                              </div>
                            )}
                          </div>
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
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        loading={loadingDelete}
        accionTitulo="eliminación"
        accion="eliminar"
        pronombre="el"
        entidad="equipo"
        accionando="Eliminando"
        nombreElemento={equipoAEliminar ? zona.equipos.find(e => e.id === equipoAEliminar)?.nombre : undefined}
      />
    </div>
  );
}