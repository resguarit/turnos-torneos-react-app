import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import { ROLES } from "@/constants/roles";
import { BASE_URL } from '@/constants/config';
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


const AppRoutes = () => {
  return (
      <Routes>
        {/* Rutas públicas */}
        <Route path={`${BASE_URL}/`} element={<App />} />
        <Route path={`${BASE_URL}/login`} element={<Login />} />
        <Route path={`${BASE_URL}/signup`} element={<SignUp />} />
        <Route path="*" element={<Error />} />
        <Route path={`${BASE_URL}/confirmar-turno`} element={<ConfirmarTurno />} />
        <Route path={`${BASE_URL}/confirmar-login`} element={<ConfirmarLogin />} />
        <Route path={`${BASE_URL}/nueva-reserva`} element={<NuevaReserva />} />
        <Route path={`${BASE_URL}/bloqueo-reserva`} element={<ContadorBloqueo />} />

        {/* Rutas protegidas para administradores */}
        <Route
          path={`${BASE_URL}/torneos-admi`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <TorneosA />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${BASE_URL}/zonas-admi`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <ZonasA />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${BASE_URL}/alta-zona`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AltaZona />
            </ProtectedRoute>
          }
        />
        */}
        <Route
          path={`${BASE_URL}/ver-turnos`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <VerTurnos />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${BASE_URL}/grilla-turnos`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <VerGrilla />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${BASE_URL}/editar-turno/:id`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <EditarTurno />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${BASE_URL}/turno-fijo`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <TurnoFijo />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${BASE_URL}/panel-admin`}
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <NuevoPanelAdmin />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas para usuarios y administradores */}
        <Route
          path={`${BASE_URL}/user-profile`}
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        {/* 
        <Route
          path={`${BASE_URL}/partidos`}
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <Partidos />
            </ProtectedRoute>
          }
        />
        */}
        <Route
          path={`${BASE_URL}/ver-partidos`}
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <VerPartidos />
            </ProtectedRoute>
          }
        />
        {/*
        <Route
          path={`${BASE_URL}/cargar-partido`}
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <CargaPartido />
            </ProtectedRoute>
          }
        />
        

        <Route
          path={`${BASE_URL}/reglamento`}
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <Reglamento />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={`${BASE_URL}/premios`}
          element={
            <ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.USER]}>
              <Premios />
            </ProtectedRoute>
          }
        />
        */}
        <Route
          path={`${BASE_URL}/editar-perfil`}
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
