import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/Footer";
import BackButton from "@/components/BackButton";

export default function CanchasReserva() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courts, setCourts] = useState([]);
  const [formattedTime, setFormattedTime] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedTime = queryParams.get("time");
  const selectedDate = queryParams.get("date");

  // Formatear fecha
  const fecha = new Date(`${selectedDate}T00:00:00`);
  const dia = fecha.getDay();
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaNombre = diaSemana[dia];
  const fechaFormateada = `${diaNombre} - ${selectedDate}`;

  // Cargar horarios seleccionados
  useEffect(() => {
    const fetchHorario = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/horarios/${selectedTime}`);
        const data = await response.json();
        if (data.status === 200) {
          const { horaInicio, horaFin } = data.horario;
          const formattedTime = `${horaInicio.slice(0, 5)} - ${horaFin.slice(0, 5)}`;
          setFormattedTime(formattedTime);
        }
      } catch (error) {
        console.error("Error fetching horario:", error);
      }
    };

    if (selectedTime) fetchHorario();
  }, [selectedTime]);

  // Cargar canchas
  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/disponibilidad/cancha?fecha=${selectedDate}&horario_id=${selectedTime}`);
        const data = await response.json();
        if (data.status === 200) {
          setCourts(data.canchas);
          console.log("Las canchas son", data.canchas); 
        }
      } catch (error) {
        console.error("Error fetching canchas:", error);
      }
    };

    if (selectedDate && selectedTime) fetchCanchas();
  }, [selectedDate, selectedTime]);

  const handleSubmit = e => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setShowModal(false);
    console.log("Reservando cancha:", selectedCourt);
    // Agregar lógica para reservar la cancha
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const Modal = ({ onConfirm, onCancel }) => (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white text-black z-20 p-4 rounded-xl shadow-lg w-11/12 md:w-1/3">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-4 lg:text-2xl">Confirmar Reserva</h2>
          <X onClick={onCancel} className="cursor-pointer" />
        </div>
        <p className="mb-6 lg:text-xl">Fecha: {fechaFormateada}</p>
        <p className="mb-6 lg:text-xl">Horario: {formattedTime}</p>
        <p className="mb-6 lg:text-xl">Cancha: {selectedCourt ? selectedCourt.nro : "No seleccionada"}</p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-naranja text-white lg:text-xl"
            style={{ borderRadius: "6px" }}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="grow max-w-2xl lg:max-w-full mx-auto lg:mx-0 p-6">
        <BackButton />
        <h1 className="text-2xl font-bold mb-2 lg:text-4xl">Reservas</h1>
        <h2 className="text-xl font-semibold mb-2 lg:text-2xl">{fechaFormateada}</h2>
        <h2 className="text-md text-gray-600 font-semibold mb-6 lg:text-xl">{formattedTime}</h2>

        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4 lg:text-2xl">Selecciona la Cancha:</h4>
          <div className="grid grid-cols-2 p-2 text-center gap-6 bg-white lg:mx-96" style={{ borderRadius: "8px" }}>
            <div>
              <h5 className="text-sm font-medium mb-3 lg:text-xl">Canchas Disponibles</h5>
              <div className="space-y-2">
              {console.log("Las canchas son", courts)}
                {courts.filter(court => court.disponible).map(court => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(court)}
                    style={{ borderRadius: "6px" }}
                    className={`w-full font-medium p-1 justify-start lg:text-xl text-white ${
                      selectedCourt && selectedCourt.id === court.id ? "bg-naranja" : "bg-verde hover:bg-naranja"
                    }`}
                  >
                    Cancha {court.nro} - {court.tipo}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium mb-3 lg:text-xl">Canchas Ocupadas</h5>
              <div className="space-y-2">
                {courts.filter(court => !court.disponible).map(court => (
                  <button
                    key={court.id}
                    disabled
                    style={{ borderRadius: "6px" }}
                    className="w-full font-medium p-1 justify-start lg:text-xl bg-gray-400 text-white cursor-not-allowed"
                  >
                    Cancha {court.nro} - {court.tipo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full justify-center flex">
          <div className="flex w-1/2 lg:text-xl justify-end">
            <button
              style={{ borderRadius: "6px" }}
              onClick={handleSubmit}
              disabled={!selectedCourt}
              className="bg-black p-2 w-1/2 text-white hover:bg-black/90 lg:w-fit lg:p-3"
            >
              Confirmar
            </button>
          </div>
        </div>
        {showModal && <Modal onConfirm={confirmSubmit} onCancel={closeModal} />}
      </main>
      <Footer />
    </div>
  );
}
