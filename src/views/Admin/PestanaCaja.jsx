import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PestanaCaja = () => {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [conteoEfectivo, setConteoEfectivo] = useState('');

  const abrirCaja = () => {
    if (!saldoInicial || parseFloat(saldoInicial) <= 0) {
      toast.error('Ingrese un saldo inicial válido');
      return;
    }
    setCajaAbierta(true);
    toast.success('Caja abierta con saldo inicial');
  };

  const cerrarCaja = () => {
    if (!conteoEfectivo || parseFloat(conteoEfectivo) < 0) {
      toast.error('Ingrese un conteo de efectivo válido');
      return;
    }
    setCajaAbierta(false);
    toast.success('Caja cerrada');
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 p-4 bg-white shadow-md rounded-lg">
      <ToastContainer position="top-right" />

      <h2 className="text-2xl font-bold mb-4">Caja Registradora</h2>

      <div className="flex justify-between items-center mb-4">
        <span className={`font-medium ${cajaAbierta ? 'text-green-600' : 'text-red-600'}`}>
          {cajaAbierta ? 'Caja Abierta' : 'Caja Cerrada'}
        </span>
        <button
          onClick={cajaAbierta ? cerrarCaja : abrirCaja}
          className={`px-4 py-2 rounded-md text-white ${cajaAbierta ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {cajaAbierta ? 'Cerrar Caja' : 'Abrir Caja'}
        </button>
      </div>

      {!cajaAbierta ? (
        <div>
          <h3 className="text-xl font-semibold mb-2">Abrir Caja</h3>
          <input
            type="number"
            placeholder="Saldo Inicial"
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          />
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-2">Cerrar Caja</h3>
          <input
            type="number"
            placeholder="Conteo de Efectivo"
            value={conteoEfectivo}
            onChange={(e) => setConteoEfectivo(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          />
        </div>
      )}
    </div>
  );
};

export default PestanaCaja;
