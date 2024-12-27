import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from '@/components/Footer';
import { X } from 'lucide-react';

const courtsData = [
  { id: 1, name: "Cancha 1", schedules: ["17:00 - 18:00", "19:00 - 20:00"] },
  { id: 2, name: "Cancha 2", schedules: ["18:00 - 19:00"] },
  { id: 3, name: "Cancha 3", schedules: [] },
  { id: 4, name: "Cancha 4", schedules: ["18:00 - 19:00", "21:00 - 22:00"] },
  { id: 5, name: "Cancha 5", schedules: ["22:00 - 23:00"] },
];

export default function CanchasReserva() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courts, setCourts] = useState([]);

  const queryParams = new URLSearchParams(location.search);
  const selectedTime = queryParams.get("time");
  const selectedDate = queryParams.get("date");

  const fecha = new Date(`${selectedDate}T00:00:00`);
  const dia = fecha.getDay();
  const diaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaNombre = diaSemana[dia];
  const fechaFormateada = `${diaNombre} - ${selectedDate}`;

  useEffect(() => {
    // Determinar disponibilidad de canchas según el horario
    const updatedCourts = courtsData.map(court => ({
      ...court,
      available: !court.schedules.includes(selectedTime),
    }));
    setCourts(updatedCourts);
  }, [selectedTime]);

    const handleSubmit = (e) => {
      e.preventDefault();
      setShowModal(true); // Mostrar modal de confirmación
  };

  const confirmSubmit = async () => {
      setShowModal(false); // Cierra el modal
      // Lógica para reservar la cancha
  };

  const Modal = ({ onConfirm, onCancel }) => (
      <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-black z-20 p-4 rounded-xl  shadow-lg w-11/12 md:w-1/3">
          <div className="flex justify-between">
              <h2 className="text-xl font-bold mb-4">Confirmar Reserva  </h2>
              <X onClick={onCancel}/>
              </div>
              <p className="mb-6">Desea confirmar?</p>
              <div className="flex justify-center">
                  <button
                      onClick={onConfirm}
                      className="px-4 py-2 bg-naranja text-white"
                  style={{ borderRadius: '6px' }}
                  >
                      Reservar
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Reservas</h1>
        <h2 className="text-xl font-semibold mb-2">{fechaFormateada}</h2>
        <h2 className="text-md text-gray-600 font-semibold mb-6">{selectedTime}</h2>

        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Selecciona la Cancha:</h4>
          <div className="grid grid-cols-2 p-2 text-center gap-6 bg-white" style={{borderRadius: '8px'}}>  
            <div className=''>
              <h5 className="text-sm font-medium mb-3">Canchas Disponibles</h5>
              <div className="space-y-2">
                {courts.filter(court => court.available).map(court => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(court.id)}
                    style={{ borderRadius: '6px' }}
                    className='bg-verde hover:bg-naranja text-white w-full font-medium p-1 justify-start'>
                    {court.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-3">Canchas Ocupadas</h5>
              <div className="space-y-2">
                {courts.filter(court => !court.available).map(court => (
                  <button
                    style={{ borderRadius: '6px' }}
                    key={court.id}
                    disabled
                    className="p-1 font-medium w-full justify-start bg-slate-300 text-neutral-900"
                  >
                    {court.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            style={{ borderRadius: '6px' }}
            onClick={() => navigate(-1)}
            className="bg-black p-2 w-1/2 text-white hover:bg-black/90"
          >
            Atrás
          </button>
          <button
            style={{ borderRadius: '6px' }}
            onClick={handleSubmit}
            disabled={!selectedCourt}
            className="bg-black p-2 w-1/2 text-white hover:bg-black/90"
          >
            Confirmar
          </button>
        </div>
        {showModal && <Modal onConfirm={confirmSubmit} onCancel={() => setShowModal(false)} />}
      </main>
      <Footer></Footer>
    </div>
  );
}