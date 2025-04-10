import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/axiosConfig';
import { DollarSign, Lock, Unlock, PlusCircle, MinusCircle, ClipboardList, CreditCard, Banknote, ArrowDownToLine, History, ChevronDown, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

// Importar componentes
import EstadoCaja from '@/components/PanelAdmin/Caja/EstadoCaja';
import AperturaCaja from '@/components/PanelAdmin/Caja/AperturaCaja';
import DialogCierreCaja from '@/components/PanelAdmin/Caja/DialogCierreCaja';
import HistorialContent from '@/components/PanelAdmin/Caja/HistorialContent';

// Componente principal
const PestanaCaja = () => {
  // Estados
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState('0');
  const [conteoEfectivo, setConteoEfectivo] = useState('0');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showClosingDialog, setShowClosingDialog] = useState(false);
  const [showHistorialCierres, setShowHistorialCierres] = useState(false);
  const [operador, setOperador] = useState('');
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [efectivoEnCaja, setEfectivoEnCaja] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cajaId, setCajaId] = useState(null);
  const [resumenPagos, setResumenPagos] = useState({
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0
  });
  const [cashClosings, setCashClosings] = useState([]);
  const [pageCierres, setPageCierres] = useState(1);
  const [totalPagesCierres, setTotalPagesCierres] = useState(1);
  const [loadingCierres, setLoadingCierres] = useState(false);
  const [searchDni, setSearchDni] = useState('');
  const [searchFechaDesde, setSearchFechaDesde] = useState('');
  const [searchFechaHasta, setSearchFechaHasta] = useState('');
  const [searchCierres, setSearchCierres] = useState(false);
  const [showMovimientos, setShowMovimientos] = useState(false);

  // Efectos
  useEffect(() => {
    verificarCajaAbierta();
  }, []);

  useEffect(() => {
    fetchCierres();
  }, [pageCierres]);

  useEffect(() => {
    fetchCierres();
  }, [searchCierres]);

  // Funciones
  const verificarCajaAbierta = async () => {
    try {
      const response = await api.get('/caja-abierta');
      if (response.data.status === 200) {
        const { caja, operador, balance_total, efectivo_en_caja, transacciones, resumen_pagos } = response.data;
        setCajaAbierta(true);
        setCajaId(caja.id);
        setOperador(operador);
        setBalanceTotal(balance_total);
        setEfectivoEnCaja(efectivo_en_caja);
        setTransactions(transacciones);
        setResumenPagos(resumen_pagos);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Error al verificar el estado de la caja');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const abrirCaja = async () => {
    if (!saldoInicial || parseFloat(saldoInicial) < 0) {
      toast.error('El saldo inicial debe ser mayor o igual a 0');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/apertura-caja', {
        saldo_inicial: parseFloat(saldoInicial)
      });

      if (response.data.status === 200) {
        setCajaAbierta(true);
        verificarCajaAbierta();
        toast.success('Caja abierta correctamente');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al abrir la caja');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/transacciones', {
        caja_id: cajaId,
        monto: parseFloat(amount),
        tipo: 'ingreso',
        descripcion: description || 'Depósito en caja',
        metodo_pago: paymentMethod
      });

      if (response.data.success) {
        verificarCajaAbierta();
        setAmount('');
        setDescription('');
        toast.success('Depósito registrado correctamente');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar el depósito');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/transacciones', {
        caja_id: cajaId,
        monto: -parseFloat(amount),
        tipo: 'egreso',
        descripcion: description || 'Retiro de caja',
        metodo_pago: 'efectivo'
      });

      if (response.data.success) {
        verificarCajaAbierta();
        setAmount('');
        setDescription('');
        toast.success('Retiro registrado correctamente');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar el retiro');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      const cajaInfo = await api.get('/caja-abierta');
      if (cajaInfo.data.status === 200) {
        setResumenPagos(cajaInfo.data.resumen_pagos);
        setShowClosingDialog(true);
      }
    } catch (error) {
      toast.error('Error al obtener información de la caja');
    }
  };

  const cerrarCaja = async () => {
    if (!conteoEfectivo || parseFloat(conteoEfectivo) < 0) {
      toast.error('El conteo de efectivo debe ser mayor o igual a 0');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/cierre-caja', {
        saldo_final: parseFloat(conteoEfectivo)
      });

      if (response.data.status === 200) {
        setCajaAbierta(false);
        setShowClosingDialog(false);
        resetearEstados();
        toast.success('Caja cerrada correctamente');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setLoading(false);
    }
  };

  const resetearEstados = () => {
    setSaldoInicial('0');
    setConteoEfectivo('0');
    setAmount('');
    setDescription('');
    setPaymentMethod('efectivo');
    setTransactions([]);
    setBalanceTotal(0);
    setEfectivoEnCaja(0);
    setOperador('');
  };

  const fetchCierres = async () => {
    setLoadingCierres(true);
    try {
      const response = await api.get('/cajas', {
        params: {
          page: pageCierres,
          limit: 5,
          sortBy: 'fecha_cierre',
          order: 'desc',
          dni: searchDni || undefined,
          fecha_desde: searchFechaDesde || undefined,
          fecha_hasta: searchFechaHasta || undefined
        }
      });
      
      if (response.data && response.data.status === 200) {
        setCashClosings(response.data.cierres || []);
        setTotalPagesCierres(response.data.totalPages || 1);
      } else {
        setCashClosings([]);
        setTotalPagesCierres(1);
      }
    } catch (error) {
      console.error('Error al cargar los cierres:', error);
      toast.error('Error al cargar el historial de cierres');
      setCashClosings([]);
      setTotalPagesCierres(1);
    } finally {
      setLoadingCierres(false);
    }
  };

  const handlePageCierresChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPagesCierres) {
      setPageCierres(newPage);
    }
  };

  const handleSearch = async (dni) => {
    await setSearchDni(dni);
    setPageCierres(1);
    setSearchCierres(!searchCierres);
  };

  const handleClearSearch = async () => {
    await setSearchDni('');
    await setSearchFechaDesde('');
    await setSearchFechaHasta('');
    setPageCierres(1);
    setSearchCierres(!searchCierres);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ToastContainer position="top-right" />
      
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-6 w-6" />
            Caja Registradora
          </CardTitle>
          <CardDescription className="text-gray-500">
            Administre los pagos y retiros de clientes, opcionalmente asociados a turnos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {initialLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <EstadoCaja 
                cajaAbierta={cajaAbierta}
                operador={operador}
                balanceTotal={balanceTotal}
                efectivoEnCaja={efectivoEnCaja}
              />

              {!cajaAbierta ? (
                <AperturaCaja 
                  saldoInicial={saldoInicial}
                  setSaldoInicial={setSaldoInicial}
                  abrirCaja={abrirCaja}
                  loading={loading}
                  showHistorialCierres={showHistorialCierres}
                  setShowHistorialCierres={setShowHistorialCierres}
                  setPageCierres={setPageCierres}
                  fetchCierres={fetchCierres}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  searchFechaDesde={searchFechaDesde}
                  searchFechaHasta={searchFechaHasta}
                  setSearchFechaDesde={setSearchFechaDesde}
                  setSearchFechaHasta={setSearchFechaHasta}
                  searchDni={searchDni}
                  setSearchDni={setSearchDni}
                  loadingCierres={loadingCierres}
                  cashClosings={cashClosings}
                  pageCierres={pageCierres}
                  totalPagesCierres={totalPagesCierres}
                  handlePageCierresChange={handlePageCierresChange}
                />
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={() => setShowMovimientos(!showMovimientos)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-md py-6 text-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="h-5 w-5" />
                      {showMovimientos ? 'Ocultar Registro de Movimientos' : 'Registrar Movimiento'}
                    </Button>

                    {showMovimientos && (
                      <Tabs defaultValue="deposit" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg gap-1">
                          <TabsTrigger 
                            value="deposit" 
                            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                          >
                            Depósito
                          </TabsTrigger>
                          <TabsTrigger 
                            value="withdrawal"
                            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                          >
                            Retiro
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="deposit">
                          <Card className="border-0 shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-lg">Registrar Depósito</CardTitle>
                              <CardDescription>Registre un pago o depósito del cliente</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor="amount" className="text-gray-700">Monto</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  placeholder="0.00"
                                  className="rounded-md border-gray-300 mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="description" className="text-gray-700">Descripción</Label>
                                <Input
                                  id="description"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  placeholder="Concepto del pago"
                                  className="rounded-md border-gray-300 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-700">Método de pago</Label>
                                <RadioGroup
                                  value={paymentMethod}
                                  onValueChange={setPaymentMethod}
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
                            </CardContent>
                            <CardFooter>
                              <Button
                                onClick={handleDeposit}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                                disabled={loading || !amount || parseFloat(amount) <= 0}
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Registrar Depósito
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>

                        <TabsContent value="withdrawal">
                          <Card className="border-0 shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-lg">Registrar Devolución</CardTitle>
                              <CardDescription>Registre una devolución o retiro al cliente</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor="withdrawalAmount" className="text-gray-700">Monto</Label>
                                <Input
                                  id="withdrawalAmount"
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  placeholder="0.00"
                                  className="rounded-md border-gray-300 mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="withdrawalDescription" className="text-gray-700">Descripción</Label>
                                <Input
                                  id="withdrawalDescription"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  placeholder="Motivo de la devolución"
                                  className="rounded-md border-gray-300 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-700">Método de pago</Label>
                                <RadioGroup
                                  value="efectivo"
                                  disabled
                                  className="flex space-x-4 mt-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="efectivo" id="cash-withdrawal" />
                                    <Label htmlFor="cash-withdrawal" className="flex items-center gap-1 cursor-pointer">
                                      <Banknote className="h-4 w-4" />
                                      Efectivo
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button
                                onClick={handleWithdrawal}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                                disabled={loading || !amount || parseFloat(amount) <= 0}
                              >
                                <MinusCircle className="h-4 w-4 mr-2" />
                                Registrar Devolución
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    )}

                    <Button 
                      onClick={handleClose} 
                      className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Cerrar Caja
                    </Button>
                  </div>
                </>
              )}

              {cajaAbierta && transactions.length > 0 && (
                <>
                  <Card className="mt-8 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Historial de Transacciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border rounded-lg gap-2"
                          >
                            <div>
                              <p className="font-medium">{transaction.descripcion}</p>
                              <p className="text-sm text-muted-foreground">{new Date(transaction.fecha).toLocaleString()}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {transaction.metodo_pago === 'efectivo' && <Banknote className="h-4 w-4" />}
                                {transaction.metodo_pago === 'transferencia' && <ArrowDownToLine className="h-4 w-4" />}
                                {transaction.metodo_pago === 'tarjeta' && <CreditCard className="h-4 w-4" />}
                                {transaction.metodo_pago === 'mercadopago' && <CreditCard className="h-4 w-4" />}
                                <span className="text-sm">
                                  {transaction.metodo_pago === 'efectivo' ? 'Efectivo' : 
                                   transaction.metodo_pago === 'transferencia' ? 'Transferencia' : 
                                   transaction.metodo_pago === 'tarjeta' ? 'Tarjeta' : 'MercadoPago'}
                                </span>
                              </div>
                            </div>
                            <div className={`font-bold ${transaction.tipo === 'deposito' ? "text-green-600" : "text-red-600"}`}>
                              {transaction.tipo === 'deposito' ? '+' : '-'}${transaction.monto.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => {
                      setShowHistorialCierres(!showHistorialCierres);
                      if (!showHistorialCierres) {
                        setPageCierres(1);
                        fetchCierres();
                      }
                    }}
                    className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md py-6 text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <History className="h-5 w-5" />
                    {showHistorialCierres ? 'Ocultar Historial de Cierres' : 'Ver Historial de Cierres'}
                  </Button>

                  {showHistorialCierres && (
                    <HistorialContent 
                      handleSearch={handleSearch}
                      handleClearSearch={handleClearSearch}
                      searchFechaDesde={searchFechaDesde}
                      searchFechaHasta={searchFechaHasta}
                      setSearchFechaDesde={setSearchFechaDesde}
                      setSearchFechaHasta={setSearchFechaHasta}
                      searchDni={searchDni}
                      setSearchDni={setSearchDni}
                      loadingCierres={loadingCierres}
                      cashClosings={cashClosings}
                      pageCierres={pageCierres}
                      totalPagesCierres={totalPagesCierres}
                      handlePageCierresChange={handlePageCierresChange}
                    />
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DialogCierreCaja 
        showClosingDialog={showClosingDialog}
        setShowClosingDialog={setShowClosingDialog}
        balanceTotal={balanceTotal}
        efectivoEnCaja={efectivoEnCaja}
        conteoEfectivo={conteoEfectivo}
        setConteoEfectivo={setConteoEfectivo}
        resumenPagos={resumenPagos}
        cerrarCaja={cerrarCaja}
        loading={loading}
      />
    </div>
  );
};

export default PestanaCaja;
