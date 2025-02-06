import React from "react";
import TurnoCard from "./TurnoCard";

const TurnoList = ({ turnos, onTurnoCanceled, showCancelButton, showModifyButton, emptyMessage }) => {
  return turnos.length > 0 ? (
    turnos.map((turno) => (
      <TurnoCard
        key={turno.id}
        turno={turno}
        onTurnoCanceled={onTurnoCanceled}
        showCancelButton={showCancelButton}
        showModifyButton={showModifyButton}
      />
    ))
  ) : (
    <p>{emptyMessage}</p>
  );
};

export default TurnoList;