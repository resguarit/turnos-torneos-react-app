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
import AltaTorneo from "@/views/Admin/Torneos/AltaTorneo";
import DetalleZona from "@/views/Admin/Torneos/DetalleZona";
import AltaEquipo from "@/views/Admin/Torneos/AltaEquipo";
import Jugadores from "@/views/Admin/Torneos/Jugadores";
import SelectDeporteReserva from "@/views/General/SelectDeporteReserva";
import ForgotPassword from "@/views/User/ForgotPassword";
import ResetPassword from "@/views/User/ResetPassword";
import VerifyEmail from "@/views/User/VerifyEmail";
import Checkout from "@/views/Checkout/Checkout";
import CheckoutSuccess from "@/views/Checkout/CheckoutSuccess";
import CheckoutFailure from "@/views/Checkout/CheckoutFailure";
import CheckoutPending from "@/views/Checkout/CheckoutPending";
import BloquearTurnos from "@/views/Admin/BloquearTurnos";
import TurnosBloqueados from "@/views/Admin/TurnosBloqueados";

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
      <Route path={`/select-deporte`} element={<SelectDeporteReserva />} />
      <Route path={`/forgot-password`} element={<ForgotPassword />} />
      <Route path={`/reset-password`} element={<ResetPassword />} />
      <Route path={`/verify-email`} element={<VerifyEmail />} />
      <Route path={`/checkout/success/:turnoId`} element={<CheckoutSuccess />} />
      <Route path={`/checkout/failure/:turnoId`} element={<CheckoutFailure />} />
      <Route path={`/checkout/pending/:turnoId`} element={<CheckoutPending />} />

      {/* Rutas protegidas para administradores */}
      <Route path={`/torneos-admi`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><Torneos /></ProtectedRoute>} />
      <Route path={`/zonas-admi/:torneoId`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><Zonas /></ProtectedRoute>} />
      <Route path={`/alta-zona/:torneoId`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><AltaZona /></ProtectedRoute>} />
      <Route path={`/ver-turnos`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><VerTurnos /></ProtectedRoute>} />
      <Route path={`/grilla-turnos`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><VerGrilla /></ProtectedRoute>} />
      <Route path={`/editar-turno/:id`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><EditarTurno /></ProtectedRoute>} />
      <Route path={`/panel-admin`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><NuevoPanelAdmin /></ProtectedRoute>} />
      <Route path={`/nuevo-turno-admi`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><NuevoTurnoAdmi /></ProtectedRoute>}/>
      <Route path={`/alta-torneo`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><AltaTorneo /></ProtectedRoute>} />
      <Route path={`/detalle-zona/:zonaId`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><DetalleZona /></ProtectedRoute>} />
      <Route path={`/alta-equipo/:zonaId`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><AltaEquipo /></ProtectedRoute>} />
      <Route path={`/jugadores/:equipoId`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><Jugadores /></ProtectedRoute>} />
      <Route path={`/bloquear-turnos`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><BloquearTurnos /></ProtectedRoute>} />
      <Route path={`/turnos-bloqueados`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR]}><TurnosBloqueados /></ProtectedRoute>} />

      {/* Rutas protegidas para usuarios y administradores */}
      <Route path={`/user-profile`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><UserProfile /></ProtectedRoute>} />
      <Route path={`/reserva-mobile/:deporteId`} element={<ReservaMobile />} />
      <Route path={`/partidos`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><Partidos /></ProtectedRoute>} />
      <Route path={`/ver-partidos`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><VerPartidos /></ProtectedRoute>} />
      <Route path={`/cargar-partido`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><CargaPartido /></ProtectedRoute>} />
      <Route path={`/reglamento`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><Reglamento /></ProtectedRoute>} />
      <Route path={`/premios`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><Premios /></ProtectedRoute>} />
      <Route path={`/editar-perfil`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}><EditProfile /></ProtectedRoute>} />
      <Route path={`/checkout`} element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.MODERADOR, ROLES.USER]}><Checkout /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
