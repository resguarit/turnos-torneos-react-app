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
import { useLocation } from "react-router-dom";
import BtnLoading from "@/components/BtnLoading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerPagos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { equipoId } = useParams();
  const { equipoNombre, torneoNombre, torneoId, zonaId, precioInscripcion, precioFecha } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("inscripcion");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [valorInscripcion, setValorInscripcion] = useState(0);
  const [valorFecha, setValorFecha] = useState(0);
  const [inscripcionPagada, setInscripcionPagada] = useState(false);
  const [estadoPagosPorFecha, setEstadoPagosPorFecha] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]); 
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(""); 
  const [inscripcionTransaccion, setInscripcionTransaccion] = useState(null);
  const [noCapitan, setNoCapitan] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        setValorInscripcion(precioInscripcion || 0);
        setValorFecha(precioFecha || 0);

        // Unificada: obtener pagos de inscripción y por fecha
        const pagosResponse = await api.get(`/equipos/${equipoId}/torneos/${torneoId}/zonas/${zonaId}/pagos`);
        if (
          pagosResponse.data.status === 400 &&
          pagosResponse.data.message &&
          pagosResponse.data.message.toLowerCase().includes("capitán")
        ) {
          setNoCapitan(true);
          setInscripcionPagada(false);
          setInscripcionTransaccion(null);
          setEstadoPagosPorFecha([]);
        } else {
          setNoCapitan(false);
          // Inscripción
          setInscripcionPagada(!!pagosResponse.data.pago_inscripcion?.pagado);
          setInscripcionTransaccion(pagosResponse.data.pago_inscripcion?.transaccion || null);
          // Fechas
          setEstadoPagosPorFecha(pagosResponse.data.pagos_por_fecha || []);
        }

        // Métodos de pago activos
        const metodosPagoResponse = await api.get(`/metodos-pago`);
        const metodos = Array.isArray(metodosPagoResponse.data)
          ? metodosPagoResponse.data.filter(m => m.activo === 1)
          : [];
        setMetodosPago(metodos);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipoId, torneoId, zonaId, torneoNombre]);

  const handleRegistrarPago = async () => {
    // Ensure a payment method is selected
    if (!metodoPagoSeleccionado) {
      toast.error("Por favor, selecciona un método de pago.");
      return;
    }
    // Ensure fecha is selected if type is fecha
    if (tipoSeleccionado === "fecha" && !fechaSeleccionada) {
      toast.error("Por favor, selecciona una fecha.");
      return;
    }

    setLoading(true);
    try {
      let response;

      if (tipoSeleccionado === "inscripcion") {
        response = await api.post(`/pago/inscripcion/${equipoId}/${torneoId}/${metodoPagoSeleccionado}`);
      } else if (tipoSeleccionado === "fecha") {
        response = await api.post(`/pago/fecha/${fechaSeleccionada}/${metodoPagoSeleccionado}`);
      }

      // El backend devuelve HTTP 200 pero dentro del payload puede venir status 400 (string o number)
      console.log("Respuesta de pago:", response);
      if (response?.data && response.data.status === 400) {
        const errorMsg = response?.data?.error || response?.data?.message || "Error al registrar el pago";
        setTimeout(() => {
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 100);
        // Cerrar modal y resetear selecciones
        setModalOpen(false);
        setMetodoPagoSeleccionado("");
        setFechaSeleccionada("");
        setTipoSeleccionado("inscripcion");
        setLoading(false);
        return; // No continuamos con la lógica de éxito
      }

      // --- Lógica de éxito ---
      if (tipoSeleccionado === "inscripcion") {
        setInscripcionPagada(true);
        // Podríamos refrescar la transacción si el back la retorna en response.data
      } else if (tipoSeleccionado === "fecha") {
        setEstadoPagosPorFecha((prev) =>
          prev.map((pago) =>
            pago.fecha_id === parseInt(fechaSeleccionada)
              ? { ...pago, transaccion: { id: "new", monto: valorFecha, created_at: new Date().toISOString() } }
              : pago
          )
        );
      }

      setTimeout(() => {
        toast.success("Pago registrado correctamente", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 100);
      setModalOpen(false);
      setMetodoPagoSeleccionado("");
      setFechaSeleccionada("");
      setTipoSeleccionado("inscripcion");
    } catch (error) {
      console.error("Error registering payment:", error);
      
      // Verificar si el error contiene información del backend
      if (error.response?.data?.status === 400) {
        const errorMsg = error.response.data.error || error.response.data.message || "Error al registrar el pago";
        setTimeout(() => {
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 100);
      } else {
        setTimeout(() => {
          toast.error("Error al registrar el pago", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 100);
      }
      
      // Mantener el modal abierto para que el usuario pueda corregir
    } finally {
      setLoading(false);
    }
  };

  // Helper to get fecha name from estadoPagosPorFecha
  const getFechaNombre = (fechaId) => {
    const pagoInfo = estadoPagosPorFecha.find(p => p.fecha_id === fechaId);
    return pagoInfo?.fecha_nombre || `Fecha ${fechaId}`;
  };

  function formatFechaPago(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-center items-center h-full">
            <BtnLoading />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (noCapitan) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Estado de Pagos</h2>
            <p className="mb-6 text-gray-700">
              Para ver el estado de los pagos, debe haber un capitán asignado en el equipo.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-[6px] text-base font-medium shadow"
              onClick={() => navigate(`/jugadores/${equipoId}`, { state: { equipoNombre, zonaId } })}
            >
              Asignar Capitán
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <ToastContainer position="top-right" />
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        {/* ... Botón Atrás y Título ... */}
        <div className="w-full flex mb-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-secundario rounded-xl text-white py-2 px-3 text-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="px-4 md:px-40 justify-center">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Historial de Pagos</h1>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-secundario hover:bg-secundario/80 py-2 px-3 text-sm rounded-[6px] text-white flex items-center gap-1"
            >
              <Plus size={16} /> Registrar Pago
            </button>
          </div>

          <div className="bg-white w-full rounded-[8px] shadow-md p-6 mb-6">
            {/* ... Info Equipo, Inscripción, Pagos por Fecha ... */}
            <h2 className="text-2xl font-medium mb-4">
              Equipo: <span className="text-blue-600 capitalize">{equipoNombre}</span>
            </h2>

            {/* Inscripción */}
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Inscripción:</h3>
              <div className="bg-gray-100 p-4 rounded-[6px] flex justify-between items-center">
                <div>
                  <p className="font-medium">Valor: ${valorInscripcion}</p>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Estado:</span>
                  {inscripcionPagada ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                      <Check size={16} className="mr-1" /> Pagado
                      {/* Muestra la fecha de pago */}
                      <span className="ml-2 text-xs text-gray-500">
                        {formatFechaPago(inscripcionTransaccion?.created_at)}
                      </span>
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
              <h3 className="text-xl font-medium mb-3">Pagos por Fecha:</h3>
              <table className="min-w-full bg-white border border-gray-200 rounded-[6px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Fecha</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Valor</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Estado</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Pagado el</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
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
                        <td className="py-3 px-4 text-sm">
                          {pago.transaccion ? formatFechaPago(pago.transaccion.created_at) : '-'}
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
                  <RadioGroupItem
                    value="fecha"
                    id="fecha"
                    disabled={!((estadoPagosPorFecha || []).some(p => !p.transaccion))}
                  /> {/* Disable if no pending dates */}
                  <div className="grid gap-1.5 w-full">
                    <Label
                      htmlFor="fecha"
                      className={`font-medium text-base ${!((estadoPagosPorFecha || []).some(p => !p.transaccion)) ? 'text-gray-400 cursor-not-allowed' : ''}`}
                    >
                      Pago por Fecha {!((estadoPagosPorFecha || []).some(p => !p.transaccion)) ? '(Todas Pagadas)' : ''}
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
                      className="w-full border border-gray-300 rounded-[6px] p-2"
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
                    className="w-full border capitalize border-gray-300 rounded-[6px] p-2"
                  >
                    <option className="capitalize" value="">Seleccionar método</option>
                    {metodosPago.length > 0 ? (
                      metodosPago.map((metodo) => (
                        <option key={metodo.id} value={metodo.id}>
                          {metodo.nombre}
                        </option>
                      ))
                    ) : (
                      <option className="capitalize" value="loading" disabled>
                        Cargando métodos...
                      </option>
                    )}
                  </select>
                </div>
              </div>
              {/* --- End Payment Method Selection --- */}

            </div>
            <div className="w-full justify-end flex gap-2 mt-4"> {/* Increased mt-4 */}
              <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-[6px] hover:bg-gray-400" onClick={() => { setModalOpen(false); setMetodoPagoSeleccionado(""); setFechaSeleccionada(""); setTipoSeleccionado("inscripcion"); }}> {/* Use Button component */}
                Cancelar
              </button>
              <button // Use Button component
                className="bg-green-500 text-white px-4 py-2 rounded-[6px] hover:bg-green-600"
                onClick={handleRegistrarPago}
                disabled={
                  loading || // Disable while any loading is active
                  !metodoPagoSeleccionado || // Disabled if no payment method selected
                  (tipoSeleccionado === "inscripcion" && inscripcionPagada) || // Disabled if inscription already paid
                  (tipoSeleccionado === "fecha" && !fechaSeleccionada) // Disabled if 'fecha' selected but no date chosen
                }
              >
                {loading ? 'Registrando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
