import React, { useState, useEffect } from 'react';
import { X, DollarSign, FilePlus, CreditCard } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';

const RegistrarPagoTurnoDialog = ({ isOpen, onClose, turno, onPagoRegistrado }) => {
  const [loading, setLoading] = useState(false);
  const [loadingCuenta, setLoadingCuenta] = useState(false);
  const [cuentaCorriente, setCuentaCorriente] = useState(null);
  const [tipoPago, setTipoPago] = useState('seña');
  
  const [formData, setFormData] = useState({
    monto: '',
    tipo: 'ingreso', // Por defecto es ingreso
    descripcion: '',
  });
  
  // Calcular montos según estado del turno
  const montoSeña = turno?.monto_seña || 0;
  const montoTotal = turno?.monto_total || 0;
  const montoRestante = turno?.estado === 'Señado' ? montoTotal - montoSeña : montoTotal;
  
  // Buscar la cuenta corriente al abrir el modal
  useEffect(() => {
    if (isOpen && turno) {
      buscarCuentaCorriente();
      
      // Inicializar con pago de seña
      actualizarMontoPorTipo('seña');
    }
  }, [isOpen, turno]);
  
  const buscarCuentaCorriente = async () => {
    if (!turno?.usuario?.persona_id) return;
    
    setLoadingCuenta(true);
    try {
      // Buscar la cuenta corriente por persona_id
      const response = await api.get(`/cuentas-corrientes/persona/${turno.usuario.persona_id}`);
      
      if (response.data && response.data.status === 200) {
        setCuentaCorriente(response.data.cuenta_corriente);
      } else if (response.data && response.data.status === 404) {
        // Si no tiene cuenta, preguntar si quiere crear una
        if (confirm('El cliente no tiene cuenta corriente. ¿Desea crear una para registrar el pago?')) {
          // Crear cuenta corriente
          const createResponse = await api.post('/cuenta-corriente', {
            persona_id: turno.usuario.persona_id
          });
          
          if (createResponse.data && createResponse.data.status === 201) {
            setCuentaCorriente(createResponse.data.cuenta_corriente);
            toast.success('Cuenta corriente creada correctamente');
          }
        }
      }
    } catch (error) {
      console.error('Error al buscar la cuenta corriente:', error);
      toast.error('Error al buscar la cuenta corriente del cliente');
    } finally {
      setLoadingCuenta(false);
    }
  };
  
  const actualizarMontoPorTipo = (tipo) => {
    let monto = 0;
    let descripcion = '';
    
    switch (tipo) {
      case 'seña':
        monto = montoSeña;
        descripcion = `Pago de seña para turno #${turno.id}`;
        break;
      case 'total':
        monto = montoRestante;
        descripcion = `Pago ${turno.estado === 'Señado' ? 'del resto' : 'total'} para turno #${turno.id}`;
        break;
      case 'otro':
        monto = '';
        descripcion = `Pago parcial para turno #${turno.id}`;
        break;
    }
    
    setFormData({
      ...formData,
      monto: monto.toString(),
      descripcion
    });
    
    setTipoPago(tipo);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'monto' && tipoPago === 'otro') {
      // Solo permitir números y punto decimal para el monto
      const validValue = value.replace(/[^0-9.]/g, '');
      setFormData({
        ...formData,
        [name]: validValue
      });
    } else if (name !== 'monto') {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!turno?.usuario?.persona_id) {
      toast.error('No se ha encontrado información del cliente');
      return;
    }
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      toast.error('El monto debe ser mayor a cero');
      return;
    }
    
    setLoading(true);
    
    try {
      // Crear transacción
      const transaccionData = {
        persona_id: turno.usuario.persona_id,
        monto: parseFloat(formData.monto),
        tipo: 'turno',
        descripcion: formData.descripcion
      };
      
      // Si hay cuenta corriente, agregarla también
      if (cuentaCorriente) {
        transaccionData.cuenta_corriente_id = cuentaCorriente.id;
      }
      
      const response = await api.post('/transacciones', transaccionData);
      
      if (response.data && response.data.status === 201) {
        // Determinar nuevo estado del turno
        let nuevoEstado = turno.estado;
        
        if (tipoPago === 'total' || (tipoPago === 'otro' && parseFloat(formData.monto) >= montoRestante)) {
          nuevoEstado = 'Pagado';
        } else if (tipoPago === 'seña' && turno.estado === 'Pendiente') {
          nuevoEstado = 'Señado';
        }
        
        // Actualizar el estado del turno si cambió
        if (nuevoEstado !== turno.estado) {
          const turnoResponse = await api.patch(`/turnos/${turno.id}`, {
            estado: nuevoEstado
          });
          
          if (turnoResponse.data && turnoResponse.data.status === 200) {
            toast.success(`Turno actualizado a estado: ${nuevoEstado}`);
          }
        }
        
        toast.success('Pago registrado correctamente');
        
        if (onPagoRegistrado) {
          onPagoRegistrado(response.data);
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen || !turno) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Registrar Pago de Turno
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Información del Turno */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-semibold">Cliente:</p>
                <p className="text-sm">{turno.usuario.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Estado:</p>
                <p className="text-sm">{turno.estado}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Fecha:</p>
                <p className="text-sm">{new Date(turno.fecha_turno).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Hora:</p>
                <p className="text-sm">{turno.horario.hora_inicio} - {turno.horario.hora_fin}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Cancha:</p>
                <p className="text-sm">{turno.cancha.tipo_cancha} #{turno.cancha.nro}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Monto Total:</p>
                <p className="text-sm">${turno.monto_total}</p>
              </div>
            </div>
          </div>

          {/* Estado de cuenta corriente */}
          {loadingCuenta ? (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-sm">Buscando cuenta corriente...</p>
            </div>
          ) : cuentaCorriente ? (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Cuenta Corriente #{cuentaCorriente.id}</p>
                  <p className="text-sm text-gray-600">
                    Saldo actual: <span className={cuentaCorriente.saldo >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${cuentaCorriente.saldo}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">No se encontró una cuenta corriente para este cliente.</p>
            </div>
          )}

          {/* Formulario de pago */}
          <form onSubmit={handleSubmit}>
            {/* Tipo de pago */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`p-2 text-sm rounded-md ${
                    tipoPago === 'seña' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${turno.estado === 'Señado' || turno.estado === 'Pagado' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => actualizarMontoPorTipo('seña')}
                  disabled={turno.estado === 'Señado' || turno.estado === 'Pagado'}
                >
                  Seña
                </button>
                <button
                  type="button"
                  className={`p-2 text-sm rounded-md ${
                    tipoPago === 'total' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${turno.estado === 'Pagado' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => actualizarMontoPorTipo('total')}
                  disabled={turno.estado === 'Pagado'}
                >
                  Pago Total
                </button>
                <button
                  type="button"
                  className={`p-2 text-sm rounded-md ${
                    tipoPago === 'otro' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${turno.estado === 'Pagado' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => actualizarMontoPorTipo('otro')}
                  disabled={turno.estado === 'Pagado'}
                >
                  Otro
                </button>
              </div>
            </div>

            {/* Monto */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    tipoPago !== 'otro' ? 'bg-gray-100' : ''
                  }`}
                  required
                  readOnly={tipoPago !== 'otro'}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilePlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del pago"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || turno.estado === 'Pagado'}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
              >
                {loading ? 'Procesando...' : 'Registrar Pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarPagoTurnoDialog;
