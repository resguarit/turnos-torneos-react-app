import React from 'react';

const EstadoCaja = ({ cajaAbierta, operador, balanceTotal, efectivoEnCaja }) => (
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${cajaAbierta ? "bg-green-500" : "bg-red-500"}`}></div>
      <span className="font-medium">{cajaAbierta ? "Caja Abierta" : "Caja Cerrada"}</span>
      {cajaAbierta && <span className="text-sm text-gray-500">Operador: {operador}</span>}
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
