"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Edit3, Trash2, Clock } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import api from '@/lib/axiosConfig'
import BtnLoading from "@/components/BtnLoading"
import EditFechaModal from './EditFechaModal'
import PostergarFechasModal from './PostergarFechasModal'
import AsignarHoraYCanchaModal from './AsignarHoraYCancha'; // Importa el modal


export default function FechaCarousel({ zonaId, equipos, onFechasDeleted }) {
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

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await api.get(`/zonas/${zonaId}/fechas`);
        const fetchedFechas = response.data;

        if (!fetchedFechas || fetchedFechas.length === 0) {
          console.error('No hay fechas disponibles');
          setFechas([]);
          return;
        }

        setFechas(fetchedFechas);

        const canchasResponse = await api.get(`/canchas`);
        setCanchas(canchasResponse.data.canchas);

        // Obtener horarios
        const horariosResponse = await api.get(`/horarios`);
        setHorarios(horariosResponse.data.horarios);

        // Verifica si hay fechas antes de acceder a la primera
        const primeraFecha = fetchedFechas[0]?.fecha_inicio;
        if (primeraFecha) {
          const responseHorariosModal = await api.get('/horarios-dia', { params: { fecha: primeraFecha } });
          if (responseHorariosModal.status === 200) {
            setHorariosModal(responseHorariosModal.data.horarios);
          }
        } else {
          console.error('No se pudo obtener la primera fecha');
        }
      } catch (error) {
        console.error('Error fetching dates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFechas();
  }, [zonaId]);

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

  const handleDeleteFecha = async () => {
    try {
      setLoading(true);
      const response = await api.delete(`/fechas/${selectedFecha.id}`);
      if (response.status === 200) {
        setFechas(fechas.filter(fecha => fecha.id !== selectedFecha.id));
        setModalDeleteVisible(false);
      }
    } catch (error) {
      console.error('Error deleting date:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllFechas = async () => {
    try {
      setLoadingDeleteAll(true);
      for (const fecha of fechas) {
        await api.delete(`/fechas/${fecha.id}`);
      }
      setFechas([]);

      // Llamar a la función callback para notificar al componente padre
      if (onFechasDeleted && typeof onFechasDeleted === 'function') {
        onFechasDeleted();
      }
    } catch (error) {
      console.error('Error deleting all dates:', error);
    } finally {
      setLoadingDeleteAll(false);
      setShowDeleteAllModal(false); // Cerrar el modal después de la eliminación
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
    return <div className="text-center p-4">No hay fechas disponibles</div>
  }

  const currentFecha = fechas[currentFechaIndex]

  const formattedDate = currentFecha.fecha_inicio
    ? format(parseISO(currentFecha.fecha_inicio), "dd/MM/yyyy", { locale: es })
    : ""


  return (
    <div className="mt-10 w-full  mx-auto bg-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-white border-b rounded-t-[8px]">
        <button
          onClick={goToPrevious}
          disabled={currentFechaIndex === 0}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
<div className="gap-2 flex items-center ">
        <h2 className="text-lg font-medium">
          {currentFecha.nombre} - {formattedDate}
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
            const cancha = partido.cancha ? `${partido.cancha.nro} - ${partido.cancha.tipo_cancha}` : "No Definido";
            const horario = partido.horario ? `${partido.horario.hora_inicio} - ${partido.horario.hora_fin}` : "No Definido";
            const marcadorLocal = partido.marcador_local ?? "-";
            const marcadorVisitante = partido.marcador_visitante ?? "-";

            return (
              <div
                key={partido.id}
                className="p-3 bg-gray-200 rounded-lg my-2 cursor-pointer"
                onClick={() => navigate(`/resultado-partido/${partido.id}`)} // Navegar al resultado del partido
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: equipos.find(e => e.id === partido.equipo_local_id)?.color || "#ccc" }}
                    />
                    <span className="font-medium">
                      {equipos.find(e => e.id === partido.equipo_local_id)?.nombre || `Equipo ${partido.equipo_local_id}`}
                    </span>
                  </div>

                  <span className="mx-2 font-bold">
                    {marcadorLocal} - {marcadorVisitante}
                  </span>

                  <div className="flex items-center space-x-2 flex-1 justify-end">
                    <span className="font-medium">
                      {equipos.find(e => e.id === partido.equipo_visitante_id)?.nombre || `Equipo ${partido.equipo_visitante_id}`}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: equipos.find(e => e.id === partido.equipo_visitante_id)?.color || "#ccc" }}
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Cancha: {cancha}</span>
                  <span>Hora: {horario}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">No hay partidos para esta fecha</div>
        )}
      </div>
        <div className="p-3 justify-center flex bg-white rounded-b-[8px] my-2 gap-5">
          <button
            onClick={() => {
              setSelectedFecha(currentFecha);
              setModalDeleteVisible(true);
            }}
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedFecha(currentFecha);
              setModalEditVisible(true);
            }}
          >
            <Edit3 size={18} />
          </button>
        </div>

      <div className="flex justify-between ">
        <button
          className={`bg-red-500 hover:bg-red-600 text-sm text-white py-1 px-4 rounded-[6px] ${
            loadingDeleteAll ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={() => setShowDeleteAllModal(true)} // Mostrar el modal de confirmación
          disabled={loadingDeleteAll}
        >
          {loadingDeleteAll ? 'Eliminando...' : 'Eliminar Todas las Fechas'}
        </button>
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-sm text-white py-1 px-4 rounded-[6px] ${
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

      {/* Modal de confirmación */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar <strong>todas las fechas</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteAllModal(false)} // Cerrar el modal
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAllFechas} // Llamar a la función para eliminar todas las fechas
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={loadingDeleteAll}
              >
                {loadingDeleteAll ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditVisible && (
        <EditFechaModal
          fecha={selectedFecha}
          equipos={equipos}
          onSave={handleEditFecha}
          onClose={() => setModalEditVisible(false)}
        />
      )}

      {modalDeleteVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Eliminar Fecha</h2>
            <p>¿Estás seguro de que deseas eliminar esta fecha?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setModalDeleteVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteFecha}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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

    </div>
  )
}

