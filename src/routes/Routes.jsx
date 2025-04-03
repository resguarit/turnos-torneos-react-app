import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { ROLES } from "@/constants/roles";
import App from "../App";
import Torneos from "@/views/Admin/Torneos/Torneos";
import Zonas from "@/views/Admin/Torneos/Zonas";
import AltaZona from "@/views/Admin/Torneos/AltaZona";
import VerTurnos from "@/views/Admin/VerTurnos";
import Partidos from "@/views/Admin/Partidos";
import VerPartidos from "@/views/Admin/VerPartidos";
import CargaPartido from "@/views/Admin/Torneos/CargaPartido";
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
import AltaTorneo from "@/views/Admin/Torneos/AltaTorneo";
import DetalleZona from "@/views/Admin/Torneos/DetalleZona";
import AltaEquipo from "@/views/Admin/Torneos/AltaEquipo";
import Jugadores from "@/views/Admin/Torneos/Jugadores";
import ResultadoPartido from "@/views/Admin/Torneos/ResultadoPartido";
import VerTorneos from "@/views/Admin/Torneos/VerTorneos";
import VerZonas from "@/views/Admin/Torneos/VerZonas";
import VerTablas from "@/views/Admin/Torneos/VerTablas";
import VerFixture from "@/views/Admin/Torneos/VerFixture";
import EditarEquipo from '@/views/Admin/Torneos/EditarEquipo';


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
      <Route path={`/torneos-user`} element={<VerTorneos />} />
      <Route path={`/zonas-user/:torneoId`} element={<VerZonas />} />
      <Route path={`/tablas/:zonaId`} element={<VerTablas />} />
      <Route path={`/ver-fixture/:zonaId`} element={<VerFixture />} />

      {/* Rutas protegidas para administradores */}
      <Route path={`/torneos-admi`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><Torneos /></ProtectedRoute>} />
      <Route path={`/zonas-admi/:torneoId`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><Zonas /></ProtectedRoute>} />
      <Route path={`/alta-zona/:torneoId`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AltaZona /></ProtectedRoute>} />
      <Route path={`/ver-turnos`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><VerTurnos /></ProtectedRoute>} />
      <Route path={`/grilla-turnos`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><VerGrilla /></ProtectedRoute>} />
      <Route path={`/editar-turno/:id`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><EditarTurno /></ProtectedRoute>} />
      <Route path={`/panel-admin`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><NuevoPanelAdmin /></ProtectedRoute>} />
      <Route path={`/nuevo-turno-admi`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><NuevoTurnoAdmi /></ProtectedRoute>}/>
      <Route path={`/alta-torneo`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AltaTorneo /></ProtectedRoute>} />
      <Route path={`/detalle-zona/:zonaId`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><DetalleZona /></ProtectedRoute>} />
      <Route path={`/alta-equipo/:zonaId`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AltaEquipo /></ProtectedRoute>} />
      <Route path={`/jugadores/:equipoId`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><Jugadores /></ProtectedRoute>} />
      <Route path={`/resultado-partido/:partidoId`} element={<ProtectedRoute requiredRole={ROLES.ADMIN}><ResultadoPartido /></ProtectedRoute>} />
      <Route path={`/editar-torneo/:id`}element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AltaTorneo /></ProtectedRoute>}/>
      <Route path="/editar-zona/:id" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AltaZona /></ProtectedRoute>} />
      <Route path="/editar-partido/:partidoId" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><CargaPartido /></ProtectedRoute>} />
      <Route path="/editar-equipo/:equipoId" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><EditarEquipo /></ProtectedRoute>} />

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
