import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Clock, Shield, PencilIcon as Pitch, CalendarDays, ActivityIcon, Users, DollarSign, Box, LandPlot, Menu, X, BarChart3, Settings } from 'lucide-react';
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
import PestanaBalance from './PestanaBalance';
import PestanaConfiguracion from './PestanaConfiguracion';
import { decryptRole } from '@/lib/getRole';

const NuevoPanelAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [userRole, setUserRole] = useState('');
  const initialTab = queryParams.get('tab') || 'turnos';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const userRoleEncrypted = localStorage.getItem('user_role');
    const userRole = decryptRole(userRoleEncrypted);
    setUserRole(userRole);
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

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
      case 'balance':
        return isAdmin ? <PestanaBalance /> : null;
      case 'configuracion':
        return <PestanaConfiguracion />;
      default:
        return null;
    }
  };

  const MenuItems = () => (
    <div className="flex flex-col space-y-2">
      {isAdmin && (
        <button
          onClick={() => handleTabChange("dashboard")}
          className={`px-4 py-3 rounded-lg text-left flex items-center ${
            activeTab === "dashboard" ? "bg-naranja text-white" : "hover:bg-gray-100"
          }`}
        >
          <BarChart className="mr-3" size={20} />
          Dashboard
        </button>
      )}
      <button
        onClick={() => handleTabChange("schedules")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "schedules" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <Clock className="mr-3" size={20} />
        Horarios
      </button>
      <button
        onClick={() => handleTabChange("courts")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "courts" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <LandPlot className="mr-3" size={20} />
        Canchas / Deportes
      </button>
      <button
        onClick={() => handleTabChange("users")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "users" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <Shield className="mr-3" size={20} />
        Usuarios
      </button>
      <button
        onClick={() => handleTabChange("personas")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "personas" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <Users className="mr-3" size={20} />
        Personas
      </button>
      <button
        onClick={() => handleTabChange("cuentacorriente")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "cuentacorriente" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <DollarSign className="mr-3" size={20} />
        Cuentas Corrientes
      </button>
      <button
        onClick={() => handleTabChange("turnos")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "turnos" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <CalendarDays className="mr-3" size={20} />
        Turnos
      </button>
      {isAdmin && (
        <button
          onClick={() => handleTabChange("auditoria")}
          className={`px-4 py-3 rounded-lg text-left flex items-center ${
            activeTab === "auditoria" ? "bg-naranja text-white" : "hover:bg-gray-100"
          }`}
        >
          <ActivityIcon className="mr-3" size={20} />
          Auditorías
        </button>
      )}
      <button
        onClick={() => handleTabChange("caja")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "caja" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <Box className="mr-3" size={20} />
        Caja
      </button>
      {isAdmin && (
      <button
        onClick={() => handleTabChange("balance")}
        className={`px-4 py-3 rounded-lg text-left flex items-center ${
          activeTab === "balance" ? "bg-naranja text-white" : "hover:bg-gray-100"
        }`}
      >
        <BarChart3 className="mr-3" size={20} />
          Balance
        </button>
      )}
      <button
        onClick={() => handleTabChange('configuracion')}
        className={`flex items-center space-x-2 w-full text-left px-4 py-2 rounded-lg ${
          activeTab === 'configuracion' ? 'bg-naranja text-white' : 'hover:bg-gray-100'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span>Configuración</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex bg-gray-100">
        {/* Botón de menú móvil */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden fixed top-20 left-4 z-30 p-2 rounded-lg bg-white shadow-lg"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Panel lateral izquierdo - Desktop */}
        <div className="hidden lg:block w-64 bg-white shadow-lg p-4">
          <MenuItems />
        </div>

        {/* Panel lateral móvil */}
        <div
          className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 transform transition-transform duration-300 ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-16">
              <MenuItems />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-4 lg:p-6">
          {renderContenidoPestana()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NuevoPanelAdmin;