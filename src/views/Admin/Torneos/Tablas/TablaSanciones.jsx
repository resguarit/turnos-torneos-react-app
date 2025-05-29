import React, { useState } from 'react';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { ModalEditarSancion } from '../../Modals/ModalEditarSancion';
import ConfirmDeleteModal from '../../Modals/ConfirmDeleteModal';
import { Trash2, Pencil } from 'lucide-react';
import { decryptRole } from '@/lib/getRole';

export function TablaSanciones({ sanciones, onEdit, fechas = [], onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [sancionSeleccionada, setSancionSeleccionada] = useState(null);

  // Obtener el rol desencriptado
  const userRole = decryptRole(localStorage.getItem('user_role'));

  // Eliminar sanción
  const handleEliminar = async (id) => {
    try {
      const response = await api.delete(`/sanciones/${id}`);
      if (response.data?.status === 200) {
        toast.success('Sanción eliminada correctamente');
        setModalDeleteOpen(false);
        if (onRefresh) {
          onRefresh();
        } else {
          window.location.reload();
        }
      } else {
        toast.error(response.data?.message || 'Error al eliminar la sanción');
      }
    } catch (error) {
      toast.error('Error al eliminar la sanción');
    }
  };

  const handleEliminarModal = (item) => {
    setSancionSeleccionada(item);
    setModalDeleteOpen(true);
  };


  // Editar sanción (abre modal)
  const handleEditar = (item) => {
    setSancionSeleccionada(item);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSancionSeleccionada(null);
  };

  const handleModalDeleteClose = () => {
    setModalDeleteOpen(false);
    setSancionSeleccionada(null);
  };

  const handleModalUpdated = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Expulsados</h3>
      {sanciones.length > 0 ? (
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-white bg-black ">
                <th className="py-2 px-3 text-left font-medium min-w-[120px]">Jugador</th>
                <th className="py-2 px-3 text-left font-medium min-w-[100px]">Equipo</th>
                <th className="py-2 px-3 text-left font-medium min-w-[80px]">Tipo</th>
                <th className="py-2 px-3 text-left font-medium min-w-[120px]">Motivo</th>
                <th className="py-2 px-3 text-center font-medium min-w-[80px]">Fechas</th>
                {userRole === 'admin' && (
                <th className="py-2 px-3 text-center font-medium min-w-[80px]">Estado</th>
                )}
                {userRole === 'admin' && (
                  <th className="py-2 px-3 text-center font-medium min-w-[100px]">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sanciones.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 text-gray-700 truncate">{item.jugador?.nombre} {item.jugador?.apellido}</td>
                  <td className="py-2 px-3 text-gray-700 truncate">{item.equipo?.nombre}</td>
                  <td className="py-2 px-3 text-gray-700 truncate">{item.sancion?.tipo_sancion}</td>
                  <td className="py-2 px-3 text-gray-700 truncate">{item.sancion?.motivo}</td>
                  <td className="py-2 px-3 text-gray-700 text-center whitespace-nowrap">
                    {item.sancion?.cantidad_fechas || '-'}
                    {item.sancion?.fecha_inicio?.nombre && item.sancion?.fecha_fin?.nombre
                      ? item.sancion.cantidad_fechas === 1
                        ? ` (${item.sancion.fecha_inicio.nombre})`
                        : ` (${item.sancion.fecha_inicio.nombre} - ${item.sancion.fecha_fin.nombre})`
                      : ''}
                  </td>
                  {userRole === 'admin' && (
                  <td className="py-2 px-3 text-gray-700 text-center truncate"> {item.sancion?.estado}</td>
                  )}
                  {userRole === 'admin' && (
                    <td className='py-2 px-3'>
                      <div className='flex gap-2 justify-center items-center'>
                        <button
                          className="p-2"
                          onClick={() => handleEditar(item)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2"
                          onClick={() => handleEliminarModal(item)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4 bg-white">No hay sanciones registradas.</p>
      )}

      {/* Modal de edición */}
      <ModalEditarSancion
        open={modalOpen}
        onClose={handleModalClose}
        sancionData={sancionSeleccionada}
        onUpdated={handleModalUpdated}
        fechas={fechas}
      />
      <ConfirmDeleteModal
        isOpen={modalDeleteOpen}
        onClose={handleModalDeleteClose}
        onConfirm={() => handleEliminar(sancionSeleccionada?.sancion?.id)}
        loading={false}
        accionTitulo="Eliminación"
        accion="eliminar"
        pronombre="la"
        entidad="sanción"
        accionando="Eliminando"
      />

    </div>
  );
}