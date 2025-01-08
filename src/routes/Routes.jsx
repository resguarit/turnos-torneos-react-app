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
import Partidos from "@/views/Admin/Partidos";
import VerPartidos from "@/views/Admin/VerPartidos";
import CargaPartido from "@/views/Admin/CargaPartido";
import Reglamento from "@/views/Admin/Reglamento";
import Premios from "@/views/Admin/Premios";
import VerGrilla from "@/views/Admin/VerGrilla";
import PerfilUsuario from "@/views/General/PerfilUsuario";
import Login from "@/views/General/Login";
import SignUp from "@/views/General/SignUp";
import EditarTurno from "@/views/Admin/EditarTurno";
import Error from "@/views/General/Error";
import UserProfile from "@/views/General/UserProfile";

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
        <Route path="/grilla-turnos" element={<VerGrilla />} />
        <Route path="/horariosReserva/:date" element={<HorariosReserva />} />
        <Route path="/canchas-reserva" element={<CanchasReserva />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/ver-partidos" element={<VerPartidos />} />
        <Route path="/cargar-partido" element={<CargaPartido />} />
        <Route path="/reglamento" element={<Reglamento />} />
        <Route path="/premios" element={<Premios />} />
        <Route path="/perfil-usuario" element={<PerfilUsuario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/editar-turno/:id" element={<EditarTurno />} />
        <Route path="*" element={<Error />} />
        <Route path="/user-profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
