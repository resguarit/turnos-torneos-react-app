import React from "react";
import TurnoCard from "./TurnoCard";
import footballImage from "@/assets/football.svg"; // Asegúrate de tener una imagen de pelota de fútbol en esta ruta
import previousTurnImage from "@/assets/previousTurn.svg"; // Asegúrate de tener una imagen para turnos anteriores
import canceledTurnImage from "@/assets/canceledTurn.svg"; // Asegúrate de tener una imagen para turnos cancelados

const TurnoList = ({ turnos, onTurnoCanceled, showCancelButton, showModifyButton, emptyMessage, secondaryMessage, image }) => {
  if (turnos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-8">
        <img src={image} alt="Imagen de turno" className="w-36 h-36 mb-4" />
        <p className="text-center text-lg text-gray-600">{emptyMessage}</p>
        <p className="text-center text-sm text-gray-500 mt-2">{secondaryMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {turnos.map((turno) => (
        <TurnoCard
          key={turno.id}
          turno={turno}
          onTurnoCanceled={onTurnoCanceled}
          showCancelButton={showCancelButton}
          showModifyButton={showModifyButton}
        />
      ))}
    </div>
  );
};

export default TurnoList;