import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, ArrowDownToLine, CreditCard } from "lucide-react";

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
  <Dialog open={showClosingDialog} onOpenChange={setShowClosingDialog}>
    <DialogContent className="max-w-md rounded-lg">
      <DialogHeader>
        <DialogTitle>Cerrar Caja</DialogTitle>
        <DialogDescription>Confirme el cierre de caja y el conteo final de efectivo.</DialogDescription>
      </DialogHeader>

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
            <span className="font-bold">${(balanceTotal - efectivoEnCaja).toFixed(2)}</span>
          </div>
        </div>

        <Alert>
          <AlertTitle>Conteo de efectivo físico</AlertTitle>
          <AlertDescription>
            Solo debe contar el dinero físico (efectivo) en la caja.
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="closingCount">Conteo de efectivo</Label>
          <Input
            id="closingCount"
            type="number"
            min="0"
            step="0.01"
            value={conteoEfectivo}
            onChange={(e) => setConteoEfectivo(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {conteoEfectivo && parseFloat(conteoEfectivo) !== efectivoEnCaja && (
          <Alert variant={parseFloat(conteoEfectivo) > efectivoEnCaja ? "destructive" : "default"}>
            <AlertTitle>
              {parseFloat(conteoEfectivo) > efectivoEnCaja
                ? `Sobrante: $${(parseFloat(conteoEfectivo) - efectivoEnCaja).toFixed(2)}`
                : `Faltante: $${(efectivoEnCaja - parseFloat(conteoEfectivo)).toFixed(2)}`}
            </AlertTitle>
            <AlertDescription>
              {parseFloat(conteoEfectivo) > efectivoEnCaja
                ? "Hay más efectivo del esperado. Verifique las transacciones."
                : "Hay menos efectivo del esperado. Verifique las transacciones."}
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
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button 
          variant="outline" 
          onClick={() => setShowClosingDialog(false)}
          className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 rounded-md transition-colors"
        >
          Cancelar
        </Button>
        <Button 
          onClick={cerrarCaja} 
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
        >
          Confirmar Cierre
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DialogCierreCaja;
