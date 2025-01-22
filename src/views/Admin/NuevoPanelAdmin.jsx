import React, { useState } from 'react';
import { BarChart, Clock, Shield, PencilIcon as Pitch } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import PestanaDashboard from './PestanaDashboard';
import PestanaHorario from './PestanaHorario';
import PestanaPistas from './PestanaPistas';
import PestanaUsuarios from './PestanaUsuarios';

const NuevoPanelAdmin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContenidoPestana = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PestanaDashboard />;
      case 'schedules':
        return <PestanaHorario />;
      case 'courts':
        return <PestanaPistas />;
      case 'users':
        return <PestanaUsuarios />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-2 rounded-xl text-md font-medium ${
                activeTab === "dashboard" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <BarChart className="inline-block mr-2" size={24} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`px-3 py-2 rounded-xl text-md font-medium ${
                activeTab === "schedules" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Clock className="inline-block mr-2" size={24} />
              Horarios
            </button>
            <button
              onClick={() => setActiveTab("courts")}
              className={`px-3 py-2 rounded-xl text-md font-medium ${
                activeTab === "courts" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Pitch className="inline-block mr-2" size={24} />
              Canchas
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-2 rounded-xl text-md font-medium ${
                activeTab === "users" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Shield className="inline-block mr-2" size={24} />
              Usuarios
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