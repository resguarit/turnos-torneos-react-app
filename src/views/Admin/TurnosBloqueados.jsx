import { useState, useEffect } from "react"
import { ChevronLeft, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bloqueoDisponibilidadService } from "@/services/bloqueoDisponibilidadService"

function TurnosBloqueados() {
  const navigate = useNavigate()
  const [turnosBloqueados, setTurnosBloqueados] = useState([])
  const [loading, setLoading] = useState(false)
  const [deportes, setDeportes] = useState([])

  useEffect(() => {
    fetchTurnosBloqueados()
    fetchDeportes()
  }, [])

  const fetchDeportes = async () => {
    try {
      const response = await bloqueoDisponibilidadService.getDeportes()
      setDeportes(response)
    } catch (error) {
      console.error("Error al cargar los deportes:", error)
    }
  }

  const fetchTurnosBloqueados = async () => {
    try {
      setLoading(true)
      const response = await bloqueoDisponibilidadService.getAll()
      setTurnosBloqueados(response.data)
    } catch (error) {
      toast.error("Error al cargar los turnos bloqueados")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarBloqueo = async (bloqueo) => {
    try {
      setLoading(true)
      await bloqueoDisponibilidadService.destroy(bloqueo.id)
      toast.success("Turno desbloqueado exitosamente")
      fetchTurnosBloqueados() // Recargar la lista
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al desbloquear el turno")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar turnos bloqueados por fecha
  const turnosPorFecha = turnosBloqueados.reduce((acc, turno) => {
    const fecha = turno.fecha
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(turno)
    return acc
  }, {})

  // Función para obtener el nombre del deporte
  const getDeporteNombre = (deporteId) => {
    const deporte = deportes.find(d => d.id === deporteId)
    return deporte ? deporte.nombre + " " + deporte.jugadores_por_equipo : "Deporte no encontrado"
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
      <Header />
      <ToastContainer position="top-right" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate("/bloquear-turnos")}
            variant="ghost"
            className="flex items-center gap-2 hover:bg-naranja hover:text-white rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Volver a Bloquear Turnos</span>
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-xl font-semibold text-center">Turnos Bloqueados</CardTitle>
            <CardDescription className="text-center mt-2">
              Lista de turnos bloqueados por fecha
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando turnos bloqueados...</p>
              </div>
            ) : Object.keys(turnosPorFecha).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No hay turnos bloqueados</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(turnosPorFecha).map(([fecha, turnos]) => (
                  <div key={fecha} className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                      {format(new Date(fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {turnos.map((turno) => (
                        <div
                          key={turno.id}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                Cancha {turno.cancha.nro}
                              </p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(`2000-01-01 ${turno.horario.hora_inicio}`), "HH:mm")} -{" "}
                                {format(new Date(`2000-01-01 ${turno.horario.hora_fin}`), "HH:mm")}
                              </p>
                              <p className="text-sm text-gray-600">
                                {getDeporteNombre(turno.cancha.deporte_id)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleEliminarBloqueo(turno)}
                              disabled={loading}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TurnosBloqueados