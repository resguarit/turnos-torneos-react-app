import React, { useState, useEffect } from "react"
import { Edit2, Trash2, ToggleLeft, ToggleRight, ChevronDown } from "lucide-react"
import api from "@/lib/axiosConfig"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const PestanaHorario = () => {
  const [schedules, setSchedules] = useState([
    { id: 1, day: "Lunes", start: "09:00", end: "21:00", enabled: true },
    { id: 2, day: "Martes", start: "09:00", end: "21:00", enabled: true },
    { id: 3, day: "Miércoles", start: "09:00", end: "21:00", enabled: true },
    { id: 4, day: "Jueves", start: "09:00", end: "21:00", enabled: true },
    { id: 5, day: "Viernes", start: "09:00", end: "21:00", enabled: true },
    { id: 6, day: "Sábado", start: "09:00", end: "23:00", enabled: true },
    { id: 7, day: "Domingo", start: "09:00", end: "21:00", enabled: true },
  ])
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
  const [isLoading, setIsLoading] = useState(false)
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
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await api.get("/horarios")
      console.log("Respuesta API:", response.data) // Para debuggear

      // Mapear la respuesta al formato que espera el componente
      const formattedSchedules = response.data.map((horario) => ({
        id: horario.id,
        day: horario.dia,
        start: horario.hora_inicio,
        end: horario.hora_fin,
        enabled: horario.activo,
      }))

      setSchedules(formattedSchedules)
    } catch (error) {
      console.error("Error al cargar horarios:", error)
    }
  }

  const fetchDisabledRanges = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/franjas-horarias-no-disponibles")
      if (response.data && response.data.horarios) {
        setDisabledRanges(response.data.horarios)
      }
    } catch (error) {
      console.error("Error al cargar franjas deshabilitadas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleHorario = async (id, day) => {
    // Find current schedule
    const currentSchedule = schedules.find(s => s.id === id);
    const newEnabled = !currentSchedule.enabled;

    try {
      const data = {
        dia: currentSchedule.day,
        hora_inicio: currentSchedule.start,
        hora_fin: currentSchedule.end
      };

      console.log('Sending data:', data); // For debugging
      await api.put("/deshabilitar-franja-horaria", data);
      
      // Update local state
      setSchedules(prev => 
        prev.map(s => 
          s.day === day 
            ? { ...s, enabled: newEnabled }
            : s
        )
      );

      // Refresh disabled ranges
      await fetchDisabledRanges();

    } catch (error) {
      console.error("Error al deshabilitar franja horaria:", error);
      alert("Error al deshabilitar franja horaria: " + error.response?.data?.message || error.message);
    }
  };

  const handleDisableRange = async () => {
    try {
      await api.put("/deshabilitar-franja-horaria", {
        dia: disableDay,
        hora_inicio: disableStart,
        hora_fin: disableEnd,
      })

      await fetchSchedules()
      await fetchDisabledRanges()
      setShowDisableModal(false)
      setShowError(false)
    } catch (error) {
      if (error.response?.status === 409) {
        setShowError(true)
      }
      console.error("Error al deshabilitar franja horaria:", error)
    }
  }

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
    const dias = {}
    schedules.forEach((schedule) => {
      dias[schedule.day] = {
        hora_apertura: schedule.start,
        hora_cierre: schedule.end,
      }
    })
    return { dias }
  }

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

  const handleCollapsibleOpen = (open) => {
    setIsCollapsibleOpen(open)
    if (open) {
      fetchDisabledRanges()
    }
  }

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
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    disabled={!schedule.enabled}
                    value={schedule.end}
                    onChange={(e) => handleScheduleChange(schedule.id, "end", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
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
                    onCheckedChange={() => toggleHorario(schedule.id, schedule.day)}
                    className={`${
                      schedule.enabled ? "!bg-green-500" : "!bg-red-500"
                    } relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    data-state={schedule.enabled ? "checked" : "unchecked"}
                  >
                    <span
                      className={`${
                        schedule.enabled ? "translate-x-6" : "translate-x-1"
                      } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-lg`}
                      data-state={schedule.enabled ? "checked" : "unchecked"}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Día
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Hora Inicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Hora Fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {disabledRanges
                    .filter((range) => range.activo === 0)
                    .map((range, index) => (
                      <tr key={index} className="bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap">{range.dia}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{range.hora_inicio.slice(0, 5)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{range.hora_fin.slice(0, 5)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p>No hay franjas horarias deshabilitadas</p>
            ) }
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
                className="border rounded px-2 py-1 w-full"
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
