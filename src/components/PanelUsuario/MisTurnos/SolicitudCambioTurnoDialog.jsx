import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, CircleAlert } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SolicitudCambioTurnoDialog = ({ showChangeModal, setShowChangeModal, turno, isSubmitting }) => {
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "2213587143"; // Replace with the desired phone number
    const fechaFormateada = format(new Date(turno.fecha_turno), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const message = `Hola, me gustaría solicitar un cambio de turno para la reserva:\n\n` +
                    `Usuario: ${turno.usuario.nombre}\n` +
                    `DNI: ${turno.usuario.dni}\n` +
                    `Fecha y Hora: ${fechaFormateada} de ${turno.horario.hora_inicio} a ${turno.horario.hora_fin}\n` +
                    `Cancha: ${turno.cancha.tipo_cancha} #${turno.cancha.nro}\n\n` +
                    `Gracias.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={showChangeModal} onOpenChange={setShowChangeModal}>
      <DialogContent className="w-full max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">¿Seguro que desea solicitar un cambio de turno?</DialogTitle>
          <DialogDescription className="pt-4 space-y-4">
            <div className="flex gap-2">
              <CircleAlert className="size-5 " />
              <p className="text-sm">
                <span className="font-bold">Aviso:</span> El cambio de turno se solicita a través de WhatsApp.
              </p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <p className="font-semibold text-orange-800">Información Importante:</p>
              <p className="text-sm text-orange-700">
                Si se modifica el turno a otra cancha con distintos precios, se ajustará el monto a pagar. 
                Si el turno ya está señado o pagado, se aplicarán las políticas de reembolso correspondientes.
                Por favor, asegúrese de proporcionar toda la información necesaria para procesar su solicitud.
              </p>
            </div>  
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className=" gap-2 mt-4">
          <Button 
            className="w-1/4 bg-gray-200 text-gray-800 hover:bg-gray-300" 
            onClick={() => setShowChangeModal(false)}
            disabled={isSubmitting}
          >
            Volver
          </Button>
          <Button 
            className="w-full bg-green-500 text-white hover:bg-green-600"
            onClick={handleWhatsAppRedirect}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Cambio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SolicitudCambioTurnoDialog;