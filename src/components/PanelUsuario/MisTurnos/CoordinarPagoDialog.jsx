import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const CoordinarPagoDialog = ({ showPaymentModal, setShowPaymentModal, turno, handleWhatsAppRedirect }) => {
  if (!showPaymentModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-green-500" />
          Coordinar pago por WhatsApp
        </h3>
        
        <div className="mb-6">
          <p className="mb-4">
            Para coordinar el pago de la seña de <strong className="text-green-600">${turno.monto_seña}</strong> puedes contactarnos por WhatsApp.
          </p>
          <p className="mb-4">
            El resto del pago (<strong>${turno.monto_total - turno.monto_seña}</strong>) se abonará en el lugar el día del turno.
          </p>
          <p className="text-sm text-gray-600">
            Al hacer clic en "Ir a WhatsApp" serás redirigido a la app con un mensaje predefinido.
          </p>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            onClick={() => setShowPaymentModal(false)}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Volver
          </Button>
          <Button
            onClick={handleWhatsAppRedirect}
            className="bg-green-500 text-white hover:bg-green-600 flex items-center"
          >
            Ir a WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoordinarPagoDialog;
