import React, { useState, useEffect } from 'react';;
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Clock, Shield, PencilIcon as Pitch, CalendarDays, ActivityIcon, Users, DollarSign, Box, LandPlot } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import PestanaDashboard from './PestanaDashboard';
import PestanaHorario from './PestanaHorario';
import PestanaPistas from './PestanaPistas';
import PestanaUsuarios from './PestanaUsuarios';
import PestanaTurnos from './PestanaTurnos';
import PestanaAuditoria from './PestanaAuditoria';
import PestanaPersonas from './PestanaPersonas';
import PestanaCuentasCorrientes from './PestanaCuentasCorrientes';
import PestanaCaja from './PestanaCaja';

const NuevoPanelAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [userRole, setUserRole] = useState('');
  const initialTab = queryParams.get('tab') || 'turnos';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setUserRole(role);
  }, []);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    navigate(`?tab=${activeTab}`, { replace: true });
  }, [activeTab, navigate]);

  const isAdmin = userRole === 'admin';

  const renderContenidoPestana = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? <PestanaDashboard /> : null;
      case 'schedules':
        return <PestanaHorario />;
      case 'courts':
        return <PestanaPistas />;
      case 'users':
        return <PestanaUsuarios />;
      case 'turnos':
        return <PestanaTurnos />;
      case 'auditoria':
        return isAdmin ? <PestanaAuditoria /> : null;
      case 'personas':
        return <PestanaPersonas />;
      case 'cuentacorriente':
        return <PestanaCuentasCorrientes />;
      case 'caja':
        return <PestanaCaja />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-4">
            {isAdmin && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                  activeTab === "dashboard" ? "bg-naranja text-white" : "bg-gray-200 text-black"
                }`}
              >
                <BarChart className="inline-block mr-2" size={18} />
                Dashboard
              </button>
            )}
            <button
              onClick={() => setActiveTab("schedules")}
              className={`px-3 items-center flex  py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                activeTab === "schedules" ? "bg-naranja text-white" : "bg-gray-200 text-black"
              }`}
            >
              <Clock className="inline-block mr-2" size={18} />
              Horarios
            </button>
            <button
              onClick={() => setActiveTab("courts")}
              className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                activeTab === "courts" ? "bg-naranja text-white" : "bg-gray-200 text-black"
              }`}
            >
              <LandPlot className="inline-block mr-2" size={18} />
              Canchas / Deportes
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                activeTab === "users" ? "bg-naranja text-white" : "bg-gray-200 text-black"
              }`}
            >
              <Shield className="inline-block mr-2" size={18} />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("personas")}
              className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                activeTab === "personas" ? "bg-naranja text-white" : "bg-gray-200 text-black"
              }`}
            >
              <Users className="inline-block mr-2" size={18} />
              Personas
            </button>
            <button
              onClick={() => setActiveTab("cuentacorriente")}
              className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                activeTab === "cuentacorriente" ? "bg-naranja text-white" : "bg-gray-200 text-black"
              }`}
            >
              <DollarSign className="inline-block mr-2" size={18} />
              Cuentas Corrientes
            </button>
            <button
              onClick={() => setActiveTab("turnos")}
              className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                activeTab === "turnos" ? "bg-naranja text-white" : "bg-gray-200 text-black"
              }`}
            >
              <CalendarDays className="inline-block mr-2" size={18} />
              Turnos
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab("auditoria")}
                className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base  ${
                  activeTab === "auditoria" ? "bg-naranja text-white" : "bg-gray-200 text-black"
                }`}
              >
                <ActivityIcon className="inline-block mr-2" size={18} />
                Auditorías
              </button>
            )}
            <button
              onClick={() => setActiveTab("caja")}
              className={`px-3 items-center flex py-1 sm:py-2 rounded-[4px] text-sm sm:text-base ${
                activeTab === "caja" ? "bg-naranja text-white" : "bg-gray-200 text-black"
              }`}
            >
              <Box className="inline-block mr-2" size={18} />
              Caja
            </button>
          </div>
            {renderContenidoPestana()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NuevoPanelAdmin;