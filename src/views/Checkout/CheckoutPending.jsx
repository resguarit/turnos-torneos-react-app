import React from 'react';
import { AlertCircle, Clock } from "lucide-react"
import CheckoutLayout from './layout'; 

const reservaInfo = 
    {
        fecha: "2025-05-13",
        horario: "10:00 - 12:00",
        duracion: "2 horas",
        cancha: "Cancha 1",
        ubicacion: "Av. 123, Ciudad, País"
    }

const CheckoutPending = () => {
    return (
        <CheckoutLayout status="pending">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 text-center relative overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-transparent mix-blend-overlay"></div>
            <div className="absolute -inset-1 bg-grid-white/10 opacity-20"></div>
            <h1 className="text-2xl font-bold relative z-10">Pago Pendiente</h1>
          </div>
    
          <div className="p-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-amber-600">Pago en Proceso</h2>
              <p className="text-gray-600 text-center mt-2">
                Tu reserva está pendiente de pago. Tienes 30 minutos para realizar el pago de la seña.
              </p>
            </div>
    
            <div className="border rounded-lg p-4 bg-gray-50 mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Detalles de la reserva:</h3>
    
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fecha y Hora:</span>
                  <span className="text-sm text-gray-600">
                    {reservaInfo.fecha}, {reservaInfo.horario}
                  </span>
                </div>
    
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cancha:</span>
                  <span className="text-sm text-gray-600">{reservaInfo.cancha}</span>
                </div>
    
                <div className="flex justify-between text-amber-600">
                  <span className="text-sm font-medium">Seña a pagar:</span>
                  <span className="text-sm font-medium">{reservaInfo.sena}</span>
                </div>
              </div>
            </div>
    
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Información importante:</p>
                  <p>Si no realizas el pago de la seña en los próximos 30 minutos, tu turno se liberará automáticamente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </CheckoutLayout>
      )
    }

export default CheckoutPending;
