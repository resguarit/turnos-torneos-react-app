import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/Footer";

const courtsData = [
  { id: 1, name: "Cancha 1", schedules: ["17:00 - 18:00", "19:00 - 20:00"] },
  { id: 2, name: "Cancha 2", schedules: ["18:00 - 19:00"] },
  { id: 3, name: "Cancha 3", schedules: [] },
  { id: 4, name: "Cancha 4", schedules: ["18:00 - 19:00", "21:00 - 22:00"] },
  { id: 5, name: "Cancha 5", schedules: ["22:00 - 23:00"] },
];

const timeSlots = [
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00",
  "22:00 - 23:00",
];

export default function HorariosReserva() {
  const { date } = useParams(); // Obtener la fecha de la URL
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);

  const fecha = new Date(`${date}T00:00:00`);
  const dia = fecha.getDay();
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaNombre = diaSemana[dia];
  const fechaFormateada = `${diaNombre} - ${date}`;

  useEffect(() => {
    // Determinar disponibilidad por horario
    const availabilityStatus = timeSlots.map((slot) => {
      const isAllOccupied = courtsData.every((court) =>
        court.schedules.includes(slot)
      );
      return { time: slot, status: isAllOccupied ? "ocupado" : "libre" };
    });
    setAvailability(availabilityStatus);
  }, []);

  const handleReserve = (time) => {
    navigate(
      `/canchas-reserva?time=${encodeURIComponent(time)}&date=${encodeURIComponent(
        date
      )}`
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="grow max-w-2xl lg:max-w-full lg:mx-0 mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2 lg:text-4xl">Reservas</h1>
        <p className="text-lg font-medium mb-4 lg:text-2xl">{fechaFormateada}</p>
        <div className="flex justify-center"> 
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 lg:w-1/2">
          {availability.map((slot, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium lg:text-xl">{slot.time}</span>
                <span
                  style={{ borderRadius: "6px" }}
                  className={`items-center w-16 text-center text-xs lg:text-xl ${
                    slot.status === "libre"
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {slot.status}
                </span>
              </div>
              <button
                onClick={() => handleReserve(slot.time)}
                disabled={slot.status === "ocupado"}
                className="text-sm lg:text-xl w-fit p-1 lg:p-2 bg-naranja items-center hover:bg-[#FF5533]/90 text-white"
                style={{ borderRadius: "4px" }}
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
        </div>
        <Button
          variant="outline"
          style={{ borderRadius: "6px" }}
          onClick={() => navigate(-1)}
          className="bg-black text-white hover:bg-black/90 lg:mx-auto lg:text-xl font-normal"
        >
          Atrás
        </Button>
      </main>
      <Footer />
    </div>
  );
}
