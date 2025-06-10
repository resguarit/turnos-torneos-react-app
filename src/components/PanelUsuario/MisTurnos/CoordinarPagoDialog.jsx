import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, CircleAlert } from "lucide-react";
import { useConfiguration } from '@/context/ConfigurationContext';

const CoordinarPagoDialog = ({ showPaymentModal, setShowPaymentModal, turno, handleWhatsAppRedirect }) => {
  const { config, isLoading: isLoadingConfig } = useConfiguration();
  
  return (
    <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <DialogContent className="w-full max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Coordinar Pago de Seña</DialogTitle>
          <DialogDescription className="pt-4 space-y-4">
            <div className="flex gap-2">
              <CircleAlert className="size-5 " />
              <p className="text-sm">
                <span className="font-bold">Aviso:</span> La coordinación de pago se realiza a través de WhatsApp.
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="font-semibold text-blue-800">Información del Pago:</p>
              <p className="text-sm text-blue-700">
                Para confirmar su reserva, es necesario abonar la seña de ${turno.monto_seña}.
                Al hacer clic en el botón, será redirigido a WhatsApp para coordinar el pago con el complejo.
              </p>
            </div>  
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button 
            className="w-full md:w-1/4 bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => setShowPaymentModal(false)}
          >
            Volver
          </Button>
          <Button 
            className="w-full bg-green-500 text-white hover:bg-green-600"
            onClick={handleWhatsAppRedirect}
            disabled={isLoadingConfig || !config || !config.telefono_complejo}
          >
            Contactar por WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CoordinarPagoDialog;
