import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, DollarSign, CheckCircle, XCircle } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {format} from 'date-fns';
import {es} from 'date-fns/locale'

const ListaMisTurnos = ({ turnos }) => {  
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
          {turnosProximos.length > 0 ? turnosProximos.map((turno) => <TurnoCard key={turno.id} turno={turno} />) : <p>No hay turnos próximos</p>}
        </TabsContent>
        <TabsContent value="anteriores">
          {turnosAnteriores.length > 0 ? turnosAnteriores.map((turno) => <TurnoCard key={turno.id} turno={turno} />) : <p>No hay turnos anteriores</p>}
        </TabsContent>
        <TabsContent value="cancelados">
          {turnosCancelados.length > 0 ? turnosCancelados.map((turno) => <TurnoCard key={turno.id} turno={turno} />) : <p>No hay turnos cancelados</p>}
        </TabsContent>
      </Tabs>
    );
  };
  
  const TurnoCard = ({ turno }) => {
    const fechaFormateada = format(new Date(turno.fecha_turno), "EEEE, d 'de' MMMM 'de' yyyy", {locale:es});
    const señaPorcentaje = turno.cancha ? (turno.monto_seña / turno.monto_total) * 100 : 0;


    return (
      <div className="flex justify-center">
      <Card className="mb-4 p-4 border rounded-lg shadow w-1/2">
        <CardContent>
          <h2 className="text-lg font-bold text-left">Detalles de la Reserva</h2>
          <p className="text-sm text-center text-gray-600 mb-4">{turno.ubicacion}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm font-semibold">Fecha y Hora</p>
              </div>
              <p className="text-sm">{fechaFormateada}</p>
              <p className="text-sm">{turno.horario.hora_inicio} - {turno.horario.hora_fin}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <p className="text-sm font-semibold">Duración y Cancha</p>
              </div>
              <p className="text-sm">60 min | {turno.cancha.tipo_cancha} #{turno.cancha.nro}</p>
            </div>
          </div>
          
          <hr className="my-2" />
  
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <p className="text-sm font-semibold">Reservado por</p>
          </div>
          <p className="text-sm">{turno.usuario.nombre} - DNI: {turno.usuario.dni}</p>
          
          <hr className="my-2" />
  
          <div className="flex items-center gap-2">
            {turno.estado === "Cancelado" ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
            <p className="text-sm font-semibold">Estado</p>
          </div>
          <p className="text-sm text-gray-700 font-bold">{turno.estado}</p>
          
          <hr className="my-2" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <p className="text-sm font-semibold">Total</p>
              </div>
              <p className="text-sm font-bold text-gray-700">${turno.monto_total}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <p className="text-sm font-semibold">Seña ({señaPorcentaje.toFixed(0)}%)</p>
              </div>
              <p className="text-sm text-red-500">${turno.monto_seña}</p>
            </div>
          </div>
  
          {turno.estado !== "Cancelado" && (
            <Button className="mt-4 w-1/4 bg-red-500 text-white hover:bg-red-600">Cancelar Turno</Button>
          )}
        </CardContent>
      </Card>
      </div>
    );
  };

export default ListaMisTurnos;

