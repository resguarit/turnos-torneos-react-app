import React, { useState, useEffect } from 'react';
import { Search, Eraser, UserCircle, Calendar, CreditCard, DollarSign, ArrowUpDown, FileText, PlusCircle, Banknote, ArrowDownToLine, CalendarDays, Plus, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BtnLoading from '@/components/BtnLoading';
import { useLocation } from 'react-router-dom';
import AgregarTransaccionModal from '@/components/AgregarTransaccionModal';
import { decryptRole } from '@/lib/getRole';
import { formatearFechaCorta, formatearHora } from '@/utils/dateUtils';

const MontoInput = React.memo(({ value, onChange, label, placeholder }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md p-2"
      />
    </div>
  );
});

const PestanaCuentasCorrientes = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dniParam = queryParams.get('dni');

  // Estado general
  const [activeTab, setActiveTab] = useState('cuentas');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(dniParam || '');
  const [clear, setClear] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(false);

  // Estado para cuentas corrientes
  const [cuentasCorrientes, setCuentasCorrientes] = useState([]);
  
  // Estado para transacciones
  const [transacciones, setTransacciones] = useState([]);

  // Nuevo estado para el modal
  const [showTransaccionModal, setShowTransaccionModal] = useState(false);
  const [selectedCuentaId, setSelectedCuentaId] = useState(null);

  // Agregar nuevos estados para filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const userRoleEncrypted = localStorage.getItem('user_role');
    const userRole = decryptRole(userRoleEncrypted);
    setUserRole(userRole);
  }, []);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (activeTab === 'cuentas') {
      fetchCuentasCorrientes();
    } else {
      fetchTransacciones();
    }
  }, [activeTab, page, clear, triggerSearch]);

  const fetchCuentasCorrientes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cuentas-corrientes', {
        params: {
          page,
          limit: 10,
          sortBy: 'created_at',
          order: 'desc',
          searchTerm: searchTerm,
          searchType: 'dni'
        }
      });
      
      if (response.data && response.data.cuentas_corrientes) {
        setCuentasCorrientes(response.data.cuentas_corrientes.data);
        setTotalPages(response.data.totalPages || response.data.cuentas_corrientes.last_page || 1);
      }
    } catch (error) {
      console.error('Error al cargar cuentas corrientes:', error);
      toast.error('Error al cargar las cuentas corrientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransacciones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transacciones', {
        params: {
          page,
          limit: 10,
          sortBy: 'created_at',
          order: 'desc',
          searchTerm: searchTerm,
          searchType: 'dni',
          startDate,
          endDate,
          metodoPago,
          tipo: tipoTransaccion
        }
      });
      
      if (response.data && response.data.transacciones) {
        setTransacciones(response.data.transacciones.data || response.data.transacciones);
        setTotalPages(response.data.totalPages || response.data.transacciones.last_page || 1);
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = async (term) => {
    await setSearchTerm(term);
    setPage(1);
    setTriggerSearch(!triggerSearch);
  };

  const handleClearSearch = async () => {
    await setSearchTerm('');
    setPage(1);
    if (activeTab === 'transacciones') {
      clearFilters();
    } else {
      setTriggerSearch(!triggerSearch);
    }
  };

  const formatDate = (dateString) => {
    return `${formatearFechaCorta(dateString)} ${formatearHora(dateString)}`;
  };

  const formatMonto = (monto) => {
    // Convertir a número para asegurar que se formatea correctamente
    const montoNum = parseFloat(monto);
    
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      signDisplay: 'auto' // Esto muestra el signo tal como viene
    }).format(montoNum);
  };

  const getTipoTransaccionLabel = (tipo) => {
    const labels = {
      'ingreso': ['Ingreso', 'bg-green-100 text-green-800'],
      'egreso': ['Egreso', 'bg-red-100 text-red-800'],
      'seña': ['Seña', 'bg-blue-100 text-blue-800'],
      'turno': ['Turno', 'bg-purple-100 text-purple-800'],
      'pago': ['Pago', 'bg-indigo-100 text-indigo-800'],
      'deuda': ['Deuda', 'bg-orange-100 text-orange-800'],
      'devolucion': ['Devolución', 'bg-yellow-100 text-yellow-800'],
      'saldo_inicial': ['Saldo Inicial', 'bg-gray-100 text-gray-800']
    };

    const [label, classes] = labels[tipo] || [tipo, 'bg-gray-100 text-gray-800'];
    return <span className={`px-2 py-1 rounded-full ${classes} text-xs font-medium capitalize`}>{label}</span>;
  };

  const getMetodoPagoLabel = (metodoPago) => {
    if (!metodoPago) {
      // Para transacciones que no requieren método de pago (como devoluciones automáticas o cargos de turno)
      return <span className="text-gray-400 italic">No requiere método de pago</span>;
    }
    
    const labels = {
      'efectivo': ['Efectivo', <Banknote className="h-4 w-4" />],
      'transferencia': ['Transferencia', <ArrowDownToLine className="h-4 w-4" />],
      'tarjeta': ['Tarjeta', <CreditCard className="h-4 w-4" />],
      'mercadopago': ['MercadoPago', <CreditCard className="h-4 w-4" />]
    };

    const [label, icon] = labels[metodoPago.nombre.toLowerCase()] || [metodoPago.nombre, null];
    return (
      <div className="flex items-center gap-1 text-gray-600">
        {icon}
        <span className="font-medium">Método de pago:</span>
        <span>{label}</span>
      </div>
    );
  };

  const getTransactionDetails = (transaccion) => {
    const details = [];

    // Agregar detalles según el tipo de transacción
    if (transaccion.tipo === 'turno') {
      details.push(
        <div key="turno" className="flex items-center space-x-2 text-gray-600">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Turno:</span>
          <span>
            {transaccion.turno ? (
              <>Cancha {transaccion.turno.cancha?.nro} - {transaccion.turno.horario?.hora_inicio}</>
            ) : 'Turno no disponible'}
          </span>
        </div>
      );
    }

    // Agregar información de la caja si existe
    if (transaccion.caja_id) {
      details.push(
        <div key="caja" className="flex items-center space-x-2 text-gray-600">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Caja:</span>
          <span>#{transaccion.caja_id}</span>
          {transaccion.caja?.empleado && (
            <span className="text-gray-500">
              (Operador: {transaccion.caja.empleado.name})
            </span>
          )}
        </div>
      );
    }

    // Agregar información de la cuenta corriente si existe
    if (transaccion.cuenta_corriente) {
      details.push(
        <div key="cuenta" className="flex items-center space-x-2 text-gray-600">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Cliente:</span>
          <span>
            {transaccion.cuenta_corriente.persona?.name || 'Sin nombre'}
            {transaccion.cuenta_corriente.persona?.dni && ` - DNI: ${transaccion.cuenta_corriente.persona.dni}`}
          </span>
        </div>
      );
    }

    return details;
  };

  const getTransactionSource = (transaccion) => {
    if (transaccion.caja_id) {
      return (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span>Caja #{transaccion.caja_id}</span>
        </div>
      );
    }
    
    if (transaccion.cuenta_corriente_id) {
      return (
        <div className="flex items-center gap-1">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span>Cuenta Corriente #{transaccion.cuenta_corriente_id}</span>
          {transaccion.cuenta_corriente?.persona && (
            <span className="text-gray-500">
              ({transaccion.cuenta_corriente.persona.name} - DNI: {transaccion.cuenta_corriente.persona.dni})
            </span>
          )}
        </div>
      );
    }

    if (transaccion.turno_id) {
      return (
        <div className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span>Turno #{transaccion.turno_id}</span>
        </div>
      );
    }

    return <span className="text-gray-400">Sin fuente asociada</span>;
  };

  const handleOpenTransaccionModal = (cuentaId = null) => {
    setSelectedCuentaId(cuentaId);
    setShowTransaccionModal(true);
  };
  
  const handleTransaccionAgregada = () => {
    // Recargar datos después de agregar una transacción
    if (activeTab === 'cuentas') {
      fetchCuentasCorrientes();
    } else {
      fetchTransacciones();
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setMetodoPago('');
    setTipoTransaccion('');
    setSearchTerm('');
    setPage(1);
    fetchTransacciones();
  };

  // Modificar el FiltersPanel para asegurar que se resetea la página
  const FiltersPanel = () => (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transacción</label>
          <select
            value={tipoTransaccion}
            onChange={(e) => setTipoTransaccion(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Todos</option>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
            <option value="seña">Seña</option>
            <option value="turno">Turno</option>
            <option value="pago">Pago</option>
            <option value="devolucion">Devolución</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Limpiar Filtros
        </button>
        <button
          onClick={() => {
            setPage(1);
            fetchTransacciones();
            setShowFilters(false);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );

  // Modificar el SearchSection para simplificar la búsqueda
  const SearchSection = () => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    useEffect(() => {
      setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    return (
      <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex w-full gap-2">
          <input
            type="text"
            placeholder="Buscar por DNI"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full py-1 pl-8 text-sm sm:text-base border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2 top-2 h-5 w-5 text-gray-400" />
          
          {activeTab === 'transacciones' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-blue-600 border border-blue-600 rounded-[10px] shadow hover:bg-white hover:text-blue-600"
            >
              <span>Filtros</span>
            </button>
          )}

          <button
            onClick={() => handleSearch(localSearchTerm)}
            className="flex items-center justify-center px-3 py-2 text-sm text-white bg-green-600 border border-green-600 rounded-[6px] shadow hover:bg-white hover:text-green-600"
          >
            <Search className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:block">Buscar</span>
          </button>

          <button
            onClick={handleClearSearch}
            className="flex items-center justify-center px-3 py-2 text-sm text-white bg-red-600 border border-red-600 rounded-[6px] shadow hover:bg-white hover:text-red-600"
          >
            <Eraser className="w-5 h-5 sm:hidden"/>
            <span className="hidden sm:block">Limpiar</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'cuentas'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('cuentas')}
        >
          <span className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Cuentas Corrientes
          </span>
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'transacciones'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('transacciones')}
        >
          <span className="flex items-center">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Transacciones
          </span>
        </button>
      </div>

      {/* Buscador */}
      <SearchSection />

      {/* Botón para añadir transacción en la pestaña de transacciones */}
      {!loading && activeTab === 'transacciones' && isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => handleOpenTransaccionModal()}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Nueva Transacción
          </button>
        </div>
      )}

      {/* Filtros */}
      {showFilters && <FiltersPanel />}

      {/* Loading */}
      {loading && (
        <div className='flex justify-center items-center h-[50vh]'>
          <BtnLoading />
        </div>
      )}

      {/* Listado de Cuentas Corrientes */}
      {!loading && activeTab === 'cuentas' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {cuentasCorrientes.length === 0 ? (
              <li className="p-6 text-center text-gray-500">
                No se encontraron cuentas corrientes.
              </li>
            ) : (
              cuentasCorrientes.map((cuenta) => (
                <li key={cuenta.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <div className="p-6">
                    {/* Cabecera de la Cuenta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Cuenta #{cuenta.id}
                          </h3>
                          <span className="text-sm text-gray-500">Cliente: {cuenta.persona?.name || 'Sin nombre'}</span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold">
                        <span className={cuenta.saldo >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatMonto(cuenta.saldo || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Información de la Cuenta */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">DNI Cliente: </span>
                        <span>{cuenta.persona?.dni || 'Sin DNI'}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">Fecha de creación: </span>
                        <span>{formatDate(cuenta.created_at)}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">Transacciones: </span>
                        <span>{cuenta.transacciones_count || 0}</span>
                      </div>
                    </div>

                    {/* Botón para agregar transacción en cuentas corrientes */}
                    {isAdmin && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleOpenTransaccionModal(cuenta.id)}
                          className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          <PlusCircle className="mr-1 h-4 w-4" />
                          Agregar Transacción
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Listado de Transacciones */}
      {!loading && activeTab === 'transacciones' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {transacciones.length === 0 ? (
              <li className="p-6 text-center text-gray-500">
                No se encontraron transacciones.
              </li>
            ) : (
              transacciones.map((transaccion) => (
                <li key={transaccion.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <div className="p-6">
                    {/* Cabecera de la Transacción */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Transacción #{transaccion.id}
                            </h3>
                            {getTipoTransaccionLabel(transaccion.tipo)}
                          </div>
                          {getTransactionSource(transaccion)}
                        </div>
                      </div>

                      <div className="text-2xl font-bold">
                        <span className={parseFloat(transaccion.monto) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatMonto(transaccion.monto)}
                        </span>
                      </div>
                    </div>

                    {/* Información detallada de la Transacción */}
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      {/* Fecha y Método de Pago */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Fecha:</span>
                          <span>{formatDate(transaccion.created_at)}</span>
                        </div>
                        {getMetodoPagoLabel(transaccion.metodo_pago)}
                      </div>

                      {/* Descripción */}
                      <div className="flex items-start space-x-2 text-gray-600">
                        <FileText className="h-4 w-4 text-gray-400 mt-1" />
                        <span className="font-medium">Descripción:</span>
                        <span className="flex-1">{transaccion.descripcion || 'Sin descripción'}</span>
                      </div>

                      {/* Detalles adicionales */}
                      <div className="space-y-2 border-t pt-2 mt-2">
                        {getTransactionDetails(transaccion)}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Paginación */}
      {!loading && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal para agregar transacción */}
      <AgregarTransaccionModal
        isOpen={showTransaccionModal}
        onClose={() => setShowTransaccionModal(false)}
        cuentaCorrienteId={selectedCuentaId}
        onTransaccionAgregada={handleTransaccionAgregada}
      />

      
    </div>
  );
};

export default PestanaCuentasCorrientes;
