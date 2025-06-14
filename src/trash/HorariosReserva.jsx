import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BackButton from "@/components/BackButton";
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';
import useTimeout from '@/components/useTimeout';

export default function HorariosReserva() {
  const { date } = useParams(); // Obtener la fecha de la URL
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const dia = new Date(`${date}T00:00:00`).getDay();
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const fechaFormateada = `${diaSemana[dia]} - ${date}`;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener horarios y disponibilidad
    api.get(`/disponibilidad/fecha?fecha=${date}`)
      .then(response => {
        const availabilityStatus = response.data.horarios.map((horario) => {
          const timeSlot = `${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`;
          const id = horario.id;
          return { id: id, time: timeSlot, status: horario.disponible ? "libre" : "ocupado" };
        });
        setAvailability(availabilityStatus);
      })
      .catch(error => console.error('Error fetching availability:', error))
      .finally(() => setLoading(false));
  }, [date]);

  useTimeout(() => {
    if (loading) {
      navigate('/error');
    }
  }, 20000);

  const handleReserve = (id) => {
    navigate(
      `/canchas-reserva?time=${encodeURIComponent(id)}&date=${encodeURIComponent(
        date
      )}`
    );
  };

  if (loading) {
    return <div><Loading /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="grow max-w-2xl lg:max-w-full lg:mx-0 mx-auto p-6">
        <BackButton />
        <h1 className="text-2xl font-bold mb-2 lg:text-4xl">Reservas</h1>
        <p className="text-lg font-medium mb-4 lg:text-2xl">{fechaFormateada}</p>
        <div className="flex justify-center"> 
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 lg:w-1/2">
            {availability.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                {console.log(slot)}
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
                  onClick={() => handleReserve(slot.id)}
                  disabled={slot.status === "ocupado"}
                  className="text-sm lg:text-xl w-fit p-1 lg:p-2 bg-naranja items-center hover:bg-naranja/90 text-white"
                  style={{ borderRadius: "4px" }}
                >
                  Reservar
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}