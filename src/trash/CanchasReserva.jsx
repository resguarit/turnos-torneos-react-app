import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BackButton from "@/components/BackButton";
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';
import useTimeout from '@/components/useTimeout';

export default function CanchasReserva() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courts, setCourts] = useState([]);
  const [formattedTime, setFormattedTime] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de carga

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
        const response = await api.get(`/horarios/${selectedTime}`);
        const data = response.data;
        if (data.status === 200) {
          const { hora_inicio, hora_fin } = data.horario;
          const formattedTime = `${hora_inicio.slice(0, 5)} - ${hora_fin.slice(0, 5)}`;
          setFormattedTime(formattedTime);
        }
      } catch (error) {
        console.error("Error fetching horario:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTime) fetchHorario();
  }, [selectedTime]);

  useTimeout(() => {
    if (loading) {
      navigate('/error');
    }
  }, 15000);

  // Cargar canchas
  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        const response = await api.get(`/disponibilidad/cancha?fecha=${selectedDate}&horario_id=${selectedTime}`);
        const data = response.data;
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
    setLoading(true); // Iniciar estado de carga
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        setLoading(false);
        navigate(`/confirmar-turno?time=${selectedTime}&date=${selectedDate}&court=${selectedCourt.id}`);
        return;
    }

    try {
        // Primero verificar disponibilidad
        const disponibilidadResponse = await api.get(`/disponibilidad/cancha?fecha=${selectedDate}&horario_id=${selectedTime}`);
        const canchaDisponible = disponibilidadResponse.data.canchas.some(
            cancha => cancha.id === selectedCourt.id && cancha.disponible
        );

        if (!canchaDisponible) {
            setError('El turno ya no está disponible');
            setLoading(false);
            return;
        }

        // Crear bloqueo temporal
        const bloqueoResponse = await api.post('/turnos/bloqueotemporal', {
            fecha: selectedDate,
            horario_id: selectedTime,
            cancha_id: selectedCourt.id
        });

        if (bloqueoResponse.status === 201) {
            try {
                // Crear reserva
                const response = await api.post('/turnos/turnounico', {
                    fecha_turno: selectedDate,
                    cancha_id: selectedCourt.id,
                    horario_id: selectedTime,
                    estado: 'Pendiente'
                });
                
                if (response.status === 201) {
                    navigate('/user-profile');
                }
            } catch (reservaError) {
                // Si falla la creación de la reserva, liberar el bloqueo temporal
                await api.delete(`/turnos/bloqueotemporal/${bloqueoResponse.data.id}`);
                throw reservaError;
            }
        }
    } catch (error) {
        console.error("Error en la reserva:", error);
        setError(
            error.response?.data?.message || 
            'Error al crear la reserva. Por favor, intente nuevamente.'
        );
    } finally {
        setLoading(false);
    }
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
        <p className="mb-6 lg:text-xl">Cancha: {selectedCourt.nro} - {selectedCourt.tipo}</p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-naranja text-white lg:text-xl"
            style={{ borderRadius: "6px" }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Reservar'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div><Loading /></div>;
  }

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
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </main>
      <Footer />
    </div>
  );
}