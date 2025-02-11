import React, { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { CalendarDays, UserCircle, Users, Trophy } from "lucide-react";
import MisTurnos from "../User/MisTurnos";
import MisEquipos from "../User/MisEquipos";
import MisTorneos from "../User/MisTorneos";

export default function UserProfile() {
  const [activeSection, setActiveSection] = useState("appointments");

  const renderSection = () => {
    switch (activeSection) {
      case "appointments":
        return <MisTurnos />;
      case "teams":
        return <MisEquipos />;
      case "tournaments":
        return <MisTorneos />;
      default:
        return <MisTurnos />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100 md:p-6 p-4">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-black mb-6">
            Mi Panel de Usuario
          </h1>
          <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 w-[80vw] md:grid-cols-3 gap-6 mb-6">
            <Button
              onClick={() => setActiveSection("appointments")}
              className={`flex lg:text-lg items-center justify-center rounded-[12px] gap-2 p-3  md:p-8 ${
                activeSection === "appointments"
                  ? "bg-naranja hover:bg-naranja/90 text-white "
                  : "bg-white "
              }`}
            >
              <CalendarDays style={{height: '24px', width:'24px'}} />
              <span>Mis Turnos</span>
            </Button>
            <Button
              onClick={() => setActiveSection("teams")}
              className={`flex lg:text-lg items-center justify-center rounded-[12px] gap-2 p-3  md:p-8  ${
                activeSection === "teams"
                  ? "bg-naranja hover:bg-naranja/90 text-white"
                  : "bg-white "
              }`}
            >
              <Users style={{height: '24px', width:'24px'}} className="h-6 w-6" />
              <span>Mis Equipos</span>
            </Button>
            <Button
              onClick={() => setActiveSection("tournaments")}
              className={`flex lg:text-lg items-center justify-center rounded-[12px] gap-2 p-3  md:p-8  ${
                activeSection === "tournaments"
                  ? "bg-naranja hover:bg-naranja/90 text-white"
                  : "bg-white "
              }`}
            >
              <Trophy style={{height: '24px', width:'24px'}} className="h-6 w-6" />
              <span>Mis Torneos</span>
            </Button>
          </div>
          </div>
          <div className="border-0 shadow-none">
           {renderSection()} 
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
