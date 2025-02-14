import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, Clock, User, CreditCard } from "lucide-react";
import { format, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

const ReservationModal = ({ showModal, confirmLoading, onConfirm, onCancel, selectedDate, selectedTimeName, selectedCourt, user }) => {
  const señaPercentage = selectedCourt ? (selectedCourt.seña / selectedCourt.precio_por_hora) * 100 : 0;

  // Parse the date from "dd/MM/yyyy" format
  const parsedDate = parse(selectedDate, "dd/MM/yyyy", new Date());

  return (
    <Dialog open={showModal} onClose={onCancel}>
      <DialogContent className="max-w-[250px] lg:max-w-[400px] p-0 rounded-2xl">
        <div className="md:p-6 p-4 space-y-3 md:space-y-6 ">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl font-semibold text-center">
              Detalles de la Reserva
            </DialogTitle>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              Rock & Gol 520 esq. 20
            </div>
          </DialogHeader>
  
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Fecha y Hora</p>
                  <div className="flex full justify-between items-center">
                    <p className="font-medium text-xs md:text-sm capitalize">
                      {isValid(parsedDate) ? format(parsedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : 'Fecha inválida'}
                    </p>
                    <p className="font-medium text-xs md:text-sm"> {selectedTimeName}</p>
                  </div>
                </div>
              </div>
  
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Duración y Cancha</p>
                  <div className="flex w-full justify-between items-center">
                    <p className="font-medium text-xs md:text-sm">60 min </p>
                    <p className="font-medium text-xs md:text-sm">Cancha {selectedCourt.nro} - {selectedCourt.tipo} </p>
                  </div>
                </div>
              </div>
            </div>
  
            {user && (
              <div className="pt-3 md:pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Reservado por</p>
                    <div className="flex justify-between">
                      <p className="font-medium text-xs md:text-sm">{user.name}</p>
                      <p className="text-gray-500 text-xs md:text-sm">DNI: {user.dni}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
  
            <div className="pt-3 md:pt-4 border-t">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Resumen de pago</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <p className="text-xs md:text-sm">Total</p>
                      <p className="font-medium text-xs md:text-sm">${selectedCourt.precio_por_hora}</p>
                    </div>
                    
                    <div className="flex justify-between text-naranja">
                      <p className="text-xs md:text-sm">Seña ({señaPercentage.toFixed(0)}%)</p>
                      <p className="font-medium text-xs md:text-sm">${selectedCourt?.seña}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="space-y-3">
            <button 
              className="text-sm md:text-base w-full bg-naranja hover:bg-naranja/90 text-white rounded-[10px] py-2"
              onClick={onConfirm}
              disabled={confirmLoading}
            >
              {confirmLoading ? 'Cargando...' : 'Confirmar Reserva'}
            </button>
            <button 
              variant="outline"
              className=" text-sm md:text-base w-full rounded-[10px] py-2 border border-black "
              onClick={onCancel}
              disabled={confirmLoading}
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;