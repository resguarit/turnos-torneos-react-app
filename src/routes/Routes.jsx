import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { ROLES } from "@/constants/roles";
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
import ConfirmarTurno from "@/views/General/ConfirmarTurno";
import ConfirmarLogin from "@/views/General/ConfirmarLogin";
import EditProfile from "@/views/User/EditProfile";
import NuevaReserva from "@/views/Admin/NuevaReserva";

const AppRoutes = () => {
  return (
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Error />} />
        <Route path="/confirmar-turno" element={<ConfirmarTurno />} />
        <Route path="/confirmar-login" element={<ConfirmarLogin />} />
        <Route path="/nueva-reserva" element={<NuevaReserva />} />

        {/* Rutas protegidas para administradores */}
        <Route
          path="/torneos-admi"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <TorneosA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zonas-admi"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <ZonasA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alta-zona"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AltaZona />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ver-turnos"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <VerTurnos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grilla-turnos"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <VerGrilla />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editar-turno/:id"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <EditarTurno />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas para usuarios y administradores */}
        <Route
          path="/calendario-admi"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <Calendario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/horariosReserva/:date"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <HorariosReserva />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canchas-reserva"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <CanchasReserva />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil-usuario"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <PerfilUsuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partidos"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <Partidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ver-partidos"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <VerPartidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cargar-partido"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <CargaPartido />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reglamento"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <Reglamento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/premios"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <Premios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editar-perfil"
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
};

export default AppRoutes;
