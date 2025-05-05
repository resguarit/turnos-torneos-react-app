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
     // Ensure fecha is selected if type is fecha
     if (tipoSeleccionado === "fecha" && !fechaSeleccionada) {
        console.error("Por favor, selecciona una fecha."); // Or show a toast
        return;
     }

    setLoading(true); // Use a separate loading state if preferred (e.g., actionLoading)
    try {
      if (tipoSeleccionado === "inscripcion") {
        await api.post(`/pago/inscripcion/${equipoId}/${torneoId}/${metodoPagoSeleccionado}`);
        setInscripcionPagada(true);
      } else if (tipoSeleccionado === "fecha") {
        await api.post(`/pago/fecha/${fechaSeleccionada}/${metodoPagoSeleccionado}`);
        setEstadoPagosPorFecha((prev) =>
          prev.map((pago) =>
            pago.fecha_id === parseInt(fechaSeleccionada)
              ? { ...pago, transaccion: { id: "new", monto: valorFecha } }
              : pago
          )
        );
      }

      setModalOpen(false);
      setMetodoPagoSeleccionado(""); // Reset selected method
      setFechaSeleccionada(""); // Reset selected date
      setTipoSeleccionado("inscripcion"); // Reset type
      // Optionally refetch data: fetchData();
    } catch (error) {
      console.error("Error registering payment:", error);
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

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"> {/* Added z-50 */}
          <div className="bg-white p-6 rounded-[8px] shadow-lg w-full max-w-md mx-4"> {/* Adjusted width */}
            <div>
              <div className="text-xl font-bold mb-4">Registrar Pago</div>
            </div>
            <div className="py-2 space-y-4"> {/* Added space-y-4 */}
              {/* Payment Type Selection */}
              <RadioGroup value={tipoSeleccionado} onValueChange={setTipoSeleccionado} className="space-y-4">
                {/* Inscripción Option */}
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="inscripcion" id="inscripcion" disabled={inscripcionPagada} />
                  <div className="grid gap-1.5">
                    <Label htmlFor="inscripcion" className={`font-medium text-base ${inscripcionPagada ? 'text-gray-400 cursor-not-allowed' : ''}`}>
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
                  <RadioGroupItem value="fecha" id="fecha" disabled={!estadoPagosPorFecha.some(p => !p.transaccion)} /> {/* Disable if no pending dates */}
                  <div className="grid gap-1.5 w-full">
                    <Label htmlFor="fecha" className={`font-medium text-base ${!estadoPagosPorFecha.some(p => !p.transaccion) ? 'text-gray-400 cursor-not-allowed' : ''}`}>
                      Pago por Fecha {!estadoPagosPorFecha.some(p => !p.transaccion) ? '(Todas Pagadas)' : ''}
                    </Label>
                    <div className="flex items-center mb-2">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-500">Valor: ${valorFecha}</p>
                    </div>
                    {tipoSeleccionado === "fecha" && (
                      <select
                      value={fechaSeleccionada}
                      onChange={(e) => setFechaSeleccionada(e.target.value)}
                      disabled={!estadoPagosPorFecha.some(p => !p.transaccion)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">Seleccionar fecha pendiente</option>
                      {estadoPagosPorFecha
                        .filter(p => !p.transaccion)
                        .map(pago => (
                          <option key={pago.fecha_id} value={pago.fecha_id}>
                            {pago.fecha_nombre || `Fecha ${pago.fecha_id}`}
                          </option>
                        ))}
                    </select>
                    
                    )}
                  </div>
                </div>
              </RadioGroup>

              {/* --- Payment Method Selection --- */}
              <div className="grid gap-1.5 w-full pt-2"> {/* Added pt-2 for spacing */}
                <Label htmlFor="metodo-pago" className="font-medium text-base">
                  Método de Pago
                </Label>
                <div className="flex items-center">
                  <Banknote className="mr-2 h-4 w-4 text-gray-500" />
                  <select
                    id="metodo-pago"
                    value={metodoPagoSeleccionado}
                    onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Seleccionar método</option>
                    {metodosPago.length > 0 ? (
                      metodosPago.map((metodo) => (
                        <option key={metodo.id} value={metodo.id}>
                          {metodo.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="loading" disabled>
                        Cargando métodos...
                      </option>
                    )}
                  </select>
                </div>
              </div>
              {/* --- End Payment Method Selection --- */}

            </div>
            <div className="w-full justify-end flex gap-2 mt-4"> {/* Increased mt-4 */}
              <Button variant="outline" onClick={() => { setModalOpen(false); setMetodoPagoSeleccionado(""); setFechaSeleccionada(""); setTipoSeleccionado("inscripcion"); }}> {/* Use Button component */}
                Cancelar
              </Button>
              <Button // Use Button component
                onClick={handleRegistrarPago}
                disabled={
                  loading || // Disable while any loading is active
                  !metodoPagoSeleccionado || // Disabled if no payment method selected
                  (tipoSeleccionado === "inscripcion" && inscripcionPagada) || // Disabled if inscription already paid
                  (tipoSeleccionado === "fecha" && !fechaSeleccionada) // Disabled if 'fecha' selected but no date chosen
                }
              >
                {loading ? 'Registrando...' : 'Confirmar Pago'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
