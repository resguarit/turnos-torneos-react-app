"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronLeft, Check, X, Plus, Calendar, CreditCard, Banknote } from "lucide-react"; // Added Banknote icon
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axiosConfig";

export default function VerPagos() {
  const navigate = useNavigate();
  const { equipoId } = useParams();
  const torneoId = localStorage.getItem("torneo_id");
  const zonaId = localStorage.getItem("zona_id");
  const [equipo, setEquipo] = useState({ nombre: "" });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("inscripcion");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [valorInscripcion, setValorInscripcion] = useState(0);
  const [valorFecha, setValorFecha] = useState(0);
  const [inscripcionPagada, setInscripcionPagada] = useState(false);
  const [estadoPagosPorFecha, setEstadoPagosPorFecha] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]); // State for payment methods
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(""); // State for selected payment method

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch equipo data
        const equipoResponse = await api.get(`/equipos/${equipoId}`);
        setEquipo(equipoResponse.data);

        // Fetch torneo data to get precios
        const torneoResponse = await api.get(`/torneos/${torneoId}`);
        setValorInscripcion(torneoResponse.data.precio_inscripcion);
        setValorFecha(torneoResponse.data.precio_por_fecha);

        // Fetch pagos por fecha for the entire zona
        const pagosPorFechaResponse = await api.get(`/equipos/${equipoId}/zonas/${zonaId}/pago-fecha`);
        setEstadoPagosPorFecha(pagosPorFechaResponse.data.pagos_por_fecha);

        // Fetch inscripción status
        const inscripcionResponse = await api.get(`/equipos/${equipoId}/torneos/${torneoId}/pago-inscripcion`);
        setInscripcionPagada(!!inscripcionResponse.data.transaccion);

        // Fetch payment methods
        const metodosPagoResponse = await api.get('/metodos-pago'); // Adjust endpoint if needed
        setMetodosPago(metodosPagoResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle specific errors if needed (e.g., show toast notification)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipoId, torneoId, zonaId]);

  const handleRegistrarPago = async () => {
    // Ensure a payment method is selected
    if (!metodoPagoSeleccionado) {
      console.error("Por favor, selecciona un método de pago."); // Or show a toast
      return;
    }

    try {
      setLoading(true); // Consider a different loading state for the modal action

      if (tipoSeleccionado === "inscripcion") {
        // Use the new route for registration payment
        await api.post(`/pago/inscripcion/${equipoId}/${torneoId}/${metodoPagoSeleccionado}`);
        setInscripcionPagada(true); // Update UI immediately
      } else if (tipoSeleccionado === "fecha" && fechaSeleccionada) {
        // Use the new route for date payment
        await api.post(`/pago/fecha/${fechaSeleccionada}/${metodoPagoSeleccionado}`);
        // Update the local state to reflect the payment
        setEstadoPagosPorFecha((prev) =>
          prev.map((pago) =>
            pago.fecha_id === parseInt(fechaSeleccionada)
              ? { ...pago, transaccion: { id: "new", monto: valorFecha } } // Simulate transaction object
              : pago
          )
        );
      }

      setModalOpen(false); // Close modal on success
      setMetodoPagoSeleccionado(""); // Reset selected payment method
      // Optionally: Refetch data or show success message
    } catch (error) {
      console.error("Error registering payment:", error);
      // Show error message to the user (e.g., using toast)
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Helper to get fecha name from estadoPagosPorFecha
  const getFechaNombre = (fechaId) => {
    const pagoInfo = estadoPagosPorFecha.find(p => p.fecha_id === fechaId);
    return pagoInfo?.fecha_nombre || `Fecha ${fechaId}`;
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        {/* ... Botón Atrás y Título ... */}
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
            {/* ... Info Equipo, Inscripción, Pagos por Fecha ... */}
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
                  {estadoPagosPorFecha?.length > 0 ? (
                    estadoPagosPorFecha.map((pago) => (
                      <tr key={pago.fecha_id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{pago.fecha_nombre || `Fecha ${pago.fecha_id}`}</td>
                        <td className="py-3 px-4 text-sm">${valorFecha}</td>
                        <td className="py-3 px-4 text-sm">
                          {pago.transaccion ? (
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
                        {loading ? 'Cargando...' : 'No hay fechas programadas o pagos registrados.'}
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
          <div className="py-4 space-y-4"> {/* Added space-y-4 */}
            {/* Payment Type Selection */}
            <RadioGroup value={tipoSeleccionado} onValueChange={setTipoSeleccionado} className="space-y-4">
              {/* Inscripción Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="inscripcion" id="inscripcion" disabled={inscripcionPagada} /> {/* Disable if already paid */}
                <div className="grid gap-1.5">
                  <Label htmlFor="inscripcion" className={`font-medium ${inscripcionPagada ? 'text-gray-400' : ''}`}>
                    Inscripción {inscripcionPagada ? '(Pagada)' : ''}
                  </Label>
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-500">Valor: ${valorInscripcion}</p>
                  </div>
                </div>
              </div>
              {/* Fecha Option */}
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
                  {/* Date Selection Dropdown (only if 'fecha' is selected) */}
                  {tipoSeleccionado === "fecha" && (
                    <Select value={fechaSeleccionada} onValueChange={setFechaSeleccionada}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Filter out already paid dates */}
                        {estadoPagosPorFecha.filter(p => !p.transaccion).map((pago) => (
                          <SelectItem key={pago.fecha_id} value={pago.fecha_id.toString()}>
                            {pago.fecha_nombre || `Fecha ${pago.fecha_id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </RadioGroup>

            {/* Payment Method Selection */}
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="metodo-pago" className="font-medium">
                Método de Pago
              </Label>
              <div className="flex items-center">
                 <Banknote className="mr-2 h-4 w-4 text-gray-500" /> {/* Icon for payment method */}
                 <Select value={metodoPagoSeleccionado} onValueChange={setMetodoPagoSeleccionado}>
                    <SelectTrigger id="metodo-pago" className="w-full">
                       <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                       {metodosPago.map((metodo) => (
                          <SelectItem key={metodo.id} value={metodo.id.toString()}>
                             {metodo.nombre}
                          </SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); setMetodoPagoSeleccionado(""); }}> {/* Reset on cancel */}
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarPago}
              disabled={
                !metodoPagoSeleccionado || // Disabled if no payment method selected
                (tipoSeleccionado === "inscripcion" && inscripcionPagada) || // Disabled if inscription already paid
                (tipoSeleccionado === "fecha" && !fechaSeleccionada) // Disabled if 'fecha' selected but no date chosen
              }
            >
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
