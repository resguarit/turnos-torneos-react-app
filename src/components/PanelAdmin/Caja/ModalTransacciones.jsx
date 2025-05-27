import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Banknote, ArrowDownToLine, CreditCard, Clock, User, Building2 } from "lucide-react";
import { formatearFechaCorta, formatearHora } from '@/utils/dateUtils';

const ModalTransacciones = ({ showModal, setShowModal, transacciones, loading }) => {
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transacciones de la Caja</DialogTitle>
          <DialogDescription>
            Lista de todas las transacciones realizadas durante este cierre de caja
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !transacciones || transacciones.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay transacciones registradas
          </div>
        ) : (
          <div className="space-y-4">
            {transacciones.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border rounded-lg gap-2"
              >
                <div className="space-y-1">
                  <p className="font-medium">{transaction.descripcion}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{formatearFechaCorta(transaction.fecha)} {formatearHora(transaction.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {transaction.cliente ? (
                      <>
                        <User className="h-4 w-4" />
                        <span>Cliente: {transaction.cliente.nombre}</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4" />
                        <span>Movimiento de caja</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {transaction.metodo_pago?.nombre === 'efectivo' && <Banknote className="h-4 w-4" />}
                    {transaction.metodo_pago?.nombre === 'transferencia' && <ArrowDownToLine className="h-4 w-4" />}
                    {transaction.metodo_pago?.nombre === 'tarjeta' && <CreditCard className="h-4 w-4" />}
                    {transaction.metodo_pago?.nombre === 'mercadopago' && <CreditCard className="h-4 w-4" />}
                    <span className="text-sm">
                      {transaction.metodo_pago?.nombre === 'efectivo' ? 'Efectivo' : 
                       transaction.metodo_pago?.nombre === 'transferencia' ? 'Transferencia' : 
                       transaction.metodo_pago?.nombre === 'tarjeta' ? 'Tarjeta' : 
                       transaction.metodo_pago?.nombre === 'mercadopago' ? 'Mercado Pago' : 'Otro'}
                    </span>
                  </div>
                </div>
                <div className={`font-bold ${parseFloat(transaction.monto) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {parseFloat(transaction.monto) >= 0 ? '+' : ''}{parseFloat(transaction.monto).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalTransacciones; 