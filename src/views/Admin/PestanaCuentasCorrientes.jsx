import React, { useState, useEffect } from 'react';
import { Search, Eraser, UserCircle, Calendar, CreditCard, DollarSign, ArrowUpDown, FileText, PlusCircle } from "lucide-react";
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BtnLoading from '@/components/BtnLoading';
import { useLocation } from 'react-router-dom';
import AgregarTransaccionModal from '@/components/AgregarTransaccionModal';

const PestanaCuentasCorrientes = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dniParam = queryParams.get('dni');

  // Estado general
  const [activeTab, setActiveTab] = useState('cuentas'); // 'cuentas' o 'transacciones'
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(dniParam || '');
  const [searchType, setSearchType] = useState('dni');
  const [clear, setClear] = useState(false);

  // Estado para cuentas corrientes
  const [cuentasCorrientes, setCuentasCorrientes] = useState([]);
  
  // Estado para transacciones
  const [transacciones, setTransacciones] = useState([]);

  // Nuevo estado para el modal
  const [showTransaccionModal, setShowTransaccionModal] = useState(false);
  const [selectedCuentaId, setSelectedCuentaId] = useState(null);

  useEffect(() => {
    if (activeTab === 'cuentas') {
      fetchCuentasCorrientes();
    } else {
      fetchTransacciones();
    }
  }, [activeTab, page, clear]);

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
          searchType: searchType
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
          searchType: searchType
        }
      });
      
      if (response.data && response.data.transacciones) {
        setTransacciones(response.data.transacciones.data || response.data.transacciones);
        setTotalPages(response.data.totalPages || response.data.transacciones.last_page || 1);
      } else if (response.data && Array.isArray(response.data.data)) {
        setTransacciones(response.data.data);
        setTotalPages(response.data.totalPages || response.data.last_page || 1);
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

  const handleSearch = () => {
    if (page > 1){
      setPage(1);
    } else {
      if (activeTab === 'cuentas') {
        fetchCuentasCorrientes();
      } else {
        fetchTransacciones();
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if(page > 1){
      setPage(1);
    } else {
      setClear(prev => !prev);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
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
    switch(tipo) {
      case 'ingreso':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Ingreso</span>;
      case 'egreso':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Egreso</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{tipo}</span>;
    }
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
      <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative w-full sm:w-1/3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full text-sm sm:text-base px-2 py-1 border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {activeTab === 'cuentas' ? (
              <>
                <option value="dni">DNI Cliente</option>
                <option value="id">ID Cuenta</option>
              </>
            ) : (
              <>
                <option value="cuenta_corriente_id">ID Cuenta</option>
                <option value="tipo">Tipo</option>
                <option value="descripcion">Descripción</option>
              </>
            )}
          </select>
        </div>

        <div className="relative flex w-full gap-2">
          <input
            type="text"
            placeholder={`Buscar por ${searchType}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1 pl-8 text-sm sm:text-base border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2 top-2 h-5 w-5 text-gray-400" />
          <button
            onClick={handleSearch}
            className="flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-green-600 border border-green-600 rounded-[10px] shadow hover:bg-white hover:text-green-600"
          >
            <Search className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:block">Buscar</span>
          </button>

          <button
            onClick={handleClearSearch}
            className="flex items-center justify-center h-8 px-3 sm:px-4 text-white bg-red-600 border border-red-600 rounded-[10px] shadow hover:bg-white hover:text-red-600"
          >
            <Eraser className="w-5 h-5 sm:hidden"/>
            <span className="hidden sm:block">Limpiar</span>
          </button>
        </div>
      </div>

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

                    {/* Botón para agregar transacción */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleOpenTransaccionModal(cuenta.id)}
                        className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Agregar Transacción
                      </button>
                    </div>
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
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Transacción #{transaccion.id}
                            </h3>
                            {getTipoTransaccionLabel(transaccion.tipo)}
                          </div>
                          <div className="flex flex-row text-sm text-gray-500">
                            <span>Cuenta corriente: #{transaccion.cuenta_corriente_id}, {transaccion.cuenta_corriente.persona.name} - DNI: {transaccion.cuenta_corriente.persona.dni}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-2xl font-bold">
                        <span className={parseFloat(transaccion.monto) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatMonto(transaccion.monto)}
                        </span>
                      </div>
                    </div>

                    {/* Información de la Transacción */}
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">Fecha: </span>
                        <span>{formatDate(transaccion.created_at)}</span>
                      </div>

                      <div className="flex items-start space-x-2 text-gray-600">
                        <FileText className="h-4 w-4 text-gray-400 mt-1" />
                        <span className="font-bold">Descripción: </span>
                        <span className="flex-1">{transaccion.descripcion || 'Sin descripción'}</span>
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

      {/* Botón para añadir transacción en la pestaña de transacciones */}
      {!loading && activeTab === 'transacciones' && (
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
