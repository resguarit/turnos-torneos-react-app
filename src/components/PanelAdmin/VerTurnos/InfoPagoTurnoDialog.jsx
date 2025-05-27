import React, { useState, useEffect } from 'react';
import { X, CreditCard, ChevronDown, ChevronUp, CheckCircle, DollarSign, Calendar, Clock, MapPin, User, Receipt } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { formatearFechaCompleta, formatearFechaCorta, formatearHora, formatearMonto, formatearRangoHorario } from '@/utils/dateUtils';

const InfoPagoTurnoDialog = ({ isOpen, onClose, turno }) => {
  const [loading, setLoading] = useState(false);
  const [cuentaCorriente, setCuentaCorriente] = useState(null);
  const [transaccionesTurno, setTransaccionesTurno] = useState(null);
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(true); // Por defecto mostrar el historial
  
  // Buscar la información al abrir el modal
  useEffect(() => {
    if (isOpen && turno) {
      buscarCuentaCorriente();
      buscarTransaccionesTurno();
    }
  }, [isOpen, turno]);
  
  const buscarCuentaCorriente = async () => {
    if (!turno?.usuario?.persona_id) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/cuentas-corrientes/persona/${turno.usuario.persona_id}`);
      
      if (response.data && response.data.status === 200) {
        setCuentaCorriente(response.data.cuenta_corriente);
      }
    } catch (error) {
      console.error('Error al buscar la cuenta corriente:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const buscarTransaccionesTurno = async () => {
    if (!turno?.id) return;
    
    setLoadingTransacciones(true);
    try {
      const response = await api.get(`/transacciones/turno/${turno.id}`);
      if (response.data) {
        setTransaccionesTurno(response.data);
      }
    } catch (error) {
      console.error('Error al buscar las transacciones del turno:', error);
      toast.error('Error al obtener el historial de pagos del turno');
    } finally {
      setLoadingTransacciones(false);
    }
  };

  const getMetodoPagoLabel = (metodo) => {
    switch (metodo) {
      case 'efectivo':
        return 'Efectivo';
      case 'transferencia':
        return 'Transferencia';
      case 'tarjeta':
        return 'Tarjeta';
      default:
        return metodo;
    }
  };
  
  if (!isOpen || !turno) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Información de Pago
                </h2>
                <p className="text-sm text-gray-500">Turno #{turno.id}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Estado del Turno - Badge destacado */}
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Turno Pagado Completamente</span>
            </div>
          </div>

          {/* Información del Turno - Diseño mejorado */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Detalles del Turno
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</p>
                  <p className="text-sm font-semibold text-gray-900">{turno.usuario.nombre}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monto Total</p>
                  <p className="text-sm font-semibold text-gray-900">${formatearMonto(turno.monto_total)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</p>
                  <p className="text-sm font-semibold text-gray-900">{turno?.fecha_turno ? formatearFechaCompleta(turno.fecha_turno) : 'Fecha no disponible'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Horario</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {turno?.horario?.hora_inicio && turno?.horario?.hora_fin 
                      ? formatearRangoHorario(turno.horario.hora_inicio, turno.horario.hora_fin)
                      : 'Horario no disponible'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cancha</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {turno.cancha.tipo_cancha} #{turno.cancha.nro}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de cuenta corriente */}
          {loading ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Cargando información de cuenta...</p>
            </div>
          ) : cuentaCorriente ? (
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Cuenta Corriente #{cuentaCorriente.id}</p>
                  <p className="text-sm text-gray-600">
                    Saldo actual: <span className={`font-semibold ${cuentaCorriente.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${formatearMonto(cuentaCorriente.saldo)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">Este cliente no tiene cuenta corriente asociada</p>
            </div>
          )}

          {/* Resumen de Pagos */}
          {loadingTransacciones ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Cargando historial de pagos...</p>
            </div>
          ) : transaccionesTurno ? (
            <div className="mb-6">
              {/* Resumen del saldo */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Pago Completado</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 uppercase tracking-wide">Saldo Restante</p>
                    <p className="text-lg font-bold text-green-800">
                      ${formatearMonto(transaccionesTurno.saldo)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón para mostrar/ocultar historial */}
              <button
                type="button"
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Historial Detallado de Pagos
                </span>
                {mostrarHistorial ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Historial desplegable */}
              {mostrarHistorial && transaccionesTurno.transacciones && transaccionesTurno.transacciones.length > 0 && (
                <div className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {transaccionesTurno.transacciones.map((trans, index) => (
                      <div 
                        key={index} 
                        className="p-4 border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{trans.descripcion}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatearFechaCorta(trans.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatearHora(trans.created_at)}
                              </span>
                              <span className="bg-gray-100 px-2 py-1 rounded-full">
                                {getMetodoPagoLabel(trans.metodo_pago)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className={`text-lg font-bold ${
                              trans.monto.toString().startsWith('-') ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {trans.monto.toString().startsWith('-') ? '-' : '+'}${formatearMonto(trans.monto)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje si no hay transacciones */}
              {mostrarHistorial && (!transaccionesTurno.transacciones || transaccionesTurno.transacciones.length === 0) && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No se encontraron transacciones para este turno</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 text-center">No se pudo cargar la información de pagos</p>
            </div>
          )}

          {/* Botón de cerrar */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPagoTurnoDialog; 