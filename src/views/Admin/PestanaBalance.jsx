import React, { useState } from 'react';
import { Calendar, DollarSign, Search, RefreshCcw, BarChart3, ArrowDown, ArrowUp, Ban } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { formatearFechaCorta } from '@/utils/dateUtils';

const PestanaBalance = () => {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fechaDesdeFormateada, setFechaDesdeFormateada] = useState('');
  const [fechaHastaFormateada, setFechaHastaFormateada] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [showBalance, setShowBalance] = useState(false);

  // Función para formatear fechas con formato dd/mm/yyyy sin conversión de zona horaria
  const formatearFechaSeleccionada = (fechaStr) => {
    if (!fechaStr) return '';
    
    // Extraer componentes de la fecha del string ISO (YYYY-MM-DD)
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    
    // Formatear como DD/MM/YYYY
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const fetchBalance = async () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Seleccione fechas desde y hasta');
      return;
    }

    // Guardar las fechas formateadas para mostrarlas en el título
    setFechaDesdeFormateada(formatearFechaSeleccionada(fechaDesde));
    setFechaHastaFormateada(formatearFechaSeleccionada(fechaHasta));

    setLoading(true);
    try {
      const response = await api.get('/balance', {
        params: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta
        }
      });

      if (response.data.success) {
        setBalanceData(response.data.balance);
        setShowBalance(true);
      }
    } catch (error) {
      console.error('Error al obtener balance:', error);
      toast.error(error.response?.data?.message || 'Error al obtener balance');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setFechaDesdeFormateada('');
    setFechaHastaFormateada('');
    setShowBalance(false);
    setBalanceData(null);
  };

  const handleFechaDesdeChange = (e) => {
    setFechaDesde(e.target.value);
  };

  const handleFechaHastaChange = (e) => {
    setFechaHasta(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-6 w-6" />
            Balance Financiero
          </CardTitle>
          <CardDescription className="text-gray-500">
            Consulte el balance financiero de la empresa en un rango de fechas específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="fechaDesde" className="font-medium text-sm text-gray-700">Fecha desde</label>
              <div className="relative mt-1">
                <input
                  id="fechaDesde"
                  type="date"
                  value={fechaDesde}
                  onChange={handleFechaDesdeChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-[6px]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fechaHasta" className="font-medium text-sm text-gray-700">Fecha hasta</label>
              <div className="relative mt-1">
                <input
                  id="fechaHasta"
                  type="date"
                  value={fechaHasta}
                  onChange={handleFechaHastaChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-[6px]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <button
              onClick={fetchBalance}
              disabled={loading || !fechaDesde || !fechaHasta}
              className="bg-gray-600 hover:bg-gray-700 text-white flex items-center rounded-[6px] px-3 py-2 transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Consultando...' : 'Consultar Balance'}
            </button>
            <button
              onClick={limpiarFiltros}
              variant="outline"
              className="border-gray-300 text-gray-700 flex items-center rounded-[6px] px-3 py-2 hover:bg-gray-100 transition-colors"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Limpiar filtros
            </button>
          </div>
        </CardContent>
      </Card>

      {showBalance && balanceData && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              Resultado del {fechaDesdeFormateada} al {fechaHastaFormateada}
            </CardTitle>
            <CardDescription>
              Resumen de ingresos, egresos y balance final
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    INGRESOS TOTALES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-700">
                    ${balanceData.ingresos_totales.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-700 flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    EGRESOS TOTALES
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-700">
                    ${balanceData.egresos_totales.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className={`${balanceData.balance_neto >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm flex items-center ${balanceData.balance_neto >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    BALANCE NETO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${balanceData.balance_neto >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                    {balanceData.balance_neto < 0 ? "-$" : "$"}{Math.abs(balanceData.balance_neto).toFixed(2)}
                    {balanceData.balance_neto < 0 && <span className="text-sm ml-1">(Pérdida)</span>}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Desglose de Ingresos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span>Turnos (pagos y señas):</span>
                    <span className="font-medium">
                      ${balanceData.desglose_ingresos.pagos_turnos.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span>Otras transacciones de ingreso:</span>
                    <span className="font-medium">${balanceData.desglose_ingresos.otras_transacciones.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Desglose de Egresos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span>Devoluciones:</span>
                    <span className="font-medium">${balanceData.desglose_egresos.devoluciones.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span>Gastos operativos:</span>
                    <span className="font-medium">${balanceData.desglose_egresos.gastos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span>Otras transacciones de egreso:</span>
                    <span className="font-medium">${balanceData.desglose_egresos.otras_transacciones.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {balanceData.desglose_gastos && balanceData.desglose_gastos.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Detalle de Gastos por Categoría</h3>
                  <div className="space-y-2">
                    {balanceData.desglose_gastos.map((gasto, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded-md">
                        <span>{gasto.tipo_gasto}:</span>
                        <span className="font-medium">${gasto.monto.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showBalance && !balanceData && (
        <div className="flex flex-col items-center justify-center py-8 px-4 border rounded-lg bg-gray-50">
          <Ban className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-700">No hay datos disponibles</h3>
          <p className="text-gray-500 text-center mt-1">
            No se encontraron transacciones para el período seleccionado
          </p>
        </div>
      )}
    </div>
  );
};

export default PestanaBalance; 