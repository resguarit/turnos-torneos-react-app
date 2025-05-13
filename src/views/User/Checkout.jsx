import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import MercadoPagoWallet from '@/components/MercadoPagoWallet';
import { Loader2 } from "lucide-react";
export default function MercadoPagoCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { turno } = useLocation().state || {};
  const [walletReady, setWalletReady] = useState(false);
  
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = parseISO(fechaStr);
    return format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const calcularPorcentaje = (monto_seña, monto_total) => {
    const porcentaje = monto_seña / monto_total;
    return `${(porcentaje * 100).toFixed(0)}%`;
  };

  // Cuando el Wallet esté listo, actualiza el estado
  const handleWalletReady = () => {
    setWalletReady(true);
  };

  if (!turno) {
    return <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>No se encontró información del turno. Por favor vuelve e intenta nuevamente.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Volver
        </button>
      </div>
    </div>
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden relative">
        {/* Overlay de loading */}
        {!walletReady && (
          <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-naranja animate-spin mb-3" />
            <p className="text-lg font-medium">Cargando pago seguro...</p>
          </div>
        )}

        {/* Header con título */}
        <div className="bg-naranja text-white p-4">
          <h1 className="text-xl font-bold text-center">Pago de Seña</h1>
        </div>
        
        {/* Información del pago */}
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Tu reserva:</span>
            <span className="text-gray-800 font-medium">Cancha nro {turno.cancha.nro} {turno.cancha.tipo_cancha} - {formatFecha(turno.fecha_turno)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Horario:</span>
            <span className="text-gray-800 font-medium">{turno.horario.hora_inicio}hs - {turno.horario.hora_fin}hs</span>
          </div>
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Valor total:</span>
              <span className="text-gray-800">${turno.monto_total.toLocaleString('es-AR')}</span>
            </div>
            
            <div className="border-t border-dashed border-gray-200 my-3"></div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-green-600 font-bold">Seña a pagar ahora:</span>
                <div className="text-xs text-gray-500">({calcularPorcentaje(turno.monto_seña, turno.monto_total)} del total)</div>
              </div>
              <span className="text-green-600 font-bold text-2xl">${turno.monto_seña.toLocaleString('es-AR')}</span>
            </div>
            
            <div className="border-t border-dashed border-gray-200 my-3"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saldo a pagar en el lugar:</span>
              <span className="text-gray-800">${(turno.monto_total - turno.monto_seña).toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
        
        {/* Métodos de pago permitidos */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium mb-4">Métodos de pago disponibles</h2>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Tarjetas */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs text-center text-gray-600">Tarjetas</span>
            </div>
            
            {/* Transferencia */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-xs text-center text-gray-600">Transferencia</span>
            </div>
            
            {/* Dinero en cuenta */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="text-xs text-center text-gray-600">Dinero en cuenta</span>
            </div>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700">
            <p className="font-medium">Pago seguro con Mercado Pago</p>
          </div>
        </div>
        
        {/* Información adicional del pago */}
        <div className="px-6 py-4 bg-gray-50 text-sm">
          <h3 className="font-medium text-gray-800 mb-2">Información del pago:</h3>
          <ul className="space-y-1 text-gray-600">
            <li>• El pago de la seña confirma automáticamente tu reserva</li>
            <li>• Recibirás un comprobante por email al finalizar</li>
            <li>• Puedes cancelar hasta 30 minutos después sin costo</li>
            <li>• El saldo restante se abona al momento de jugar</li>
          </ul>
        </div>
        
        {/* Botones de acción */}
        <div className="p-6">
          {console.log(turno.id)}
          <MercadoPagoWallet turnoId={turno.id} onReady={handleWalletReady} />
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="px-6 pb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}