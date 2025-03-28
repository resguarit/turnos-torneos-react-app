import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Unlock, History } from "lucide-react";
import HistorialContent from './HistorialContent';

const AperturaCaja = ({ 
  saldoInicial, 
  setSaldoInicial, 
  abrirCaja, 
  loading, 
  showHistorialCierres, 
  setShowHistorialCierres, 
  setPageCierres, 
  fetchCierres,
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
}) => (
  <>
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
      <p className="text-sm text-gray-500 mt-1">
        Puede abrir la caja con saldo inicial 0
      </p>
    </div>

    <Button
      onClick={() => {
        setShowHistorialCierres(!showHistorialCierres);
        if (!showHistorialCierres) {
          setPageCierres(1);
          fetchCierres();
        }
      }}
      className="w-full mt-8 bg-gray-600 hover:bg-gray-700 text-white rounded-md py-6 text-lg transition-colors flex items-center justify-center gap-2"
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
);

export default AperturaCaja;
