import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CreditCard, Clock, User, DollarSign, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {format} from 'date-fns';
import {es} from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import api from "@/lib/axiosConfig";
import { toast } from "react-toastify";

const ListaMisTurnos = ({ turnos, onTurnoCanceled }) => {  
    const fechaActual = dayjs().format("YYYY-MM-DD");

    const turnosProximos = turnos.filter(
      (t) => t.fecha_turno >= fechaActual && t.estado !== "Cancelado"
    );
    const turnosAnteriores = turnos.filter(
      (t) => t.fecha_turno < fechaActual && t.estado !== "Cancelado"
    );
    const turnosCancelados = turnos.filter((t) => t.estado === "Cancelado");
  
    return (
      <Tabs defaultValue="proximos" className="w-full">
        <TabsList className="flex justify-center space-x-4 border-b p-2">
          <TabsTrigger value="proximos" className="px-4 py-2 font-semibold border-b-2 border-transparent data-[state=active]:border-blue-500">Turnos Próximos</TabsTrigger>
          <TabsTrigger value="anteriores" className="px-4 py-2 font-semibold border-b-2 border-transparent data-[state=active]:border-blue-500">Turnos Anteriores</TabsTrigger>
          <TabsTrigger value="cancelados" className="px-4 py-2 font-semibold border-b-2 border-transparent data-[state=active]:border-blue-500">Turnos Cancelados</TabsTrigger>
        </TabsList>
  
        <TabsContent value="proximos">
          {turnosProximos.length > 0 ? turnosProximos.map((turno) => (
            <TurnoCard 
              key={turno.id} 
              turno={turno} 
              onTurnoCanceled={onTurnoCanceled}
              showCancelButton={true}
              showModifyButton={true} // Nueva prop para turnos próximos
            />
          )) : <p>No hay turnos próximos</p>}
        </TabsContent>
        <TabsContent value="anteriores">
          {turnosAnteriores.length > 0 ? turnosAnteriores.map((turno) => (
            <TurnoCard 
              key={turno.id} 
              turno={turno} 
              onTurnoCanceled={onTurnoCanceled}
              showCancelButton={false}
              showModifyButton={false}
            />
          )) : <p>No hay turnos anteriores</p>}
        </TabsContent>
        <TabsContent value="cancelados">
          {turnosCancelados.length > 0 ? turnosCancelados.map((turno) => (
            <TurnoCard 
              key={turno.id} 
              turno={turno} 
              onTurnoCanceled={onTurnoCanceled}
              showCancelButton={false}
            />
          )) : <p>No hay turnos cancelados</p>}
        </TabsContent>
      </Tabs>
    );
  };
  
  const TurnoCard = ({ turno, onTurnoCanceled, showCancelButton, showModifyButton }) => {
    const fechaFormateada = format(new Date(turno.fecha_turno), "EEEE, d 'de' MMMM 'de' yyyy", {locale:es});
    const señaPorcentaje = turno.cancha ? (turno.monto_seña / turno.monto_total) * 100 : 0;
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelTurno = async () => {
      setIsCancelling(true);
      try {
        await api.put(`/turnos/cancelar/${turno.id}`);
        setShowCancelModal(false);
        toast.success('Turno cancelado exitosamente');
        
        setTimeout(() => {
          if (onTurnoCanceled) {
            onTurnoCanceled();
          }
          setIsCancelling(false);
        }, 2000);

      } catch (error) {
        console.error('Error al cancelar el turno:', error);
        toast.error('Error al cancelar el turno');
        setIsCanceling(false);
      } finally {
        setIsCancelling(false);
      }
    };

    const getMontoColor = (tipo) => {
      switch (turno.estado) {
        case 'Pagado':
          return 'text-green-500';
        case 'Señado':
          return tipo === 'seña' ? 'text-green-500' : 'text-gray-900';
        case 'Pendiente':
          return 'text-red-500';
        default:
          return 'text-gray-900';
      }
    };

    return (
      <div className="flex justify-center">
      <Card className="mb-4 p-4 border rounded-lg shadow w-1/2">
        <CardContent>
          <h2 className="text-lg font-bold text-left">Detalles de la Reserva</h2>
          <p className="text-sm text-center text-gray-600 mb-4">{turno.ubicacion}</p>
          
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <div className="flex items-center gap-2 pb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-sm font-semibold">Fecha y Hora del Turno</p>
              </div>
              <p className="text-sm">{fechaFormateada}</p>
              <p className="text-sm">{turno.horario.hora_inicio} - {turno.horario.hora_fin}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 pb-1">
                <Clock className="w-4 h-4" />
                <p className="text-sm font-semibold">Duración y Cancha</p>
              </div>
              <p className="text-sm">60 min | {turno.cancha.tipo_cancha} #{turno.cancha.nro}</p>
            </div>
          </div>
          
          <hr className="my-2" />
  
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 pb-1">
                <User className="w-4 h-4" />
                <p className="text-sm font-semibold">Reservado por</p>
              </div>
              <p className="text-sm">{turno.usuario.nombre} - DNI: {turno.usuario.dni}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {turno.estado === "Cancelado" ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : turno.estado === "Pendiente" ? (
                  <MinusCircle className="w-4 h-4 text-yellow-500" />
                ) : turno.estado === "Señado" ? (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <p className="text-sm font-semibold">Estado</p>
              </div>
              <p className="text-sm pt-1">{turno.estado}</p>
            </div>
          </div>
          
          <hr className="my-2" />
          <div className="flex items-left pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <h4 className="text-sm font-semibold">Resumen de Pago</h4>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Total</p>
              </div>
              <p className={`text-sm font-bold ${getMontoColor('total')}`}>
                ${turno.monto_total}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Seña ({señaPorcentaje.toFixed(0)}%)</p>
              </div>
              <p className={`text-sm font-bold ${getMontoColor('seña')}`}>
                ${turno.monto_seña}
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            {turno.estado !== "Cancelado" && showCancelButton && (
              <Button 
                onClick={() => setShowCancelModal(true)}
                className="mt-4 w-1/4 bg-red-500 text-white hover:bg-red-600"
              >
                Cancelar Turno
              </Button>
            )}
            {showModifyButton && turno.estado !== "Cancelado" && (
              <Button 
                onClick={() => navigate(`/editar-turno/${turno.id}`)}
                className="mt-4 w-1/4 bg-blue-500 text-white hover:bg-blue-600"
              >
                Modificar Turno
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="w-full max-w-4xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">¿Estás seguro que deseas cancelar este turno?</DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm">
                  <span className="font-bold">Reserva hecha el: </span>{format(new Date(turno.created_at), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {locale:es})}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <p className="text-sm">
                  <span className="font-bold">
                  Cancelar sin costo hasta:</span> {
                    format(
                      new Date(new Date(turno.created_at).getTime() + 30 * 60000),
                      "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", 
                      {locale:es}
                    )
                  }
                </p>
              </div>
              <p>Esta acción no se puede deshacer.</p>
              <div className="bg-orange-100 p-4 rounded-lg">
                <p className="font-semibold text-orange-800">Nota:</p>
                <p className="text-sm text-orange-700">
                  Tienes 30 minutos después de hacer la reserva para cancelar la misma sin costo. 
                  Pasados los 30 minutos hay un cargo por cancelación del 10% del total de la cancha.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button 
              className="w-full sm:w-24 bg-gray-200 text-gray-800 hover:bg-gray-300" 
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Volver
            </Button>
            <Button 
              className="w-full sm:w-32 bg-red-500 text-white hover:bg-red-600"
              onClick={handleCancelTurno}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    );
  };

export default ListaMisTurnos
