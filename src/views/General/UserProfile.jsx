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
      <main className="flex-grow bg-gray-100 p-6">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <h1 className="text-3xl font-bold text-black mb-6">
            Mi Panel de Usuario
          </h1>
          <div className="grid grid-cols-1  md:grid-cols-3 gap-6 mb-6">
            <Button
            style={{ borderRadius: "12px" }}
              onClick={() => setActiveSection("appointments")}
              className={`flex lg:text-2xl items-center justify-center gap-2 h-20 ${
                activeSection === "appointments"
                  ? "bg-naranja hover:bg-naranja/90 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <CalendarDays style={{height: '28px', width:'28px'}} className="size-10" />
              <span>Mis Turnos</span>
            </Button>
            <Button
            style={{ borderRadius: "12px" }}
              onClick={() => setActiveSection("teams")}
              className={`flex lg:text-2xl items-center justify-center gap-2 h-20 ${
                activeSection === "teams"
                  ? "bg-naranja hover:bg-naranja/90 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <Users style={{height: '28px', width:'28px'}} className="h-6 w-6" />
              <span>Mis Equipos</span>
            </Button>
            <Button
            style={{ borderRadius: "12px" }}
              onClick={() => setActiveSection("tournaments")}
              className={`flex lg:text-2xl items-center justify-center gap-2 h-20 ${
                activeSection === "tournaments"
                  ? "bg-naranja hover:bg-naranja/90 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <Trophy style={{height: '28px', width:'28px'}} className="h-6 w-6" />
              <span>Mis Torneos</span>
            </Button>
          </div>
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="text-3xl ">
                {activeSection === "appointments"
                  ? "Mis Turnos"
                  : activeSection === "teams"
                  ? "Mis Equipos"
                  : "Mis Torneos"}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderSection()}</CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
