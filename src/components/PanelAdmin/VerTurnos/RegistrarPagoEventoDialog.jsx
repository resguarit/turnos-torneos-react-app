import React, { useState, useEffect } from "react";
import { X, DollarSign, Banknote, CreditCard, ArrowDownToLine } from "lucide-react";
import api from "@/lib/axiosConfig";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import BtnLoading from "@/components/BtnLoading";

const METODOS = [
  { id: 1, label: "Efectivo", icon: <Banknote className="h-4 w-4" /> },
  { id: 2, label: "Transferencia", icon: <ArrowDownToLine className="h-4 w-4" /> },
  { id: 3, label: "Tarjeta", icon: <CreditCard className="h-4 w-4" /> },
];

export default function RegistrarPagoEventoDialog({ isOpen, onClose, evento, onPagoRegistrado }) {
  const [loading, setLoading] = useState(false);
  const [metodoPagoId, setMetodoPagoId] = useState(1);

  if (!isOpen || !evento) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/pago/evento/${evento.evento_id}/${metodoPagoId}`);
      if (res.data && res.data.status === 201) {
        toast.success("Pago de evento registrado correctamente");
        if (onPagoRegistrado) onPagoRegistrado(res.data);
        onClose();
      } else {
        toast.error(res.data?.message || "Error al registrar el pago");
      }
    } catch (err) {
      toast.error("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Registrar Pago de Evento</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-sm"><b>Evento:</b> {evento.nombre}</p>
            <p className="text-sm"><b>Organizador:</b> {evento.persona?.name} (DNI: {evento.persona?.dni})</p>
            <p className="text-sm capitalize"><b>Fecha:</b> {format(parseISO(evento.fecha_turno), "EEE, dd/MM/yyyy", {locale:es})}</p>
            <p className="text-sm"><b>Monto:</b> {evento.monto ? `$${evento.monto}` : "No definido"}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Método de pago</label>
              <div className="flex gap-2">
                {METODOS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`flex items-center gap-1 px-3 py-2 rounded-[6px] border ${metodoPagoId === m.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setMetodoPagoId(m.id)}
                    disabled={loading}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[6px] shadow-sm hover:bg-gray-50"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-[6px] shadow-sm hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Procesando..." : "Registrar Pago"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}