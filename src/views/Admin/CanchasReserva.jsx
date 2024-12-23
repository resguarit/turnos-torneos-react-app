import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

const courtsData = [
  { id: 1, name: "Cancha 1", schedules: ["17:00 - 18:00", "19:00 - 20:00"] },
  { id: 2, name: "Cancha 2", schedules: ["18:00 - 19:00"] },
  { id: 3, name: "Cancha 3", schedules: [] },
  { id: 4, name: "Cancha 4", schedules: ["18:00 - 19:00", "21:00 - 22:00"] },
  { id: 5, name: "Cancha 5", schedules: ["22:00 - 23:00"] },
];

export default function CanchasReserva() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courts, setCourts] = useState([]);

  const queryParams = new URLSearchParams(location.search);
  console.log("Query string recibido:", location.search);
  const selectedTime = queryParams.get("time");
  console.log("Horario seleccionado (decoded):", selectedTime);


  useEffect(() => {
    // Determinar disponibilidad de canchas según el horario
    const updatedCourts = courtsData.map(court => ({
      ...court,
      available: !court.schedules.includes(selectedTime),
    }));
    setCourts(updatedCourts);
  }, [selectedTime]);

  const handleConfirm = () => {
    if (selectedCourt) {
      console.log('Confirmed reservation for court:', selectedCourt);
      navigate('/reservas/confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Reservas</h1>
        <h2 className="text-md text-gray-600 font-semibold mb-6">{selectedTime}</h2>

        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">Selecciona la Cancha:</h4>
          <div className="grid grid-cols-2 p-2 text-center gap-6 bg-white" style={{borderRadius: '8px'}}>  
            <div className=''>
              <h5 className="text-sm font-medium mb-3">Canchas Disponibles</h5>
              <div className="space-y-2">
                {courts.filter(court => court.available).map(court => (
                  <Button
                    key={court.id}
                    onClick={() => setSelectedCourt(court.id)}
                    variant="outline"
                    style={{ borderRadius: '6px' }}
                    className={`w-full justify-start ${
                      selectedCourt === court.id
                        ? 'bg-verde hover:bg-green-50 text-white'
                        : 'bg-verde hover:bg-green-50 text-white'
                    }`}
                  >
                    {court.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-3">Canchas Ocupadas</h5>
              <div className="space-y-2">
                {courts.filter(court => !court.available).map(court => (
                  <Button
                  style={{ borderRadius: '6px' }}
                    key={court.id}
                    disabled
                    variant="outline"
                    className="w-full justify-start bg-slate-400 text-black"
                  >
                    {court.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="bg-black text-white hover:bg-black/90"
          >
            Atrás
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCourt}
            className="bg-black text-white hover:bg-black/90"
          >
            Confirmar
          </Button>
        </div>
      </main>
    </div>
  );
}
