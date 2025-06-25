import React, { useState, useEffect } from 'react';
import { X, Search, DollarSign, FilePlus, UserCircle, Banknote, ArrowDownToLine, CreditCard } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const AgregarTransaccionModal = ({ isOpen, onClose, cuentaCorrienteId = null, personaId = null, onTransaccionAgregada }) => {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    monto: '',
    tipo: 'ingreso',
    descripcion: '',
    metodo_pago: 'efectivo'
  });
  
  // Estados para el buscador de personas
  const [showBuscador, setShowBuscador] = useState(!cuentaCorrienteId && !personaId);
  const [busqueda, setBusqueda] = useState('');
  const [personas, setPersonas] = useState([]);
  const [filteredPersonas, setFilteredPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  
  // Cargar personas al inicializar
  useEffect(() => {
    if (isOpen && showBuscador) {
      fetchPersonas();
    }
  }, [isOpen, showBuscador]);
  
  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setFormData({
        monto: '',
        tipo: 'ingreso',
        descripcion: '',
        metodo_pago: 'efectivo'
      });
      setShowBuscador(!cuentaCorrienteId && !personaId);
      setPersonaSeleccionada(null);
      setBusqueda('');
    }
  }, [isOpen, cuentaCorrienteId, personaId]);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/personas');
      
      if (response.data && response.data.data) {
        const validPersonas = response.data.data.filter(persona => persona.dni);
        setPersonas(validPersonas);
        setFilteredPersonas(validPersonas.slice(0, 10)); // Mostrar las primeras 10 inicialmente
      } else if (response.data && response.data.personas && response.data.personas.data) {
        // Estructura alternativa
        const validPersonas = response.data.personas.data.filter(persona => persona.dni);
        setPersonas(validPersonas);
        setFilteredPersonas(validPersonas.slice(0, 10));
      } else {
        setPersonas([]);
        console.error('Estructura de respuesta inesperada:', response.data);
      }
    } catch (error) {
      console.error('Error al cargar personas:', error);
      toast.error('Error al cargar el listado de personas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'monto') {
      // Solo permitir números, punto decimal y signo negativo
      const cleanedValue = value.replace(/[^0-9.-]/g, '');
      setFormData({
        ...formData,
        [name]: cleanedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleBuscar = () => {
    if (busqueda.trim()) {
      const filtered = personas.filter(persona => 
        (persona.dni && persona.dni.includes(busqueda.trim())) ||
        (persona.name && persona.name.toLowerCase().includes(busqueda.trim().toLowerCase()))
      );
      setFilteredPersonas(filtered);
    } else {
      // Mostrar todas las personas cuando no hay búsqueda
      setFilteredPersonas(personas.slice(0, 10));
    }
  };

  const seleccionarPersona = (persona) => {
    setPersonaSeleccionada(persona);
    setShowBuscador(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.monto) {
      toast.error('El monto es obligatorio');
      return;
    }
    
    // Asegurarse de que al menos hay un ID (persona o cuenta)
    if (!personaSeleccionada && !cuentaCorrienteId && !personaId) {
      toast.error('Debes seleccionar una persona o cuenta corriente');
      return;
    }
    
    setLoading(true);
    
    // Preparar datos para enviar (solo lo necesario)
    const dataToSend = { ...formData };
    
    // Añadir el ID correcto según lo que esté disponible
    if (personaSeleccionada) {
      dataToSend.persona_id = personaSeleccionada.id;
    } else if (personaId) {
      dataToSend.persona_id = personaId;
    } else if (cuentaCorrienteId) {
      dataToSend.cuenta_corriente_id = cuentaCorrienteId;
    }
    
    // Ajustar el monto según el tipo de transacción
    if (dataToSend.tipo === 'egreso' && parseFloat(dataToSend.monto) > 0) {
      // Si es egreso y el monto es positivo, convertirlo a negativo
      dataToSend.monto = -Math.abs(parseFloat(dataToSend.monto));
    } else if (dataToSend.tipo === 'ingreso' && parseFloat(dataToSend.monto) < 0) {
      // Si es ingreso y el monto es negativo, convertirlo a positivo
      dataToSend.monto = Math.abs(parseFloat(dataToSend.monto));
    } else {
      // Convertir a número
      dataToSend.monto = parseFloat(dataToSend.monto);
    }
    
    try {
      const response = await api.post('/transacciones', dataToSend);
      
      if (response.data && response.data.status === 201) {
        toast.success('Transacción agregada con éxito');
        if (onTransaccionAgregada) {
          onTransaccionAgregada(response.data);
        }
        onClose();
      } else {
        toast.error(response.data?.message || 'Error al agregar la transacción');
      }
    } catch (error) {
      console.error('Error al agregar transacción:', error);
      toast.error(error.response?.data?.message || 'Error al agregar la transacción');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Agregar Transacción
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido del modal */}
          <form onSubmit={handleSubmit}>
            {/* Buscador de personas (solo si es necesario) */}
            {showBuscador && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar persona
                </label>
                <div className="relative mb-2 flex">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Nombre, apellido o DNI"
                    className="w-full p-1 pl-9 border border-gray-300 rounded-l-[6px]"
                  />
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={handleBuscar}
                    className="px-3 py-1 bg-blue-500 text-white rounded-r-[6px] hover:bg-blue-600"
                  >
                    Buscar
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {loading ? (
                  <div className="mt-2 text-center py-4">
                    Cargando personas...
                  </div>
                ) : filteredPersonas.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {filteredPersonas.map((persona) => (
                      <div 
                        key={persona.id} 
                        className="p-2 hover:bg-gray-50 cursor-pointer flex items-center border-b last:border-b-0"
                        onClick={() => seleccionarPersona(persona)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{persona.name}</p>
                          <p className="text-sm text-gray-500">DNI: {persona.dni}</p>
                        </div>
                        <button 
                          type="button"
                          className="text-blue-500 hover:text-blue-600 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            seleccionarPersona(persona);
                          }}
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No se encontraron resultados</p>
                )}
              </div>
            )}

            {/* Si hay una persona seleccionada o se pasó directamente, mostrar info */}
            {(personaSeleccionada || personaId || cuentaCorrienteId) && !showBuscador && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                {personaSeleccionada ? (
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <UserCircle className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">{personaSeleccionada.name}</p>
                      <p className="text-sm text-gray-500">DNI: {personaSeleccionada.dni}</p>
                    </div>
                    <button
                      type="button"
                      className="ml-auto text-blue-500"
                      onClick={() => {
                        setShowBuscador(true);
                        setPersonaSeleccionada(null);
                      }}
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">
                    {cuentaCorrienteId ? 
                      `Cuenta Corriente #${cuentaCorrienteId}` : 
                      personaId ? `Persona ID: ${personaId}` : ''}
                  </p>
                )}
              </div>
            )}

            {/* Formulario de transacción */}
            <div className="space-y-4">
              {/* Tipo de transacción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de transacción
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-1 text-sm border border-gray-300 rounded-[6px] shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                  <option value="seña">Seña</option>
                  <option value="turno">Turno</option>
                  <option value="pago">Pago</option>
                  <option value="deuda">Deuda</option>
                  <option value="saldo">Saldo</option>
                </select>
              </div>

              {/* Método de pago */}
              <div>
                <Label className="text-gray-700">Método de pago</Label>
                <RadioGroup
                  value={formData.metodo_pago}
                  onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="efectivo" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-1 cursor-pointer">
                      <Banknote className="h-4 w-4" />
                      Efectivo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transferencia" id="transfer" />
                    <Label htmlFor="transfer" className="flex items-center gap-1 cursor-pointer">
                      <ArrowDownToLine className="h-4 w-4" />
                      Transferencia
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tarjeta" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-1 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Tarjeta
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto {formData.tipo === 'egreso' ? '(se guardará como negativo)' : ''}
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
                    className="block w-full pl-10 pr-3 py-1 text-sm rounded-[6px] border border-gray-300  shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tipo === 'ingreso' 
                    ? 'Los montos de ingresos se guardarán como valores positivos' 
                    : 'Los montos de egresos se guardarán como valores negativos'}
                </p>
              </div>

              {/* Descripción */}
              <div>
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
                    placeholder="Descripción de la transacción"
                    className="block w-full pl-10 pr-3 py-1 rounded-[6px] text-sm border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[6px] shadow-sm hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-[6px] shadow-sm hover:bg-blue-700 focus:outline-none"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarTransaccionModal;
