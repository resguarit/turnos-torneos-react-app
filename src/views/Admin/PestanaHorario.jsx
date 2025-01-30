import React, { useState, useEffect } from "react"
import { Edit2, Trash2, ToggleLeft, ToggleRight, ChevronDown } from "lucide-react"
import api from "@/lib/axiosConfig"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const PestanaHorario = () => {
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [disableDay, setDisableDay] = useState("Lunes")
  const [disableStart, setDisableStart] = useState("09:00")
  const [disableEnd, setDisableEnd] = useState("10:00")
  const [editId, setEditId] = useState(null)
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [disabledRanges, setDisabledRanges] = useState([])
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)
  const [showError, setShowError] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  const timeOptions = [
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00", // Cambiar 24:00 por 00:00
  ]

  // Cargar horarios al montar el componente
  useEffect(() => {
    fetchActiveScheduleExtremes();
  }, []);

  const fetchActiveScheduleExtremes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/horarios-extremos-activos");
      console.log("Raw API Response:", response.data);

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

      console.log("Final formatted schedules:", formattedSchedules);
      setSchedules(formattedSchedules);
    } catch (error) {
      console.error("Error al cargar horarios extremos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Actualiza la función fetchDisabledRanges para mejor manejo de errores y logging
  const fetchDisabledRanges = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/franjas-horarias-no-disponibles");
      console.log("Respuesta franjas deshabilitadas:", response.data); // Debug

      if (response.data && Array.isArray(response.data.horarios)) {
        setDisabledRanges(response.data.horarios);
      } else {
        console.error("Formato de respuesta inválido:", response.data);
        setDisabledRanges([]);
      }
    } catch (error) {
      console.error("Error al cargar franjas deshabilitadas:", error);
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

  const handleEnableRange = (range) => {
    const data = {
      dia: range.dia,
      hora_inicio: range.hora_inicio,
      hora_fin: range.hora_fin
    };
    api.put("/habilitar-franja-horaria", data)
      .then(() => fetchDisabledRanges())
      .catch((error) => {
        console.error("Error al habilitar franja horaria:", error);
        alert("Error al habilitar franja horaria: " + error.response?.data?.message || error.message);
      });
  };

  const toggleHorario = async (id) => {
    try {
      const currentSchedule = schedules.find(s => s.id === id);
      const newEnabled = !currentSchedule.enabled;

      // Si está intentando habilitar y no tiene horarios seleccionados, no permitir
      if (newEnabled && (!currentSchedule.start || !currentSchedule.end)) {
        return; // No permitir habilitar si no hay horarios seleccionados
      }

      // Solo hacer la llamada API si hay horarios seleccionados
      if (currentSchedule.start && currentSchedule.end) {
        const data = {
          dia: currentSchedule.day,
          hora_inicio: currentSchedule.start,
          hora_fin: currentSchedule.end
        };

        const endpoint = newEnabled ? 
          "/habilitar-franja-horaria" : 
          "/deshabilitar-franja-horaria";

        const response = await api.put(endpoint, data);

        if (response.status === 200) {
          // Actualizar estado local solo si la API fue exitosa
          setSchedules(prev =>
            prev.map(s =>
              s.id === id ? { ...s, enabled: newEnabled } : s
            )
          );

          // Recargar franjas deshabilitadas si el collapsible está abierto
          if (isCollapsibleOpen) {
            await fetchDisabledRanges();
          }
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
      console.error("Error al actualizar horario:", error.response?.data || error);
      alert("Error al actualizar horario: " + 
        (error.response?.data?.message || error.message));
    }
  };

  const handleDisableRange = async () => {
    try {
      const response = await api.put("/deshabilitar-franja-horaria", {
        dia: disableDay,
        hora_inicio: disableStart,
        hora_fin: disableEnd,
      });


      if (response.status === 200) {
        await fetchSchedules();
        await handleCollapsibleOpen();
        setShowError(false);
        setShowDisableModal(false); // Cerrar el modal
        alert("Franja horaria deshabilitada correctamente");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setShowError(true);
      }
    } finally {
      setShowDisableModal(false);
      if (isCollapsibleOpen) {
        await fetchDisabledRanges();
      }
    }
  };

  const openEditModal = (schedule) => {
    setEditId(schedule.id)
    setEditStart(schedule.start)
    setEditEnd(schedule.end)
    setShowEditModal(true)
  }

  const handleEditSave = () => {
    setSchedules((prev) => prev.map((s) => (s.id === editId ? { ...s, start: editStart, end: editEnd } : s)))
    setShowEditModal(false)
  }

  const buildRequestData = () => {
    const dias = {};
    schedules.forEach((schedule) => {
      // Solo incluir el día si tanto start como end tienen valores
      if (schedule.start && schedule.end) {
        dias[schedule.day] = {
          hora_apertura: schedule.start,
          hora_cierre: schedule.end,
        };
      }
    });
    return { dias };
  };

  const handleSubmitConfig = async () => {
    try {
      const data = buildRequestData()
      await api.post("/configurar-horarios", data)
      setHasChanges(false)
      alert("Horarios configurados correctamente")
    } catch (error) {
      console.error(error)
      alert("Error al configurar horarios: " + error.response?.data?.message || error.message)
    }
  }

  // Asegúrate de que el collapsible llame a fetchDisabledRanges cuando se abre
  const handleCollapsibleOpen = (open) => {
    setIsCollapsibleOpen(open);
    if (open) {
      fetchDisabledRanges();
    }
  };

  const handleScheduleChange = (id, field, value) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
    setHasChanges(true)
  }

  return (
    <div>
      {/* Botones arriba */}
      <div className="flex justify-end mb-4 mt-2">
        <div className="ml-auto">
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
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors mr-2"
            >
              Deshabilitar franja horaria
            </button>
          )}
        </div>
        <button
          onClick={hasChanges ? handleSubmitConfig : () => setShowConfigModal(true)}
          className={`px-4 py-2 ${
            hasChanges ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-md font-medium transition-colors`}
        >
          {hasChanges ? "Aplicar cambios" : "Configurar Horarios"}
        </button>
      </div>

      {/* Tabla de horarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className={!schedule.enabled ? "opacity-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">{schedule.day}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap space-x-3 flex items-center">
                  {/* Toggle habilitar/deshabilitar */}
                  <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => toggleHorario(schedule.id)}
                      disabled={!schedule.start || !schedule.end}
                      className={`${
                        schedule.enabled && schedule.start && schedule.end 
                          ? "!bg-green-500" 
                          : "!bg-red-500"
                      } relative inline-flex h-7 w-12 items-center rounded-full ${
                        (!schedule.start || !schedule.end) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className={`${
                          schedule.enabled ? "translate-x-6" : "translate-x-1"
                        } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                      />
                  </Switch>

                  {/* Editar */}
                  <button className="text-gray-400 hover:text-gray-500" onClick={() => openEditModal(schedule)}>
                    <Edit2 size={18} />
                  </button>

                  {/* Eliminar (opcional, por ahora no implementa lógica) */}
                  <button className="text-gray-400 hover:text-gray-500">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actualiza la sección del collapsible en el JSX */}
      <Collapsible className="mt-4" open={isCollapsibleOpen} onOpenChange={handleCollapsibleOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 font-medium">
          Franjas horarias deshabilitadas
          <ChevronDown className="h-5 w-5" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2">
            {isLoading ? (
              <p>Cargando franjas horarias deshabilitadas...</p>
            ) : disabledRanges && disabledRanges.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">Día</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">Hora Inicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">Hora Fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {disabledRanges.map((range, index) => (
                    <tr key={index} className="bg-red-50">
                      <td className="px-6 py-4 whitespace-nowrap">{range.dia}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {range.hora_inicio ? range.hora_inicio.slice(0, 5) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {range.hora_fin ? range.hora_fin.slice(0, 5) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleEnableRange(range)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay franjas horarias deshabilitadas</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Modal para deshabilitar franja específica */}
      {showDisableModal && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Deshabilitar franja horaria</h2>

            {showError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700 font-medium">Error al deshabilitar franja horaria</p>
                <p className="text-red-600 text-sm">
                  Ya existe una franja horaria deshabilitada en ese rango para el día especificado
                </p>
              </div>
            )}

            <label className="block mb-2">
              Día:
              <select
                className="border rounded px-2 py-1 w-full"
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
                className="border rounded9 px-2 py-1 w-full"
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
                className="border rounded px-2 py-1 w-full"
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
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDisableModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisableRange}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
          <div className="bg-white rounded-md p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Configurar Horarios</h2>
            <p className="mb-4">Ajusta las horas de apertura/cierre para cada día.</p>
            <button
              onClick={() => setShowConfigModal(false)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors mr-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowConfigModal(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PestanaHorario
