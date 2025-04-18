import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { ROLES } from "@/constants/roles";
import App from "../App";
import TorneosA from "../views/Admin/TorneosA";
import ZonasA from "../views/Admin/ZonasA";
import AltaZona from "@/views/Admin/AltaZona";
import VerTurnos from "@/views/Admin/VerTurnos";
import Partidos from "@/views/Admin/Partidos";
import VerPartidos from "@/views/Admin/VerPartidos";
import CargaPartido from "@/views/Admin/CargaPartido";
import Reglamento from "@/views/Admin/Reglamento";
import Premios from "@/views/Admin/Premios";
import VerGrilla from "@/views/Admin/VerGrilla";
import Login from "@/views/General/Login";
import SignUp from "@/views/General/SignUp";
import EditarTurno from "@/views/Admin/EditarTurno";
import Error from "@/views/General/Error";
import UserProfile from "@/views/General/UserProfile";
import ConfirmarTurno from "@/views/General/ConfirmarTurno";
import ConfirmarLogin from "@/views/General/ConfirmarLogin";
import EditProfile from "@/views/User/EditProfile";
import NuevaReserva from "@/views/Admin/NuevaReserva";
import TurnoFijo from "@/views/Admin/TurnoFijo";
import NuevoPanelAdmin from "@/views/Admin/NuevoPanelAdmin";
import ContadorBloqueo from "@/views/General/ContadorBloqueo";
import ReservaMobile from "@/views/General/ReservaMobile";
import NuevoTurnoAdmi from "@/views/Admin/NuevoTurnoAdmi";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path={`/`} element={<App />} />
      <Route path={`/login`} element={<Login />} />
      <Route path={`/signup`} element={<SignUp />} />
      <Route path="*" element={<Error />} />
      <Route path={`/confirmar-turno`} element={<ConfirmarTurno />} />
      <Route path={`/confirmar-login`} element={<ConfirmarLogin />} />
      <Route path={`/nueva-reserva`} element={<NuevaReserva />} />
      <Route path={`/bloqueo-reserva`} element={<ContadorBloqueo />} />

      {/* Rutas protegidas para administradores */}
      <Route path={`/torneos-admi`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><TorneosA /></ProtectedRoute>} />
      <Route path={`/zonas-admi`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><ZonasA /></ProtectedRoute>} />
      <Route path={`/alta-zona`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AltaZona /></ProtectedRoute>} />
      <Route path={`/ver-turnos`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><VerTurnos /></ProtectedRoute>} />
      <Route path={`/grilla-turnos`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><VerGrilla /></ProtectedRoute>} />
      <Route path={`/editar-turno/:id`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><EditarTurno /></ProtectedRoute>} />
      <Route path={`/panel-admin`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><NuevoPanelAdmin /></ProtectedRoute>} />
      <Route path={`/nuevo-turno-admi`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><NuevoTurnoAdmi /></ProtectedRoute>}/>

      {/* Rutas protegidas para usuarios y administradores */}
      <Route path={`/user-profile`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><UserProfile /></ProtectedRoute>} />
      <Route path={`/reserva-mobile`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><ReservaMobile /></ProtectedRoute>} />
      <Route path={`/partidos`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><Partidos /></ProtectedRoute>} />
      <Route path={`/ver-partidos`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><VerPartidos /></ProtectedRoute>} />
      <Route path={`/cargar-partido`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><CargaPartido /></ProtectedRoute>} />
      <Route path={`/reglamento`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><Reglamento /></ProtectedRoute>} />
      <Route path={`/premios`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><Premios /></ProtectedRoute>} />
      <Route path={`/editar-perfil`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><EditProfile /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
