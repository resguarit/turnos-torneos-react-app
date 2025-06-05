import React from 'react';
import { formatearFechaCorta, formatearHora } from '@/utils/dateUtils';
import { Clock } from "lucide-react";

const EstadoCaja = ({ cajaAbierta, operador, balanceTotal, efectivoEnCaja, fechaApertura }) => (
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-2">
        <div className={`w-3 h-3 rounded-full ${cajaAbierta ? "bg-green-500" : "bg-red-500"}`}></div>
        <span className="font-medium">{cajaAbierta ? "Caja Abierta" : "Caja Cerrada"}</span>
        {cajaAbierta && <span className="text-sm text-gray-500">Operador: {operador}</span>}
      </div>
      {cajaAbierta && fechaApertura && (
        <div className="flex items-center justify-start gap-2">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="">
            <span className="font-medium">Abierta el:</span>{" "}
            <span className="text-gray-600">{formatearFechaCorta(fechaApertura)} a las {formatearHora(fechaApertura)}</span>
          </span>
        </div>
      )}
    </div>

    {cajaAbierta && (
      <div className="flex flex-col items-end">
        <span className="text-sm text-gray-500">Balance Total</span>
        <span className="text-2xl font-bold">${balanceTotal.toFixed(2)}</span>
        <span className="text-sm text-gray-500">Efectivo en caja: ${efectivoEnCaja.toFixed(2)}</span>
      </div>
    )}
  </div>
);

export default EstadoCaja;
