import React from 'react';
import { Check, Calendar, Clock, MapPin } from "lucide-react"
import CheckoutLayout from './layout';

const reservaInfo = 
    {
        fecha: "2025-05-13",
        horario: "10:00 - 12:00",
        duracion: "2 horas",
        cancha: "Cancha 1",
        ubicacion: "Av. 123, Ciudad, País"
    }

const CheckoutSuccess = () => {
    return (
        <CheckoutLayout status="success">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-transparent mix-blend-overlay"></div>
        <div className="absolute -inset-1 bg-grid-white/10 opacity-20"></div>
        <h1 className="text-2xl font-bold relative z-10">Reserva Confirmada</h1>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 shadow-md">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-600">¡Turno Confirmado!</h2>
          <p className="text-gray-600 text-center mt-2">
            Tu reserva ha sido confirmada exitosamente. Te esperamos en la cancha.
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">Detalles de la reserva:</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Fecha</p>
                <p className="text-sm text-gray-600">{reservaInfo.fecha}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Horario y Duración</p>
                <p className="text-sm text-gray-600">
                  {reservaInfo.horario} ({reservaInfo.duracion})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-gray-500 mt-0.5">
                <span className="text-xs font-bold">F5</span>
              </div>
              <div>
                <p className="text-sm font-medium">Cancha</p>
                <p className="text-sm text-gray-600">{reservaInfo.cancha}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm text-gray-600">{reservaInfo.ubicacion}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <span className="font-medium">Información importante:</span> Recibirás un comprobante por email. El saldo
            restante se abona al momento de jugar.
          </p>
        </div>
      </div>

      <div className="p-4 flex justify-center">
        <button className="bg-black text-white px-6 py-2 rounded-md font-medium transition-colors">
          Ir a Mis Turnos
        </button>
      </div>
    </div>
    </CheckoutLayout>
  )
}

export default CheckoutSuccess;
