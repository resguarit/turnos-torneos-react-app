import React, { useState } from "react";
import dayjs from "dayjs";
import TurnoTabs from "./TurnoTabs";

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
    <TurnoTabs
      turnosProximos={turnosProximos}
      turnosAnteriores={turnosAnteriores}
      turnosCancelados={turnosCancelados}
      onTurnoCanceled={onTurnoCanceled}
    />
  );
};

export default ListaMisTurnos;