"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Edit3, Trash2, Clock, CopyPlus, Calendar, Trophy, Users, MapPin } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import api from '@/lib/axiosConfig'
import BtnLoading from "@/components/BtnLoading"
import EditFechaModal from '../Modals/EditFechaModal'
import PostergarFechasModal from '../Modals/PostergarFechasModal'
import AsignarHoraYCanchaModal from '../Modals/AsignarHoraYCancha'; // Importa el modal
import EditPartidoModal from '../Modals/EditPartidoModal'; // Importar el modal para editar partidos
import CrearFechaModal from "../Modals/CrearFechaModal";
import AgregarPartidoModal from "../Modals/AgregarPartidoModal"; // Importar el modal
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { formatearFechaCorta, formatearRangoHorario } from '@/utils/dateUtils'
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal'

export default function FechaCarousel({ zonaId, equipos, onFechasDeleted, abortController, deporteId }) {
  const [fechas, setFechas] = useState([]);
  const [currentFechaIndex, setCurrentFechaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingDeleteAll, setLoadingDeleteAll] = useState(false); // Loading para "Eliminar Todas las Fechas"
  const [loadingPostergar, setLoadingPostergar] = useState(false); // Loading para "Postergar Todas las Fechas"
  const [loadingAsignar, setLoadingAsignar] = useState(false); // Loading para "Asignar Cancha y Hora"
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalPostergarVisible, setModalPostergarVisible] = useState(false);
  const [modalAsignarVisible, setModalAsignarVisible] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [horariosModal, setHorariosModal] = useState([]); // Estado para los horarios del modal
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false); // Estado para mostrar el modal de confirmación
  const [selectedPartido, setSelectedPartido] = useState(null); // Estado para el partido seleccionado
  const [modalEditPartidoVisible, setModalEditPartidoVisible] = useState(false); // Estado para mostrar el modal
  const [modalCrearFechaVisible, setModalCrearFechaVisible] = useState(false);
  const [modalAgregarPartidoVisible, setModalAgregarPartidoVisible] = useState(false);
  const [modalEliminarPartido, setModalEliminarPartido] = useState(false); // Estado para mostrar el modal de eliminar partido
  const [selectedPartidoEliminar, setSelectedPartidoEliminar] = useState(null); // Estado para el partido seleccionado para eliminar
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await api.get(`/zonas/${zonaId}/fechas`, {
          signal: abortController?.signal
        });
        const fetchedFechas = response.data;

        if (!fetchedFechas || fetchedFechas.length === 0) {
          console.error('No hay fechas disponibles');
          setFechas([]);
          return;
        }

        setFechas(fetchedFechas);

        // Establecer el índice inicial en la primera fecha con estado "Pendiente"
        const firstPendingIndex = fetchedFechas.findIndex(fecha => fecha.estado === 'Pendiente');
        setCurrentFechaIndex(firstPendingIndex !== -1 ? firstPendingIndex : 0);

        const primeraFecha = fetchedFechas[0]?.fecha_inicio;
        if (primeraFecha && deporteId) {
          const responseHorariosModal = await api.get('/horarios-dia', { 
            params: { fecha: primeraFecha, deporte_id: deporteId },
            signal: abortController?.signal
          });
          if (responseHorariosModal.status === 200) {
            setHorariosModal(responseHorariosModal.data.horarios);
          }
        } else {
          console.error('No se pudo obtener la primera fecha');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching dates:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFechas();
  }, [zonaId, abortController, deporteId]);

  const handleEditFecha = async (updatedFecha) => {
    try {
      setLoading(true);
      const response = await api.put(`/fechas/${updatedFecha.id}`, updatedFecha);
      if (response.status === 200) {
        setFechas(fechas.map(fecha => fecha.id === updatedFecha.id ? updatedFecha : fecha));
        setModalEditVisible(false);
      }
    } catch (error) {
      console.error('Error updating date:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFecha = async (fechaId) => {
    try {
      setLoading(true);
      await api.delete(`/fechas/${fechaId}`, {
        signal: abortController?.signal
      });
      toast.success('Fecha eliminada correctamente');
      onFechasDeleted();
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Error al eliminar la fecha');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllFechas = async () => {
    try {
      setLoadingDeleteAll(true);
      const fechaIds = fechas.map(fecha => fecha.id);
      await api.delete('/fechas', { data: { fecha_ids: fechaIds } });
      setFechas([]);
      
      if (onFechasDeleted && typeof onFechasDeleted === 'function') {
        onFechasDeleted();
      }
    } catch (error) {
      console.error('Error deleting all dates:', error);
    } finally {
      setLoadingDeleteAll(false);
      setShowDeleteAllModal(false);
    }
  };

  const handlePostergarFechas = async (fechaId) => {
    try {
      setLoadingPostergar(true);
      const response = await api.post(`/fechas/${fechaId}/postergar`);
      if (response.status === 200) {
        const updatedFechas = await api.get(`/zonas/${zonaId}/fechas`);
        setFechas(updatedFechas.data);
        setModalPostergarVisible(false);
      }
    } catch (error) {
      console.error('Error postponing dates:', error);
    } finally {
      setLoadingPostergar(false);
    }
  };

  const handleAsignarHoraYCancha = async () => {
    try {
      setLoadingAsignar(true);
      setModalAsignarVisible(true);
    } catch (error) {
      console.error('Error assigning time and field:', error);
    } finally {
      setLoadingAsignar(false);
    }
  };

  const handleEditPartido = (partido) => {
    setSelectedPartido(partido);
    setModalEditPartidoVisible(true);
  };

  const handlePartidoUpdated = (updatedPartido) => {
    setFechas((prevFechas) =>
      prevFechas.map((fecha) =>
        fecha.id === updatedPartido.fecha_id
          ? {
              ...fecha,
              partidos: fecha.partidos.map((partido) =>
                partido.id === updatedPartido.id ? updatedPartido : partido
              ),
            }
          : fecha
      )
    );
  };

  const handleFechaCreada = (nuevaFecha) => {
    // Actualiza las fechas en el carrusel después de crear una nueva
    setFechas((prevFechas) => [...prevFechas, nuevaFecha]);
  };

  const handlePartidoAgregado = async () => {
    try {
      setLoading(true); // Mostrar el estado de carga
      const response = await api.get(`/zonas/${zonaId}/fechas`);
      setFechas(response.data); // Actualizar las fechas con los datos más recientes
    } catch (error) {
      console.error("Error al recargar las fechas:", error);
    } finally {
      setLoading(false); // Ocultar el estado de carga
    }
  };

  const handleDeletePartido = async () => {
    try {
      setLoading(true);
      const response = await api.delete(`/partidos/${selectedPartidoEliminar}`);
      if (response.status === 200) {
        setFechas((prevFechas) =>
          prevFechas.map((fecha) =>
            fecha.id === selectedFecha.id
              ? {
                  ...fecha,
                  partidos: fecha.partidos.filter((partido) => partido.id !== selectedPartidoEliminar),
                }
              : fecha
          )
        );
        setModalEliminarPartido(false);
      }
    } catch (error) {
      console.error('Error deleting match:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentFechaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }

  const goToNext = () => {
    setCurrentFechaIndex((prev) => (prev < fechas.length - 1 ? prev + 1 : prev));
  }

  if (loading) {
    return <div className="w-full justify-center flex"><BtnLoading /></div>
  }

  if (!fechas || fechas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-4">
          No hay fechas disponibles
          <div className="flex items-center justify-center pt-4">
            <button
              onClick={() => setModalCrearFechaVisible(true)}
              className="bg-black text-white text-xs px-3 py-2 rounded-[6px] hover:bg-green-600"
            >
              + Agregar Fecha Única
            </button>
          </div>
        
        {modalCrearFechaVisible && (
          <CrearFechaModal
            zonaId={zonaId}
            equipos={equipos}
            onClose={() => setModalCrearFechaVisible(false)}
            onFechaCreada={handleFechaCreada}
          />
        )}
      </div>
      </div>
    )
  }

  const currentFecha = fechas[currentFechaIndex]


  return (
    <div className="mt-10 w-full  mx-auto bg-gray-100 overflow-hidden">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setModalCrearFechaVisible(true)}
          className="bg-green-500 text-white text-sm px-3 py-2 rounded-[6px] hover:bg-green-600"
        >
          + Agregar Fecha
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-white border-b rounded-t-[8px]">
        <button
          onClick={goToPrevious}
          disabled={currentFechaIndex === 0}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="gap-2 flex items-center">
          <h2 className="text-lg font-medium">
            {currentFecha.nombre} - {currentFecha.fecha_inicio ? format(parseISO(currentFecha.fecha_inicio), 'dd/MM/yyyy', { locale: es }) : ""}
          </h2>
          <span
            className={`text-xs p-1 rounded-xl ${
              currentFecha.estado === 'Pendiente'
                ? 'bg-yellow-300 text-yellow-700'
                : currentFecha.estado === 'En Curso'
                ? 'bg-blue-300 text-blue-700'
                : currentFecha.estado === 'Finalizada'
                ? 'bg-green-300 text-green-700'
                : currentFecha.estado === 'Suspendida'
                ? 'bg-gray-300 text-gray-700'
                : 'bg-red-300 text-red-700'
            }`}
          >
            {`${currentFecha.estado}`}
          </span>
        </div>
        <button
          onClick={goToNext}
          disabled={currentFechaIndex === fechas.length - 1}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {currentFecha.partidos && currentFecha.partidos.length > 0 ? (
          currentFecha.partidos.map((partido) => {
            // Si hay penales cargados para este partido
            const penales = Array.isArray(partido.penales) && partido.penales.length > 0 ? partido.penales[0] : null;

            return (
              <div 
                key={partido.id} 
                className="p-3 bg-gray-200 rounded-lg my-2 cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => navigate(`/resultado-partido/${zonaId}/${partido.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    {/* Escudo o círculo color equipo local */}
                    {(() => {
                      const equipoLocal = equipos.find(e => e.id === partido.equipo_local_id);
                      if (equipoLocal?.escudo) {
                        return (
                          <img
                            src={`${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/storage/${equipoLocal.escudo}`}
                            alt="Escudo local"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-white"
                            style={{ minWidth: 24, minHeight: 24 }}
                          />
                        );
                      }
                      return (
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: equipoLocal?.color || "#ccc" }}
                        />
                      );
                    })()}
                    <span className="font-medium">
                      {partido.equipos.find(e => e.id === partido.equipo_local_id)?.nombre || 
                       (partido.equipos[0] ? partido.equipos[0].nombre : 'Equipo no asignado')}
                    </span>
                  </div>

                  {partido.estado === 'Finalizado' ? (
                    <span className="mx-2 font-bold flex flex-col items-center">
                      <span className={penales ? "line-through decoration-2 decoration-red-500" : ""}>
                        {partido.marcador_local ?? '-'} - {partido.marcador_visitante ?? '-'}
                      </span>
                    </span>
                  ) : (
                    <span className="mx-2 font-bold">-</span>
                  )}

                  <div className="flex items-center space-x-2 flex-1 justify-end">
                    <span className="font-medium">
                      {partido.equipos.find(e => e.id === partido.equipo_visitante_id)?.nombre || 
                       (partido.equipos[1] ? partido.equipos[1].nombre : 'Equipo no asignado')}
                    </span>
                    {/* Escudo o círculo color equipo visitante */}
                    {(() => {
                      const equipoVisitante = equipos.find(e => e.id === partido.equipo_visitante_id);
                      if (equipoVisitante?.escudo) {
                        return (
                          <img
                            src={`${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/storage/${equipoVisitante.escudo}`}
                            alt="Escudo visitante"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-white"
                            style={{ minWidth: 24, minHeight: 24 }}
                          />
                        );
                      }
                      return (
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: equipoVisitante?.color || "#ccc" }}
                        />
                      );
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-3 mt-2 text-sm text-gray-600">
                  <span className="text-left">Cancha: {partido.cancha?.nro || 'No Definido'}</span>
                  <div>
                    {penales && (
                        <span className="text-sm font-semibold text-gray-700 flex items-center justify-center mt-1">
                          <span className="">({penales.penales_local ?? 0}</span>
                          <span className="mx-1 ">-</span>
                          <span className="">{penales.penales_visitante ?? 0})</span>
                        </span>
                      )}
                  </div>
                  <span className="text-right">
                    Hora: {partido.horario?.hora_inicio && partido.horario?.hora_fin ? formatearRangoHorario(partido.horario.hora_inicio, partido.horario.hora_fin) : "No Definido"}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation();
                      setSelectedPartidoEliminar(partido.id);
                      {console.log(partido)}
                      setModalEliminarPartido(true);
                    }}
                    className="text-black text-sm py-1 rounded-[6px] hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPartido(partido);
                    }}
                    className="bg-blue-500 text-white text-sm px-2 py-1 rounded-[6px] hover:bg-blue-600"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">No hay partidos para esta fecha</div>
        )}
      </div>
        <div className="p-3 justify-center flex bg-white rounded-b-[8px] my-2 gap-5">
  {/* Botón de eliminar fecha */}
  <div className="relative group items-center flex">
    <button
      onClick={() => {
        setSelectedFecha(currentFecha);
        setModalDeleteVisible(true);
      }}
    >
      <Trash2 size={18} />
    </button>
    <div className="absolute whitespace-nowrap bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
      Eliminar Fecha
    </div>
  </div>

  {/* Botón de editar fecha */}
  <div className="relative group items-center flex">
    <button
      onClick={() => {
        setSelectedFecha(currentFecha);
        setModalEditVisible(true);
      }}
    >
      <Edit3 size={18} />
    </button>
    <div className="absolute whitespace-nowrap bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
      Editar Fecha
    </div>
  </div>

  {/* Botón de agregar partido */}
  <div className="relative group items-center flex">
    <button
      onClick={() => {
        setSelectedFecha(currentFecha);
        setModalAgregarPartidoVisible(true);
      }}
    >
      <CopyPlus size={18} />
    </button>
    <div className="absolute bottom-8 whitespace-nowrap left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
      Agregar Partido
    </div>
  </div>
</div>

      <div className="flex justify-between ">
        <button
          className={`bg-red-500 hover:bg-red-600 text-sm text-white py-2 px-4 rounded-[6px] ${
            loadingDeleteAll ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={() => setShowDeleteAllModal(true)} // Mostrar el modal de confirmación
          disabled={loadingDeleteAll}
        >
          {loadingDeleteAll ? 'Eliminando...' : 'Eliminar Todas las Fechas'}
        </button>
        <button
          className={`bg-red-500 hover:bg-red-600 text-sm text-white py-2 px-4 rounded-[6px] ${
            loadingPostergar ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={() => setModalPostergarVisible(true)}
          disabled={loadingPostergar}
        >
          {loadingPostergar ? 'Postergando...' : 'Postergar Todas las Fechas'}
        </button>
      </div>
      <button
        className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-[6px] text-sm mt-4 ${
          loadingAsignar ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={handleAsignarHoraYCancha}
        disabled={loadingAsignar}
      >
        {loadingAsignar ? 'Asignando...' : 'Asignar Cancha y Hora'}
      </button>

      {/* Modal de confirmación de eliminacion de todas las fechas */}
      <ConfirmDeleteModal
        isOpen={showDeleteAllModal}
        onConfirm={handleDeleteAllFechas}
        onClose={() => setShowDeleteAllModal(false)}
        accionTitulo="Eliminación"
        accion="eliminar"
        pronombre="todas las"
        entidad="fechas"
        accionando="Eliminando"
        loading={loadingDeleteAll}
      />
      

      {modalEditVisible && (
        <EditFechaModal
          fecha={selectedFecha}
          equipos={equipos}
          onSave={handleEditFecha}
          onClose={() => setModalEditVisible(false)}
        />
      )}

      {/*Modal de confirmacion de eliminacion de una fecha especifica*/ }
      <ConfirmDeleteModal
        isOpen={modalDeleteVisible}
        onConfirm={() => handleDeleteFecha(selectedFecha.id)}
        onClose={() => setModalDeleteVisible(false)}
        accionTitulo="Eliminación"
        accion="eliminar"
        pronombre="la"
        entidad="fecha"
        accionando="Eliminando"
        nombreElemento={
            selectedFecha
              ? `${selectedFecha.nombre} - ${format(parseISO(selectedFecha.fecha_inicio), 'dd/MM/yyyy', { locale: es })}`
              : undefined
          }      
        />
      
      {modalPostergarVisible && (
        <PostergarFechasModal
          fechas={fechas}
          onSave={handlePostergarFechas}
          onClose={() => setModalPostergarVisible(false)}
        />
      )}

      
      {modalAsignarVisible && (
        <AsignarHoraYCanchaModal
        zonaId={zonaId}
        horarios={horariosModal} // Pasa los horarios al modal
        onClose={() => setModalAsignarVisible(false)}
        />
      )}

      {modalEditPartidoVisible && selectedPartido && (
        <EditPartidoModal
          partido={selectedPartido}
          equipos={equipos} // Asegúrate de pasar equipos aquí
          onClose={() => setModalEditPartidoVisible(false)}
          onSave={handlePartidoUpdated}
          deporteId={deporteId} // Pasa el deporteId al modal
        />
      )}

      {modalCrearFechaVisible && (
        <CrearFechaModal
          zonaId={zonaId}
          equipos={equipos}
          onClose={() => setModalCrearFechaVisible(false)}
          onFechaCreada={handleFechaCreada}
        />
      )}

      {/* Modal para agregar partido */}
      {modalAgregarPartidoVisible && (
        <AgregarPartidoModal
          fecha={selectedFecha}
          equipos={equipos}
          onClose={() => setModalAgregarPartidoVisible(false)}
          onPartidoAgregado={handlePartidoAgregado}
        />
      )}


      {/* Modal para eliminar partido */}
      <ConfirmDeleteModal
        isOpen={modalEliminarPartido}
        onConfirm={handleDeletePartido}
        onClose={() => setModalEliminarPartido(false)}
        accionTitulo="Eliminación"
        accion="eliminar"
        pronombre="el"
        entidad="partido"
        accionando="Eliminando"
        nombreElemento={
          selectedPartidoEliminar
            ? currentFecha.partidos.find(p => p.id === selectedPartidoEliminar)?.equipos[0]?.nombre + ' vs ' + currentFecha.partidos.find(p => p.id === selectedPartidoEliminar)?.equipos[1]?.nombre
            : undefined
        }    
        />

    </div>
  )
}

