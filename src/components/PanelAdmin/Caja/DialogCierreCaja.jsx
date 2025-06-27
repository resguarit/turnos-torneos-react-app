import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, ArrowDownToLine, CreditCard, X } from "lucide-react";

const DialogCierreCaja = ({
  showClosingDialog,
  setShowClosingDialog,
  balanceTotal,
  efectivoEnCaja,
  conteoEfectivo,
  setConteoEfectivo,
  resumenPagos,
  cerrarCaja,
  loading
}) => (
  showClosingDialog && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-[8px] shadow-lg max-w-md w-full relative flex flex-col max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          onClick={() => setShowClosingDialog(false)}
          disabled={loading}
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-6">
          <div className="mb-2">
            <h2 className="text-xl font-bold">Cerrar Caja</h2>
            <p className="text-gray-600 text-sm">Confirme el cierre de caja y el conteo final de efectivo.</p>
          </div>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span>Balance total:</span>
                <span className="font-bold">${balanceTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Efectivo en caja:</span>
                <span className="font-bold">${efectivoEnCaja.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pagos electrónicos:</span>
                <span className="font-bold">${(
                  (resumenPagos?.transferencia || 0) +
                  (resumenPagos?.tarjeta || 0) +
                  (resumenPagos?.mercadopago || 0)
                ).toFixed(2)}</span>
              </div>
              {resumenPagos?.gastos > 0 && (
                <div className="flex justify-between items-center">
                  <span>Gastos operativos:</span>
                  <span className="font-bold text-red-600">-${resumenPagos?.gastos.toFixed(2) || '0.00'}</span>
                </div>
              )}
            </div>

            <Alert>
              <AlertTitle>Conteo de efectivo físico</AlertTitle>
              <AlertDescription>
                Solo debe contar el dinero físico (efectivo) en la caja.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="closingCount">Conteo de efectivo</Label>
              <input
                id="closingCount"
                type="number"
                min="0"
                step="0.01"
                value={conteoEfectivo}
                onChange={(e) => setConteoEfectivo(e.target.value)}
                placeholder="0.00"
                className='border border-black rounded-[6px] w-full px-3 py-2'
              />
            </div>

            {conteoEfectivo && parseFloat(conteoEfectivo) !== efectivoEnCaja && (
              <Alert variant={parseFloat(conteoEfectivo) > efectivoEnCaja ? "destructive" : "default"}>
                <AlertTitle>
                  {parseFloat(conteoEfectivo) > efectivoEnCaja
                    ? `Sobrante de efectivo: $${(parseFloat(conteoEfectivo) - efectivoEnCaja).toFixed(2)}`
                    : `Faltante de efectivo: $${(efectivoEnCaja - parseFloat(conteoEfectivo)).toFixed(2)}`}
                </AlertTitle>
                <AlertDescription>
                  {parseFloat(conteoEfectivo) > efectivoEnCaja
                    ? "Hay más efectivo físico del esperado según las transacciones. Verifique los registros."
                    : "Hay menos efectivo físico del esperado según las transacciones. Verifique los registros."}
                </AlertDescription>
              </Alert>
            )}

            <div className="border rounded-md p-3 space-y-2">
              <h4 className="font-medium">Resumen por método de pago:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Banknote className="h-4 w-4" /> Efectivo:
                  </span>
                  <span>${resumenPagos?.efectivo?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <ArrowDownToLine className="h-4 w-4" /> Transferencias:
                  </span>
                  <span>${resumenPagos?.transferencia?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" /> Tarjetas:
                  </span>
                  <span>${resumenPagos?.tarjeta?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" /> Mercado Pago:
                  </span>
                  <span>${resumenPagos?.mercadopago?.toFixed(2) || '0.00'}</span>
                </div>
                {resumenPagos?.gastos > 0 && (
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="flex items-center gap-1 font-medium text-red-600">
                      Gastos operativos:
                    </span>
                    <span className="text-red-600">-${resumenPagos?.gastos?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowClosingDialog(false)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-400 border-gray-300 text-gray-800 rounded-[6px] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={cerrarCaja}
              disabled={loading}
              className="px-3 py-2 bg-naranja text-white rounded-[6px] transition-colors"
            >
              Confirmar Cierre
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

export default DialogCierreCaja;
