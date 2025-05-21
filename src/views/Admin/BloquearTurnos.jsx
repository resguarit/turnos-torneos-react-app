import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, Info, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { format, addDays, startOfToday } from "date-fns"
import { es } from "date-fns/locale"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Eye } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { bloqueoDisponibilidadService } from "@/services/bloqueoDisponibilidadService"

function BloquearTurnos() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDeportes, setSelectedDeportes] = useState([])
  const [selectedCanchas, setSelectedCanchas] = useState([])
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")
  const [deportes, setDeportes] = useState([])
  const [canchas, setCanchas] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTurnosBloqueados, setLoadingTurnosBloqueados] = useState(false)
  const [turnosBloqueados, setTurnosBloqueados] = useState([])


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [deportesData, canchasData] = await Promise.all([
          bloqueoDisponibilidadService.getDeportes(),
          bloqueoDisponibilidadService.getCanchas()
        ])
        setDeportes(deportesData)
        setCanchas(canchasData.canchas)
      } catch (error) {
        toast.error("Error al cargar los datos")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const generateCalendarDates = () => {
    const today = startOfToday()
    return Array(30)
      .fill(null)
      .map((_, index) => {
        const date = addDays(today, index)
        return {
          full: format(date, "yyyy-MM-dd"),
          day: format(date, "EEE", { locale: es }),
          date: format(date, "d"),
          month: format(date, "MMM", { locale: es }),
          dateObj: date,
        }
      })
  }

  const [calendarDates] = useState(generateCalendarDates())

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const handleDeporteClick = (deporte) => {
    if (selectedDeportes.some((d) => d.id === deporte.id)) {
      setSelectedDeportes(selectedDeportes.filter((d) => d.id !== deporte.id))
    } else {
      setSelectedDeportes([...selectedDeportes, deporte])
    }
  }

  const handleDeporteSelectAll = () => {
    if (selectedDeportes.length === deportes.length) {
      setSelectedDeportes([])
    } else {
      setSelectedDeportes([...deportes])
    }
  }

  const handleCanchaClick = (cancha) => {
    if (selectedCanchas.some((c) => c.id === cancha.id)) {
      setSelectedCanchas(selectedCanchas.filter((c) => c.id !== cancha.id))
    } else {
      setSelectedCanchas([...selectedCanchas, cancha])
    }
  }

  const handleCanchaSelectAll = () => {
    const availableCanchas = canchas.filter((cancha) =>
      selectedDeportes.some((deporte) => cancha.deporte_id === deporte.id)
    )

    if (selectedCanchas.length === availableCanchas.length) {
      setSelectedCanchas([])
    } else {
      setSelectedCanchas(availableCanchas)
    }
  }

  const handleBloquearTurnos = async () => {
    try {
      setLoading(true)
      const data = {
        fecha: selectedDate.full,
        deportes: selectedDeportes.map(d => d.id),
        canchas: selectedCanchas.map(c => c.id),
        hora_inicio: horaInicio,
        hora_fin: horaFin
      }

      await bloqueoDisponibilidadService.bloquearDisponibilidad(data)
      toast.success("Turnos bloqueados exitosamente")
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al bloquear los turnos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCanchas = canchas.filter((cancha) =>
    selectedDeportes.some((deporte) => cancha.deporte_id === deporte.id)
  )

  // Generar opciones de hora cada 30 minutos desde las 8:00 hasta las 23:00
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        options.push(time)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
      <Header />
      <ToastContainer position="top-right" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate("/panel-admin?tab=turnos")}
            variant="ghost"
            className="flex items-center gap-2 hover:bg-naranja hover:text-white rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Volver a Turnos</span>
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-3 border-b flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                <CardTitle className="text-xl font-semibold text-center">Bloquear Turnos</CardTitle>
              </div>
              <Button
                  onClick={() => navigate("/turnos-bloqueados")}
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-xl"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Turnos Bloqueados</span>
              </Button>
            </div>  
            <CardDescription className="text-center mt-2">
              Seleccione los parámetros para bloquear la disponibilidad de turnos
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-700">Información importante</AlertTitle>
              <AlertDescription className="text-blue-600">
                Los deportes, canchas y horarios seleccionados serán bloqueados para la fecha elegida. Si selecciona
                "Seleccionar todos" en todos los campos, se bloquearán los turnos para ese día entero. Esta acción solo afecta a
                la disponibilidad futura y no cancela turnos ya reservados.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {/* Fecha */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h2 className="font-medium text-lg">Fecha</h2>
                </div>

                <div className="flex overflow-x-auto py-2 -mx-2 scrollbar-hide pb-4 gap-2">
                  {calendarDates.map((date, index) => {
                    const today = startOfToday()
                    const isToday = format(date.dateObj, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className={`flex-shrink-0 w-16 md:w-20 rounded-xl p-2 flex flex-col items-center cursor-pointer transition-all ${
                          selectedDate?.full === date.full
                            ? "bg-naranja text-white shadow-md"
                            : "bg-white border hover:border-red-300 hover:bg-red-50"
                        }`}
                      >
                        <span className="text-xs md:text-sm uppercase font-medium">{isToday ? "HOY" : date.day}</span>
                        <span className="text-lg md:text-xl font-bold">{date.date}</span>
                        <span className="text-xs md:text-sm capitalize">{date.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Deporte */}
              {selectedDate && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="font-medium text-lg">Deporte</h2>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="selectAllDeportes"
                        className="w-5 h-5 border-gray-300"
                        checked={selectedDeportes.length === deportes.length}
                        onCheckedChange={handleDeporteSelectAll}
                      />
                      <Label htmlFor="selectAllDeportes" className="text-sm">
                        Seleccionar todos
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {deportes.map((deporte) => (
                      <div
                        key={deporte.id}
                        onClick={() => handleDeporteClick(deporte)}
                        className={`rounded-xl p-3 flex flex-col items-center cursor-pointer transition-all ${
                          selectedDeportes.some((d) => d.id === deporte.id)
                            ? "bg-naranja text-white shadow-md"
                            : "bg-white border hover:border-red-300 hover:bg-red-50"
                        }`}
                      >
                        <span className="text-sm md:text-base font-medium">{deporte.nombre}</span>
                        <span className="text-xs md:text-sm">{deporte.jugadores_por_equipo} jugadores</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancha - Solo visible si hay deportes seleccionados */}
              {selectedDeportes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="font-medium text-lg">Cancha</h2>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="selectAllCanchas"
                        className="w-5 h-5 border-gray-300"
                        checked={selectedCanchas.length === filteredCanchas.length && filteredCanchas.length > 0}
                        onCheckedChange={handleCanchaSelectAll}
                      />
                      <Label htmlFor="selectAllCanchas" className="text-sm">
                        Seleccionar todos
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredCanchas.map((cancha) => (
                      <div
                        key={cancha.id}
                        onClick={() => handleCanchaClick(cancha)}
                        className={`rounded-xl p-3 flex flex-col items-center cursor-pointer transition-all ${
                          selectedCanchas.some((c) => c.id === cancha.id)
                            ? "bg-naranja text-white shadow-md"
                            : "bg-white border hover:border-red-300 hover:bg-red-50"
                        }`}
                      >
                        <span className="text-sm md:text-base font-medium">{cancha.nro}</span>
                        <span className="text-xs md:text-sm">{cancha.tipo_cancha}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Horario - Solo visible si hay canchas seleccionadas */}
              {selectedCanchas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="font-medium text-lg">Horario</h2>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="selectAllHorarios"
                        className="w-5 h-5 border-gray-300"
                        checked={horaInicio === timeOptions[0] && horaFin === timeOptions[timeOptions.length - 1]}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setHoraInicio(timeOptions[0])
                            setHoraFin(timeOptions[timeOptions.length - 1])
                          } else {
                            setHoraInicio("")
                            setHoraFin("")
                          }
                        }}
                      />
                      <Label htmlFor="selectAllHorarios" className="text-sm">
                        Seleccionar todo el día
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horaInicio">Hora de inicio</Label>
                      <Select value={horaInicio} onValueChange={setHoraInicio}>
                        <SelectTrigger id="horaInicio" className="bg-white">
                          <SelectValue placeholder="Seleccione hora de inicio" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horaFin">Hora de fin</Label>
                      <Select value={horaFin} onValueChange={setHoraFin}>
                        <SelectTrigger id="horaFin" className="bg-white">
                          <SelectValue placeholder="Seleccione hora de fin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de bloquear - Solo visible si todas las selecciones están hechas */}
              {selectedDate &&
                selectedDeportes.length > 0 &&
                selectedCanchas.length > 0 &&
                horaInicio &&
                horaFin && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleBloquearTurnos}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-xl"
                      disabled={loading}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {loading ? "Bloqueando..." : "Bloquear Turnos"}
                    </Button>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BloquearTurnos
