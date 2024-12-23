import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from '@/components/Footer';

const timeSlots = [
  { time: "17:00 - 18:00", status: "libre" },
  { time: "18:00 - 19:00", status: "ocupado" },
  { time: "19:00 - 20:00", status: "libre" },
  { time: "20:00 - 21:00", status: "libre" },
  { time: "21:00 - 22:00", status: "ocupado" },
  { time: "22:00 - 23:00", status: "libre" },
];

export default function HorariosReserva() {
  const { date } = useParams(); // Obtener la fecha de la URL
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState(null);

  const handleReserve = (time) => {
    setSelectedTime(time);
    console.log("Navegando a:", `/canchas-reserva?time=${encodeURIComponent(time)}`);
    navigate(`/canchas-reserva?time=${encodeURIComponent(time)}`);
  };
  

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Reservas</h1>
        <p className="text-lg font-medium mb-4">{date}</p>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium">{slot.time}</span>
                <span
                  style={{ borderRadius: '6px' }}
                  className={`items-center w-16 text-center text-xs ${
                    slot.status === 'libre'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {slot.status}
                </span>
              </div>
              <Button
                onClick={() => handleReserve(slot.time)}
                disabled={slot.status === 'ocupado'}
                className="text-xs py-1 h-6 bg-[#FF5533] hover:bg-[#FF5533]/90 text-white"
                style={{ borderRadius: '6px' }}
              >
                Reservar
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="bg-black text-white hover:bg-black/90"
        >
          Atrás
        </Button>
      </main>
      <Footer />
    </div>
  );
}
