import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/axiosConfig';
import { DollarSign, Lock, Unlock, PlusCircle, MinusCircle, ClipboardList, CreditCard, Banknote, ArrowDownToLine } from "lucide-react";
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

const PestanaCaja = () => {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [conteoEfectivo, setConteoEfectivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showClosingDialog, setShowClosingDialog] = useState(false);
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

  useEffect(() => {
    verificarCajaAbierta();
  }, []);

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
    if (!saldoInicial || parseFloat(saldoInicial) <= 0) {
      toast.error('Ingrese un saldo inicial válido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/apertura-caja', {
        saldo_inicial: parseFloat(saldoInicial)
      });

      if (response.data.status === 200) {
        setCajaAbierta(true);
        verificarCajaAbierta(); // Actualizar datos
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
        verificarCajaAbierta(); // Actualizar datos
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
        monto: -parseFloat(amount), // Monto negativo para retiros
        tipo: 'egreso',
        descripcion: description || 'Retiro de caja',
        metodo_pago: 'efectivo' // Siempre efectivo para retiros
      });

      if (response.data.success) {
        verificarCajaAbierta(); // Actualizar datos
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
      toast.error('Ingrese un conteo de efectivo válido');
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
    setSaldoInicial('');
    setConteoEfectivo('');
    setAmount('');
    setDescription('');
    setPaymentMethod('efectivo');
    setTransactions([]);
    setBalanceTotal(0);
    setEfectivoEnCaja(0);
    setOperador('');
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
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${cajaAbierta ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="font-medium">{cajaAbierta ? "Caja Abierta" : "Caja Cerrada"}</span>
                  {cajaAbierta && <span className="text-sm text-gray-500">Operador: {operador}</span>}
                </div>

                {cajaAbierta && (
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">Balance Total</span>
                    <span className="text-2xl font-bold">${balanceTotal.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">Efectivo en caja: ${efectivoEnCaja.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {!cajaAbierta ? (
                <div className="w-full md:w-1/3">
                  <Label htmlFor="initialAmount" className="text-gray-700">Monto Inicial</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="initialAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={saldoInicial}
                      onChange={(e) => setSaldoInicial(e.target.value)}
                      placeholder="0.00"
                      disabled={loading}
                      className="rounded-md border-gray-300"
                    />
                    <Button 
                      onClick={abrirCaja} 
                      disabled={loading}
                      className="bg-gray-600 hover:bg-gray-700 text-white rounded-md px-4 py-2 transition-colors"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Abrir Caja
                    </Button>
                  </div>
                </div>
              ) : (
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
                        <CardTitle className="text-lg">Registrar Pago</CardTitle>
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
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mercadopago" id="mercadopago" />
                              <Label htmlFor="mercadopago" className="flex items-center gap-1 cursor-pointer">
                                <CreditCard className="h-4 w-4" />
                                MercadoPago
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
                          Registrar Pago
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

              {cajaAbierta && !initialLoading && (
                        <CardFooter>
                          <Button 
                            onClick={handleClose} 
                            className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Cerrar Caja
                          </Button>
                        </CardFooter>
                      )}

              {cajaAbierta && transactions.length > 0 && (
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
              )}
            </>
          )}
        </CardContent>

        
      </Card>

      <Dialog open={showClosingDialog} onOpenChange={setShowClosingDialog}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
            <DialogDescription>Confirme el cierre de caja y el conteo final de efectivo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span>Balance total:</span>
                <span className="font-bold">${balanceTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Efectivo en caja:</span>
                <span className="font-bold">${efectivoEnCaja.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pagos electrónicos:</span>
                <span className="font-bold">${(balanceTotal - efectivoEnCaja).toFixed(2)}</span>
              </div>
            </div>

            <Alert>
              <AlertTitle>Conteo de efectivo físico</AlertTitle>
              <AlertDescription>
                Solo debe contar el dinero físico (efectivo) en la caja.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="closingCount">Conteo de efectivo</Label>
              <Input
                id="closingCount"
                type="number"
                min="0"
                step="0.01"
                value={conteoEfectivo}
                onChange={(e) => setConteoEfectivo(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {conteoEfectivo && parseFloat(conteoEfectivo) !== efectivoEnCaja && (
              <Alert variant={parseFloat(conteoEfectivo) > efectivoEnCaja ? "destructive" : "default"}>
                <AlertTitle>
                  {parseFloat(conteoEfectivo) > efectivoEnCaja
                    ? `Sobrante: $${(parseFloat(conteoEfectivo) - efectivoEnCaja).toFixed(2)}`
                    : `Faltante: $${(efectivoEnCaja - parseFloat(conteoEfectivo)).toFixed(2)}`}
                </AlertTitle>
                <AlertDescription>
                  {parseFloat(conteoEfectivo) > efectivoEnCaja
                    ? "Hay más efectivo del esperado. Verifique las transacciones."
                    : "Hay menos efectivo del esperado. Verifique las transacciones."}
                </AlertDescription>
              </Alert>
            )}

            <div className="border rounded-md p-3 space-y-2">
              <h4 className="font-medium">Resumen por método de pago:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Banknote className="h-4 w-4" /> Efectivo:
                  </span>
                  <span>${resumenPagos.efectivo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <ArrowDownToLine className="h-4 w-4" /> Transferencias:
                  </span>
                  <span>${resumenPagos.transferencia.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" /> Tarjetas:
                  </span>
                  <span>${resumenPagos.tarjeta.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowClosingDialog(false)}
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 rounded-md transition-colors"
            >
              Cancelar
            </Button>
            <Button 
              onClick={cerrarCaja} 
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Confirmar Cierre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PestanaCaja;
