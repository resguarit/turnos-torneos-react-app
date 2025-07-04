import { useState, useEffect } from "react"
import { ChevronLeft, Trash2, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { descuentoService } from "@/services/descuentoService"

function VerDescuentos() {
  const navigate = useNavigate()
  const [descuentos, setDescuentos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDescuentos()
  }, [])

  const fetchDescuentos = async () => {
    try {
      setLoading(true)
      const response = await descuentoService.getDescuentos()
      setDescuentos(response.data)
    } catch (error) {
      toast.error("Error al cargar los descuentos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarDescuento = async (descuento) => {
    try {
      setLoading(true)
      await descuentoService.eliminarDescuento(descuento.id)
      toast.success("Descuento eliminado exitosamente")
      fetchDescuentos() // Recargar la lista
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar el descuento")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar descuentos por fecha
  const descuentosPorFecha = descuentos.reduce((acc, descuento) => {
    const fecha = descuento.fecha
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(descuento)
    return acc
  }, {})

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
      <Header />
      <ToastContainer position="top-right" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate("/descuentos")}
            variant="ghost"
            className="flex items-center gap-2 hover:bg-naranja hover:text-white rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Volver a Descuentos</span>
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-xl font-semibold text-center">Descuentos Aplicados</CardTitle>
            <CardDescription className="text-center mt-2">
              Lista de descuentos agrupados por fecha
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando descuentos...</p>
              </div>
            ) : Object.keys(descuentosPorFecha).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No hay descuentos aplicados</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(descuentosPorFecha).map(([fecha, descuentos]) => (
                  <div key={fecha} className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                      {format(new Date(fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {descuentos.map((descuento) => (
                        <div
                          key={descuento.id}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                Cancha {descuento.cancha?.nro || '-'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {descuento.horario ? `${descuento.horario.hora_inicio} - ${descuento.horario.hora_fin}` : '-'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Tipo: {descuento.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Fijo ($)'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Valor: {descuento.valor}
                              </p>
                              {descuento.motivo && (
                                <p className="text-sm text-gray-600">Motivo: {descuento.motivo}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleEliminarDescuento(descuento)}
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

export default VerDescuentos
