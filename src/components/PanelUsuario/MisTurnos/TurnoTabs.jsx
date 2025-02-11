import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TurnoList from "./TurnoList";

const TurnoTabs = ({ turnosProximos, turnosAnteriores, turnosCancelados, onTurnoCanceled }) => {
  return (
    <Tabs defaultValue="proximos" className="w-full">
      <TabsList className="flex justify-center space-x-2 md:space-x-4 border-b p-2">
        <TabsTrigger value="proximos" className="px-2 md:px-4 py-2 font-semibold border-b-2 border-transparent data-[state=active]:border-blue-500">
          Turnos Próximos
        </TabsTrigger>
        <TabsTrigger value="anteriores" className="px-2 md:px-4 py-2 font-semibold border-b-2 border-transparent data-[state=active]:border-blue-500">
          Turnos Anteriores
        </TabsTrigger>
        <TabsTrigger value="cancelados" className="px-2 md:px-4 py-2 font-semibold border-b-2 border-transparent data-[state=active]:border-blue-500">
          Turnos Cancelados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="proximos">
        <TurnoList
          turnos={turnosProximos}
          onTurnoCanceled={onTurnoCanceled}
          showCancelButton={true}
          showModifyButton={true}
          emptyMessage="No hay turnos próximos"
        />
      </TabsContent>
      <TabsContent value="anteriores">
        <TurnoList
          turnos={turnosAnteriores}
          onTurnoCanceled={onTurnoCanceled}
          showCancelButton={false}
          showModifyButton={false}
          emptyMessage="No hay turnos anteriores"
        />
      </TabsContent>
      <TabsContent value="cancelados">
        <TurnoList
          turnos={turnosCancelados}
          onTurnoCanceled={onTurnoCanceled}
          showCancelButton={false}
          showModifyButton={false}
          emptyMessage="No hay turnos cancelados"
        />
      </TabsContent>
    </Tabs>
  );
};

export default TurnoTabs;