import React, { useState, useEffect } from "react";
import { Edit2, Trash2, ToggleLeft, ToggleRight, ChevronDown } from "lucide-react";
import api from "@/lib/axiosConfig";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BtnLoading from "@/components/BtnLoading";
import { useDeportes } from "@/context/DeportesContext";
const PestanaHorario = () => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [disableDay, setDisableDay] = useState("Lunes");
  const [disableStart, setDisableStart] = useState("09:00");
  const [disableEnd, setDisableEnd] = useState("10:00");
  const [editId, setEditId] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [disabledRanges, setDisabledRanges] = useState([]);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de carga
  const [switchLoading, setSwitchLoading] = useState({}); // Estado de carga específico para cada switch
  const { deportes, setDeportes } = useDeportes(); // Usa el contexto
  const [selectedDeporteId, setSelectedDeporteId] = useState('');
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const timeOptions = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"
  ];

  // Cargar horarios al montar el componente
  useEffect(() => {
    if (deportes.length > 0) {
      setSelectedDeporteId(deportes[0].id);
      fetchActiveScheduleExtremes(deportes[0].id);
    }
    // eslint-disable-next-line
  }, [deportes]);

  useEffect(() => {
    if (selectedDeporteId) {
      fetchActiveScheduleExtremes(selectedDeporteId);
      fetchDisabledRanges(selectedDeporteId);
    }
    // eslint-disable-next-line
  }, [selectedDeporteId]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSuccessMessage(null); // Reset the message after showing the toast
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      setErrorMessage(null); // Reset the message after showing the toast
    }
  }, [errorMessage]);

  const fetchActiveScheduleExtremes = async (deporteId) => {
    setLoadingHorarios(true);
    try {
      setIsLoading(true);
      const response = await api.get("/horarios-extremos-activos", { 
        params: { deporte_id: deporteId } 
      });
      // Obtener el array de horarios_extremos
      const horarios = response.data.horarios_extremos;
      
      // Asegurarse de que todos los días estén representados
      const formattedSchedules = daysOfWeek.map(day => {
        const horario = horarios.find(h => h.dia === day);
        return {
          id: Date.now() + daysOfWeek.indexOf(day),
          day: day,
          start: horario?.hora_inicio ? horario.hora_inicio.slice(0, 5) : "", 
          end: horario?.hora_fin ? horario.hora_fin.slice(0, 5) : "",
          enabled: !horario?.inactivo // Si inactivo es true, enabled será false
        };
      });
      setSchedules(formattedSchedules);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al cargar horarios extremos');
    } finally {
      setIsLoading(false);
      setLoadingHorarios(false);
    }
  };

  // Actualiza la función fetchDisabledRanges para mejor manejo de errores y logging
  const fetchDisabledRanges = async (deporteId) => {
    setIsLoading(true);
    try {
      const response = await api.get("/franjas-horarias-no-disponibles", {
        params: { deporte_id: deporteId }
      });

      if (response.data && Array.isArray(response.data.horarios)) {
        setDisabledRanges(response.data.horarios);
      } else {
        setErrorMessage(error.response?.data?.message || 'Error al cargar franjas horarias deshabilitadas');
        setDisabledRanges([]);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al cargar franjas horarias deshabilitadas');
      setDisabledRanges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayDate = (dayName) => {
    const today = new Date();
    const days = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 
      'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0
    };
    
    const dayNumber = days[dayName];
    const currentDay = today.getDay();
    const distance = (dayNumber - currentDay + 7) % 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + distance);
    
    return targetDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const dayMapping = {
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miercoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };

  const handleEnableRange = async (range) => {
    setLoading(true); // Iniciar estado de carga
    const formatTime = (time) => time.slice(0, 5); // Formatear la hora para eliminar los segundos

    const dayCorrect = dayMapping[range.dia.toLowerCase()] || range.dia;

    const data = {
      dia: dayCorrect,
      hora_inicio: formatTime(range.hora_inicio),
      hora_fin: formatTime(range.hora_fin)
    };

    try {
      const response = await api.put("/habilitar-franja-horaria", data, {
        params: { deporte_id: selectedDeporteId }
      });
      if (response.data.status === 200) {
        setSuccessMessage(response.data.message || 'Franja horaria habilitada correctamente');
        await fetchDisabledRanges(selectedDeporteId); // Recargar las franjas deshabilitadas
        await fetchActiveScheduleExtremes(selectedDeporteId);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al habilitar franja horaria');
    } finally {
      setLoading(false); // Finalizar estado de carga
    }
  };

  const toggleHorario = async (id) => {
    setSwitchLoading(prev => ({ ...prev, [id]: true })); // Iniciar estado de carga específico para el switch
    try {
      const currentSchedule = schedules.find(s => s.id === id);
      const newEnabled = !currentSchedule.enabled;

      // Si está intentando habilitar y no tiene horarios seleccionados, no permitir
      if (newEnabled && (!currentSchedule.start || !currentSchedule.end)) {
        setSwitchLoading(prev => ({ ...prev, [id]: false })); // Finalizar estado de carga específico para el switch
        return; // No permitir habilitar si no hay horarios seleccionados
      }

      // Solo hacer la llamada API si hay horarios seleccionados
      if (currentSchedule.start && currentSchedule.end) { 
        const data = {
          dia: currentSchedule.day,
          hora_inicio: currentSchedule.start,
          hora_fin: currentSchedule.end,
          deporte_id: selectedDeporteId
        };

        const endpoint = newEnabled ? 
          "/habilitar-franja-horaria" : 
          "/deshabilitar-franja-horaria";

        const response = await api.put(endpoint, data);

        if (response.data.status === 200) {
          setSuccessMessage(response.data.message || `Franja horaria ${newEnabled ? 'habilitada' : 'deshabilitada'} correctamente`);
          // Actualizar estado local solo si la API fue exitosa
          setSchedules(prev =>
            prev.map(s =>
              s.id === id ? { ...s, enabled: newEnabled } : s
            )
          );

          // Recargar franjas deshabilitadas si el collapsible está abierto
          if (isCollapsibleOpen) {
            await fetchDisabledRanges(selectedDeporteId);
          }

          // Recargar extremos horarios activos
          await fetchActiveScheduleExtremes(selectedDeporteId);
        }
      } else {
        // Si no hay horarios, solo actualizar el estado local
        setSchedules(prev =>
          prev.map(s =>
            s.id === id ? { ...s, enabled: newEnabled } : s
          )
        );
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || `Error al ${newEnabled ? 'habilitar' : 'deshabilitar'} franja horaria`);
      console.log(error);
    } finally {
      setSwitchLoading(prev => ({ ...prev, [id]: false })); // Finalizar estado de carga específico para el switch
    }
  };

  const handleDisableRange = async () => {
    setLoading(true); // Iniciar estado de carga
    try {
      const response = await api.put("/deshabilitar-franja-horaria", {
        dia: disableDay,
        hora_inicio: disableStart,
        hora_fin: disableEnd,
        deporte_id: selectedDeporteId
      });

      if (response.data.status === 200) {
        setSuccessMessage(response.data.message || 'Franja horaria deshabilitada correctamente');
        await fetchActiveScheduleExtremes(selectedDeporteId);
        await fetchDisabledRanges(selectedDeporteId); // Recargar las franjas deshabilitadas
        setShowError(false);
        setShowDisableModal(false); // Cerrar el modal
      } else {
        setErrorMessage(response.data.message || 'Error al deshabilitar franja horaria');
      }
    } catch (error) {
      console.error("Error al deshabilitar franja horaria:", error);
      setErrorMessage(error.response?.data?.message || 'Error al deshabilitar franja horaria');
    } finally {
      setLoading(false); // Finalizar estado de carga
      setShowDisableModal(false);
      if (isCollapsibleOpen) {
        await fetchDisabledRanges(selectedDeporteId);
      }
    }
  };

  const openEditModal = (schedule) => {
    setEditId(schedule.id);
    setEditStart(schedule.start);
    setEditEnd(schedule.end);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    setSchedules((prev) => prev.map((s) => (s.id === editId ? { ...s, start: editStart, end: editEnd } : s)));
    setShowEditModal(false);
  };

  const buildRequestData = () => {
    const dias = {};
    schedules.forEach((schedule) => {
      // Solo incluir el día si tanto start como end tienen valores
      if (schedule.start && schedule.end && schedule.enabled) {
        dias[schedule.day] = {
          hora_apertura: schedule.start,
          hora_cierre: schedule.end,
        };
      }
    });
    return { dias, deporte_id: selectedDeporteId };
  };

  const handleSubmitConfig = async () => {
    setLoading(true);
    try {
      const data = buildRequestData();
      const response = await api.post("/configurar-horarios", data);
      setHasChanges(false);
      setSuccessMessage(response.data.message || 'Horarios configurados correctamente');
      if (response.data.status === 201) {
        await fetchActiveScheduleExtremes(selectedDeporteId);
        await fetchDisabledRanges(selectedDeporteId);
        if (isCollapsibleOpen) {
          await fetchDisabledRanges(selectedDeporteId);
        }
        // Actualiza deportes/contexto/localStorage
        const deportesResp = await api.get('/deportes');
        setDeportes(deportesResp.data.deportes || deportesResp.data);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al cargar configurar los horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (id, field, value) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    setHasChanges(true);
  };

  // Asegúrate de que el collapsible llame a fetchDisabledRanges cuando se abre
  const handleCollapsibleOpen = (open) => {
    setIsCollapsibleOpen(open);
    if (open) {
      fetchDisabledRanges(selectedDeporteId);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" />
      {/* Botones arriba */}
      <div className="flex justify-between mb-4 mt-4">
        <div className="flex justify-start items-center">
          {deportes.length === 0 ? (
            <span className="text-gray-500">No hay deportes disponibles</span>
          ) : (
            <select
              value={selectedDeporteId}
              onChange={(e) => setSelectedDeporteId(e.target.value)}
              className="border rounded-[8px] px-2 py-1 min-w-[200px] w-full">
              {deportes.map((deporte) => (
                <option key={deporte.id} value={deporte.id}>
                  {`${deporte.nombre} ${deporte.jugadores_por_equipo}`}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex justify-center items-center">
          <div className="">
            {showError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex flex-col">
                <p className="text-red-700 font-medium">Error al deshabilitar franja horaria</p>
                <p className="text-red-600 text-sm">
                  Ya existe una franja horaria deshabilitada en ese rango para el día especificado
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowDisableModal(true)}
                className="px-3 text-sm py-2 bg-red-600 hover:bg-red-600 text-white rounded-[6px] transition-colors mr-2"
                disabled={loading || loadingHorarios || !selectedDeporteId}
              >
                Deshabilitar franja horaria
              </button>
            )}
          </div>
          <button
            onClick={hasChanges ? handleSubmitConfig : () => setShowConfigModal(true)}
            className={`px-3 text-sm py-2 ${
              hasChanges ? "bg-green-600  hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-[6px] transition-colors`}
            disabled={loading || loadingHorarios || !selectedDeporteId}
          >
            {hasChanges ? "Aplicar cambios" : "Configurar Horarios"}
          </button>
        </div>
      </div>

      {/* Tabla de horarios */}
      {loadingHorarios ? (
        <div className="flex flex-col justify-center items-center py-12">
          <BtnLoading />
        </div>
      ) : (
      <div className="overflow-x-auto rounded-[8px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-1 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Día</th>
              <th className="px-4 py-1 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Hora Inicio</th>
              <th className="px-4 py-1 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Hora Fin</th>
              <th className="px-4 py-1 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className={!schedule.enabled ? "opacity-50" : ""}>
                <td className="px-5 sm:px-6 text-sm sm:text-base py-2 sm:py-4 whitespace-nowrap w-1/4">{schedule.day}</td>
                <td className="px-5 sm:px-6 py-2 text-sm sm:text-base sm:py-4 whitespace-nowrap w-1/4">
                  <select
                    disabled={!schedule.enabled}
                    value={schedule.start}
                    onChange={(e) => handleScheduleChange(schedule.id, "start", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value=""></option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 sm:px-6 text-sm sm:text-base py-2 sm:py-4 whitespace-nowrap w-1/4">
                  <select
                    value={schedule.end}
                    onChange={(e) => handleScheduleChange(schedule.id, "end", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value=""></option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 sm:px-6 text-sm sm:text-base py-2 sm:py-4 whitespace-nowrap w-1/4 space-x-3 flex items-center">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={() => toggleHorario(schedule.id)}
                    disabled={!schedule.start || !schedule.end || switchLoading[schedule.id]}
                    className={`${
                      schedule.enabled && schedule.start && schedule.end 
                        ? "!bg-green-500" 
                        : "!bg-red-500"
                    } relative inline-flex h-5 sm:h-7 sm:w-12 items-center rounded-full ${
                      (!schedule.start || !schedule.end || switchLoading[schedule.id]) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span
                      className={`${
                        schedule.enabled ? "translate-x-6" : "translate-x-1"
                      } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Collapsible de franjas deshabilitadas (solo mostrar si no está cargando) */}
      {(!loadingHorarios) && (
        <Collapsible className="mt-4" open={isCollapsibleOpen} onOpenChange={handleCollapsibleOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-xl text-sm md:text-base border p-4 font-medium">
            Franjas horarias deshabilitadas
            <ChevronDown className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="min-w-full divide-y">
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <BtnLoading />
                  <span className="text-gray-500 ml-2">Cargando franjas deshabilitadas...</span>
                </div>
              ) : disabledRanges && disabledRanges.length > 0 ? (
                // Agrupar franjas horarias por día
                Object.entries(
                  disabledRanges.reduce((acc, range) => {
                    if (!acc[range.dia]) {
                      acc[range.dia] = [];
                    }
                    acc[range.dia].push(range);
                    return acc;
                  }, {})
                ).map(([dia, franjas]) => (
                  <Collapsible key={dia} className="mb-4">
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-b-xl text-sm md:text-base border p-4 bg-red-50">
                      {dia}
                      <ChevronDown className="h-5 w-5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
                        <thead>
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider w-1/3">Hora Inicio</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider w-1/3">Hora Fin</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider w-1/3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {franjas.map((range, index) => (
                            <tr key={index} className="bg-red-50">
                              <td className="px-4 sm:px-6 py-4 text-sm sm:text-base whitespace-nowrap w-1/3">
                                {range.hora_inicio ? range.hora_inicio.slice(0, 5) : ''}
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-sm sm:text-base whitespace-nowrap w-1/3">
                                {range.hora_fin ? range.hora_fin.slice(0, 5) : ''}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap w-1/3">
                                <button
                                  className="px-4 py-2 text-sm sm:text-base bg-green-500 text-white rounded-[10px] hover:bg-green-600"
                                  onClick={() => handleEnableRange(range)}
                                  disabled={loading}
                                >
                                  {loading ? <BtnLoading /> : "Habilitar Franja"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">No hay franjas horarias deshabilitadas</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* Modal para deshabilitar franja específica */}
      {showDisableModal && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-[8px] p-4 md:p-6 w-60 md:w-80">
            <h2 className="text-base md:text-lg font-semibold mb-4">Deshabilitar franja horaria</h2>

            {showError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700 font-medium">Error al deshabilitar franja horaria</p>
                <p className="text-red-600 text-sm">
                  Ya existe una franja horaria deshabilitada en ese rango para el día especificado
                </p>
              </div>
            )}

            <label className="block mb-2 ">
              Día:
              <select
                className="border rounded-[6px] px-2 py-1 w-full"
                value={disableDay}
                onChange={(e) => setDisableDay(e.target.value)}
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mb-2">
              Hora inicio:
              <select
                className="border rounded-[6px] px-2 py-1 w-full"
                value={disableStart}
                onChange={(e) => setDisableStart(e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mb-4">
              Hora fin:
              <select
                className="border rounded-[6px] px-2 py-1 w-full"
                value={disableEnd}
                onChange={(e) => setDisableEnd(e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-between space-x-3 mt-4">
              <button
                onClick={() => setShowDisableModal(false)}
                className="px-3 py-2 text-sm  bg-gray-200 rounded-[6px] hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisableRange}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-[6px] hover:bg-red-600"
                disabled={loading} // Deshabilitar botón si está cargando
              >
                Deshabilitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Editar franja horaria</h2>
            <label className="block mb-2">
              Hora inicio:
              <select
                className="border rounded px-2 py-1 w-full"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mb-4">
              Hora fin:
              <select
                className="border rounded px-2 py-1 w-full"
                value={editEnd}
                onChange={(e) => setEditEnd(e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configurar horarios */}
      {showConfigModal && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
          <div className="bg-white rounded-[8px] p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Configurar Horarios</h2>
            <p className="mb-4">Ajusta las horas de apertura/cierre para cada día.</p>
            <button
              onClick={() => setShowConfigModal(false)}
              className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-[6px] font-medium transition-colors mr-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowConfigModal(false)}
              className="px-3 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-[6px] font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PestanaHorario;
