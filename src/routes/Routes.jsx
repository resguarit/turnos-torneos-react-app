import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "../App";
import TorneosA from "../views/Admin/TorneosA";
import ZonasA from "../views/Admin/ZonasA";
import AltaZona from "@/views/Admin/AltaZona";
import Calendario from "@/views/Admin/Calendario";
import VerTurnos from "@/views/Admin/VerTurnos";
import HorariosReserva from "@/views/Admin/HorariosReserva";
import CanchasReserva from "@/views/Admin/CanchasReserva";
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/torneos-admi" element={<TorneosA />} />
        <Route path="/zonas-admi" element={<ZonasA />} />
        <Route path="/alta-zona" element={<AltaZona />} />
        <Route path="/calendario-admi" element={<Calendario />} />
        <Route path="/ver-turnos" element={<VerTurnos />} />
        <Route path="/horariosReserva/:date" element={<HorariosReserva />} />
        <Route path="/canchas-reserva" element={<CanchasReserva />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
