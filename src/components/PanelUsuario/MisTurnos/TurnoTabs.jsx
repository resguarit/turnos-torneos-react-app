import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TurnoList from "./TurnoList";
import { Button } from "@/components/ui/button";
import footballImage from "@/assets/football.svg";
import previousTurnImage from "@/assets/previousTurn.svg";
import canceledTurnImage from "@/assets/canceledTurn.svg";

const TurnoTabs = ({ turnosProximos, turnosAnteriores, turnosCancelados, onTurnoCanceled }) => {
  const [activeTab, setActiveTab] = useState('proximos');
  const [currentPage, setCurrentPage] = useState(1);
  const turnsPerPage = 3;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getCurrentTurns = (turnos) => {
    const indexOfLastTurn = currentPage * turnsPerPage;
    const indexOfFirstTurn = indexOfLastTurn - turnsPerPage;
    return turnos.slice(indexOfFirstTurn, indexOfLastTurn);
  };

  const pageNumbers = (turnos) => {
    const totalTurns = turnos.length;
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalTurns / turnsPerPage); i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <Tabs defaultValue="proximos" className="w-full" onValueChange={handleTabChange}>
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
          turnos={getCurrentTurns(turnosProximos)}
          onTurnoCanceled={onTurnoCanceled}
          showCancelButton={true}
          showModifyButton={true}
          emptyMessage="No hay turnos próximos"
          secondaryMessage="Cuando reserves un turno se verá reflejado aquí"
          image={footballImage}
        />
        {turnosProximos.length > turnsPerPage && (
          <div className="flex justify-center mt-4 gap-2">
            {pageNumbers(turnosProximos).map(number => (
              <Button
                key={number}
                onClick={() => paginate(number)}
                className={`${
                  currentPage === number ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {number}
              </Button>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="anteriores">
        <TurnoList
          turnos={getCurrentTurns(turnosAnteriores)}
          onTurnoCanceled={onTurnoCanceled}
          showCancelButton={false}
          showModifyButton={false}
          emptyMessage="No hay turnos anteriores"
          secondaryMessage="Cuando finalices un turno se verá reflejado aquí"
          image={previousTurnImage}
        />
        {turnosAnteriores.length > turnsPerPage && (
          <div className="flex justify-center mt-4 gap-2">
            {pageNumbers(turnosAnteriores).map(number => (
              <Button
                key={number}
                onClick={() => paginate(number)}
                className={`${
                  currentPage === number ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {number}
              </Button>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="cancelados">
        <TurnoList
          turnos={getCurrentTurns(turnosCancelados)}
          onTurnoCanceled={onTurnoCanceled}
          showCancelButton={false}
          showModifyButton={false}
          emptyMessage="No hay turnos cancelados"
          secondaryMessage="Cuando canceles un turno se verá reflejado aquí"
          image={canceledTurnImage}
        />
        {turnosCancelados.length > turnsPerPage && (
          <div className="flex justify-center mt-4 gap-2">
            {pageNumbers(turnosCancelados).map(number => (
              <Button
                key={number}
                onClick={() => paginate(number)}
                className={`${
                  currentPage === number ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {number}
              </Button>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default TurnoTabs;