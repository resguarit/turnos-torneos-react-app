import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { History, Lock, ChevronDown, Banknote, ArrowDownToLine, CreditCard, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchComponent from './SearchComponent';
import ModalTransacciones from './ModalTransacciones';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { formatearFechaCorta, formatearHora } from '@/utils/dateUtils';

const HistorialContent = ({ 
  handleSearch, 
  handleClearSearch, 
  searchFechaDesde, 
  searchFechaHasta, 
  setSearchFechaDesde, 
  setSearchFechaHasta, 
  searchDni, 
  setSearchDni,
  loadingCierres,
  cashClosings,
  pageCierres,
  totalPagesCierres,
  handlePageCierresChange
}) => {
  const [showModalTransacciones, setShowModalTransacciones] = useState(false);
  const [transacciones, setTransacciones] = useState([]);
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);

  const handleVerTransacciones = async (cajaId) => {
    setLoadingTransacciones(true);
    setCajaSeleccionada(cajaId);
    try {
      const response = await api.get(`/transacciones/caja/${cajaId}`);
      if (response.data.success) {
        setTransacciones(response.data.transacciones);
        setShowModalTransacciones(true);
      }
    } catch (error) {
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoadingTransacciones(false);
    }
  };

  return (
    <>
      <Card className="mt-4 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cierres de Caja
          </CardTitle>
          <CardDescription>Registro de todos los cierres de caja anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchComponent 
            handleSearch={handleSearch} 
            handleClearSearch={handleClearSearch} 
            searchFechaDesde={searchFechaDesde} 
            searchFechaHasta={searchFechaHasta} 
            setSearchFechaDesde={setSearchFechaDesde} 
            setSearchFechaHasta={setSearchFechaHasta} 
            searchDni={searchDni} 
            setSearchDni={setSearchDni} 
          />
          {loadingCierres ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !cashClosings || cashClosings.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay cierres de caja registrados
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cashClosings.map((cierre) => (
                  <Collapsible key={cierre.id} className="border rounded-lg">
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">
                          Cierre del {formatearFechaCorta(cierre.fecha_cierre)} {formatearHora(cierre.fecha_cierre)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">${parseFloat(cierre.balance_total || 0).toFixed(2)}</span>
                        <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0 border-t">
                      <div className="grid gap-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Operador:</span>
                          <span>{cierre.operador?.name || 'No especificado'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Balance total:</span>
                          <span>${parseFloat(cierre.balance_total || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Efectivo en sistema:</span>
                          <span>${parseFloat(cierre.efectivo_en_sistema || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Efectivo contado:</span>
                          <span>${parseFloat(cierre.efectivo_contado || 0).toFixed(2)}</span>
                        </div>
                        {typeof cierre.diferencia === 'number' && (
                          <div className="flex justify-between text-sm font-medium">
                            <span
                              className={
                                cierre.diferencia > 0 ? "text-green-600" : cierre.diferencia < 0 ? "text-red-600" : ""
                              }
                            >
                              {cierre.diferencia > 0 ? "Sobrante:" : cierre.diferencia < 0 ? "Faltante:" : "Diferencia:"}
                            </span>
                            <span
                              className={
                                cierre.diferencia > 0 ? "text-green-600" : cierre.diferencia < 0 ? "text-red-600" : ""
                              }
                            >
                              ${Math.abs(cierre.diferencia).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total pagos electrónicos:</span>
                          <span>${(
                            (cierre.resumen_pagos?.transferencia || 0) + 
                            (cierre.resumen_pagos?.tarjeta || 0) + 
                            (cierre.resumen_pagos?.mercadopago || 0)
                          ).toFixed(2)}</span>
                        </div>
                        {typeof cierre.diferencia === 'number' && cierre.diferencia !== 0 && (
                          <div className="mt-2 mb-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <span>Nota: La diferencia representa solo la variación entre el efectivo físico contado y el esperado según el sistema.</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Desglose por método de pago:</h4>
                        <div className="grid gap-1 text-sm">
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              <Banknote className="h-4 w-4" /> Efectivo:
                            </span>
                            <span>${cierre.resumen_pagos?.efectivo?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              <ArrowDownToLine className="h-4 w-4" /> Transferencias:
                            </span>
                            <span>${cierre.resumen_pagos?.transferencia?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" /> Tarjetas:
                            </span>
                            <span>${cierre.resumen_pagos?.tarjeta?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" /> Mercado Pago:
                            </span>
                            <span>${cierre.resumen_pagos?.mercadopago?.toFixed(2) || '0.00'}</span>
                          </div>
                          {cierre.resumen_pagos?.gastos > 0 && (
                            <div className="flex justify-between border-t pt-1 mt-1">
                              <span className="flex items-center gap-1 font-medium text-red-600">
                                Gastos operativos:
                              </span>
                              <span className="text-red-600">-${cierre.resumen_pagos?.gastos?.toFixed(2) || '0.00'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {cierre.observaciones && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Observaciones:</h4>
                          <p className="text-sm text-gray-600">{cierre.observaciones}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <Button
                          onClick={() => handleVerTransacciones(cierre.id)}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Ver Transacciones
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
              
              {totalPagesCierres > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => handlePageCierresChange(pageCierres - 1)}
                    disabled={pageCierres === 1 || loadingCierres}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span>Página {pageCierres} de {totalPagesCierres}</span>
                  <button
                    onClick={() => handlePageCierresChange(pageCierres + 1)}
                    disabled={pageCierres === totalPagesCierres || loadingCierres}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ModalTransacciones
        showModal={showModalTransacciones}
        setShowModal={setShowModalTransacciones}
        transacciones={transacciones}
        loading={loadingTransacciones}
      />
    </>
  );
};

export default HistorialContent;
