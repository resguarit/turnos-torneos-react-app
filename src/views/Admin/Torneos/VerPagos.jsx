"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ChevronLeft, Check, X, Plus, Calendar, CreditCard } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/axiosConfig"

export default function VerPagos() {
  const navigate = useNavigate()
  const { equipoId } = useParams()
  const [equipo, setEquipo] = useState({ nombre: "" })
  const [pagos, setPagos] = useState([])
  const [fechas, setFechas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState("inscripcion")
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")

  // Valores predefinidos
  const valorInscripcion = 5000
  const valorFecha = 2500

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch team data
        const equipoResponse = await api.get(`/equipos/${equipoId}`)
        setEquipo(equipoResponse.data)

        // Fetch payment data
        const pagosResponse = await api.get(`/equipos/${equipoId}/pagos`)
        setPagos(pagosResponse.data)

        // Fetch match dates
        const fechasResponse = await api.get(`/fechas`)
        setFechas(fechasResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [equipoId])

  const handleRegistrarPago = async () => {
    try {
      setLoading(true)

      const pagoData = {
        equipo_id: equipoId,
        tipo: tipoSeleccionado,
        monto: tipoSeleccionado === "inscripcion" ? valorInscripcion : valorFecha,
        fecha_id: tipoSeleccionado === "fecha" ? fechaSeleccionada : null,
        estado: "pagado",
      }

      await api.post("/pagos", pagoData)

      // Refresh payment data
      const pagosResponse = await api.get(`/equipos/${equipoId}/pagos`)
      setPagos(pagosResponse.data)

      setModalOpen(false)
    } catch (error) {
      console.error("Error registering payment:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if registration is paid
  const inscripcionPagada = pagos.some((pago) => pago.tipo === "inscripcion" && pago.estado === "pagado")

  // Get payment status for each date
  const estadoPagosPorFecha = fechas.reduce((acc, fecha) => {
    const pago = pagos.find((p) => p.fecha_id === fecha.id)
    acc[fecha.id] = pago ? pago.estado : "pendiente"
    return acc
  }, {})

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="px-4 md:px-40 justify-center">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Historial de Pagos</h1>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-black hover:bg-black/80 p-2 text-sm font-inter rounded-[6px] text-white flex items-center gap-1"
            >
              <Plus size={16} /> Registrar Pago
            </button>
          </div>

          <div className="bg-white w-full rounded-[8px] shadow-md p-6 mb-6">
            <h2 className="text-2xl font-medium mb-4">
              Equipo: <span className="bg-blue-500 bg-opacity-30 rounded-3xl p-1">{equipo.nombre}</span>
            </h2>

            {/* Inscripción */}
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Inscripción</h3>
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">Valor: ${valorInscripcion}</p>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Estado:</span>
                  {inscripcionPagada ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                      <Check size={16} className="mr-1" /> Pagado
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center">
                      <X size={16} className="mr-1" /> Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pagos por fecha */}
            <div>
              <h3 className="text-xl font-medium mb-3">Pagos por Fecha</h3>
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Fecha</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Valor</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fechas.length > 0 ? (
                    fechas.map((fecha) => (
                      <tr key={fecha.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{fecha.nombre || `Fecha ${fecha.numero}`}</td>
                        <td className="py-3 px-4 text-sm">${valorFecha}</td>
                        <td className="py-3 px-4 text-sm">
                          {estadoPagosPorFecha[fecha.id] === "pagado" ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center w-fit">
                              <Check size={16} className="mr-1" /> Pagado
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center w-fit">
                              <X size={16} className="mr-1" /> Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                        No hay fechas programadas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal para registrar pago */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={tipoSeleccionado} onValueChange={setTipoSeleccionado} className="space-y-4">
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="inscripcion" id="inscripcion" />
                <div className="grid gap-1.5">
                  <Label htmlFor="inscripcion" className="font-medium">
                    Inscripción
                  </Label>
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-500">Valor: ${valorInscripcion}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="fecha" id="fecha" />
                <div className="grid gap-1.5 w-full">
                  <Label htmlFor="fecha" className="font-medium">
                    Pago por Fecha
                  </Label>
                  <div className="flex items-center mb-2">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-500">Valor: ${valorFecha}</p>
                  </div>
                  {tipoSeleccionado === "fecha" && (
                    <Select value={fechaSeleccionada} onValueChange={setFechaSeleccionada}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        {fechas.map((fecha) => (
                          <SelectItem key={fecha.id} value={fecha.id.toString()}>
                            {fecha.nombre || `Fecha ${fecha.numero}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrarPago} disabled={tipoSeleccionado === "fecha" && !fechaSeleccionada}>
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
