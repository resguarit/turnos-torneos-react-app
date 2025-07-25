import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, Info, Percent, BadgeDollarSign } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { format, addDays, startOfToday } from "date-fns"
import { es } from "date-fns/locale"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { descuentoService } from "@/services/descuentoService"

function Descuentos() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDeportes, setSelectedDeportes] = useState([])
  const [selectedCanchas, setSelectedCanchas] = useState([])
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")
  const [deportes, setDeportes] = useState([])
  const [canchas, setCanchas] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [tipo, setTipo] = useState("")
  const [valor, setValor] = useState("")
  const [motivo, setMotivo] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [deportesData, canchasData] = await Promise.all([
          descuentoService.getDeportes(),
          descuentoService.getCanchas()
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

  const handleAbrirModal = () => {
    setModalOpen(true)
  }

  const handleCerrarModal = () => {
    setModalOpen(false)
    setTipo("")
    setValor("")
    setMotivo("")
  }

  const handleAplicarDescuento = async () => {
    try {
      setLoading(true)
      const data = {
        fecha: selectedDate.full,
        deporte_ids: selectedDeportes.map(d => d.id),
        cancha_ids: selectedCanchas.map(c => c.id),
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        tipo,
        valor,
        motivo
      }
      await descuentoService.aplicarDescuento(data)
      toast.success("Descuento aplicado exitosamente")
      handleCerrarModal()
      // Limpiar selección si quieres
      // setSelectedDate(null); setSelectedDeportes([]); setSelectedCanchas([]); setHoraInicio(""); setHoraFin("")
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al aplicar el descuento")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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
            <span>Volver a Panel</span>
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-3 border-b flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center justify-center gap-2">
                <Percent className="w-5 h-5 text-green-500" />
                <CardTitle className="text-xl font-semibold text-center">Aplicar Descuentos</CardTitle>
              </div>
              
            <Button
                onClick={() => navigate("/ver-descuentos")}
                variant="outline"
                className="flex items-center justify-center gap-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-xl"
            >
                Ver Descuentos
            </Button>
            </div>  
            <CardDescription className="text-center mt-2">
              Seleccione los parámetros para aplicar descuentos a los turnos
            </CardDescription>
            
          </CardHeader>

          <CardContent className="pt-6">
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-700">Información importante</AlertTitle>
              <AlertDescription className="text-blue-600">
                Los deportes, canchas y horarios seleccionados recibirán el descuento para la fecha elegida. Si selecciona
                "Seleccionar todos" en todos los campos, se aplicará el descuento a todos los turnos de ese día. Esta acción solo afecta a
                la disponibilidad futura y no modifica turnos ya reservados.
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
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-white border hover:border-green-300 hover:bg-green-50"
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
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-white border hover:border-green-300 hover:bg-green-50"
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
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-white border hover:border-green-300 hover:bg-green-50"
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

              {/* Botón de aplicar descuento y ver descuentos */}
              {selectedDate &&
                selectedDeportes.length > 0 &&
                selectedCanchas.length > 0 &&
                horaInicio &&
                horaFin && (
                  <div className="flex justify-center mt-8 gap-4">
                    <Button
                      onClick={handleAbrirModal}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-xl"
                      disabled={loading}
                    >
                      <BadgeDollarSign className="w-4 h-4 mr-2" />
                      Aplicar Descuento
                    </Button>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para tipo, valor y motivo */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Descuento</DialogTitle>
            <DialogDescription>
              Complete los datos para aplicar el descuento seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="tipo">Tipo de descuento</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo" className="bg-white mt-1">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                  <SelectItem value="fijo">Fijo ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="valor">Valor</Label>
              <input
                id="valor"
                type="number"
                min="0"
                value={valor}
                onChange={e => setValor(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="Ingrese el valor del descuento"
              />
            </div>
            <div>
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <input
                id="motivo"
                type="text"
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="Ingrese el motivo del descuento (opcional)"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              onClick={handleAplicarDescuento}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={loading || !tipo || !valor}
            >
              {loading ? "Aplicando..." : "Confirmar Descuento"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleCerrarModal}>Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Descuentos
