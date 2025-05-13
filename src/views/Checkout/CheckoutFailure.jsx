import React from 'react';
import { XCircle, AlertTriangle } from "lucide-react"
import CheckoutLayout from './layout';

const motivo = "Pago rechazado"

const CheckoutFailure = () => {
  return (
    <CheckoutLayout status="failure">
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 text-center relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/30 to-transparent mix-blend-overlay"></div>
        <div className="absolute -inset-1 bg-grid-white/10 opacity-20"></div>
        <h1 className="text-2xl font-bold relative z-10">Reserva Cancelada</h1>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4 shadow-md">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-600">Reserva Cancelada</h2>
          <p className="text-gray-600 text-center mt-2">Lo sentimos, tu reserva ha sido cancelada.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Motivo de la cancelación:</p>
              <p className="text-sm text-red-700 mt-1">{motivo}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-3">¿Qué puedo hacer ahora?</h3>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-bold text-black">1.</span>
              <span>Puedes intentar realizar una nueva reserva para otro horario disponible.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-black">2.</span>
              <span>Verificar la disponibilidad de canchas para la fecha deseada.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-black">3.</span>
              <span>Si crees que esto es un error, por favor contacta con soporte.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-4 flex justify-center space-x-4">
        <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors">
          Contactar Soporte
        </button>
        <button className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
          Realizar Nueva Reserva
        </button>
      </div>
    </div>
    </CheckoutLayout>
  )
}

export default CheckoutFailure;
