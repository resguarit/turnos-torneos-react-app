import React, { useState } from "react";
import dayjs from "dayjs";
import TurnoTabs from "./TurnoTabs";

// Define enum-like object to match backend states
const TurnoEstado = {
  PENDIENTE: 'Pendiente',
  SEÑADO: 'Señado', 
  PAGADO: 'Pagado',
  CANCELADO: 'Cancelado'
};

const ListaMisTurnos = ({ turnos, onTurnoCanceled }) => {
  const fechaActual = dayjs().format("YYYY-MM-DD");

  const turnosProximos = turnos.filter(
    (t) => t.fecha_turno >= fechaActual && t.estado !== TurnoEstado.CANCELADO
  );
  
  const turnosAnteriores = turnos.filter(
    (t) => t.fecha_turno < fechaActual && t.estado !== TurnoEstado.CANCELADO
  );
  
  const turnosCancelados = turnos.filter(
    (t) => t.estado === TurnoEstado.CANCELADO
  );

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