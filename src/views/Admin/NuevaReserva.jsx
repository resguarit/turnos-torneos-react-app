import React, { useState, useEffect } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import api from '@/lib/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function NuevaReserva() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTimeName, setSelectedTimeName] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [times, setTimes] = useState([]);
  const [courts, setCourts] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const fetchAvailability = async (date) => {
    try {
      const response = await api.get(`/disponibilidad/fecha?fecha=${date}`);
      const availabilityStatus = response.data.horarios
        .filter(horario => horario.disponible) // Filtrar horarios disponibles
        .map((horario) => {
          const timeSlot = `${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`;
          const id = horario.id;
          return { id: id, time: timeSlot, status: "libre" };
        });
      setAvailability(availabilityStatus);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
    }
  };

  

  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
        const response = await api.get(`/disponibilidad/cancha?fecha=${formattedDate}&horario_id=${selectedTime}`);
        const data = response.data;
        if (data.status === 200) {
          const availableCourts = data.canchas.filter(court => court.disponible);
          setCourts(availableCourts);
          console.log("Las canchas son", data.canchas); 
        }
      } catch (error) {
        console.error("Error fetching canchas:", error);
      }
    };

    if (selectedDate && selectedTime) fetchCanchas();
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      fetchAvailability(formattedDate);
    }
  }, [selectedDate]);

  const handleTimeSlotClick = (courtId, time) => {
    setSelectedCourt(`Cancha ${courtId}`);
    setSelectedTime(time);
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        navigate(`/confirmar-turno?time=${selectedTime}&date=${formattedDate}&court=${selectedCourt}`);
        return;
    }

    try {
      // Primero verificar disponibilidad
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
       const disponibilidadResponse = await api.get(`/disponibilidad/cancha?fecha=${formattedDate}&horario_id=${selectedTime}`);
      const canchaDisponible = disponibilidadResponse.data.canchas.some(
          cancha => cancha.id === selectedCourt && cancha.disponible
      );

      /* if (!canchaDisponible) {
          setError('El turno ya no está disponible');
          return;
      }
  */
      // Crear bloqueo temporal
      const bloqueoResponse = await api.post('/turnos/bloqueotemporal', {
          fecha: formattedDate,
          horario_id: selectedTime,
          cancha_id: selectedCourt
      });

      if (bloqueoResponse.status === 201) {
          try {
              // Crear reserva
              const response = await api.post('/turnos/turnounico', {
                  fecha_turno: formattedDate,
                  cancha_id: selectedCourt,
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
        <p className="mb-6 lg:text-xl">Fecha: {selectedDate ? format(selectedDate, "dd/MM/yyyy") : ''}</p>
        <p className="mb-6 lg:text-xl">Horario: {selectedTimeName}</p>
        <p className="mb-6 lg:text-xl">Cancha: {selectedCourt}</p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-naranja text-white lg:text-xl"
          >Confirmar
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="rounded-2xl bg-white">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Reserva tu cancha</h2>

              <Carousel className="w-full">
                <CarouselContent>
                  {/* Step 1: Select Date */}
                  <CarouselItem>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Selecciona una fecha
                      </h3>
                      <div className="flex justify-between items-center mb-4">
                        <Button className="rounded-[10px]" variant="outline" size="icon" onClick={handlePrevWeek}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{format(currentWeekStart, "MMMM yyyy", { locale: es })}</span>
                        <Button className="rounded-[10px]" variant="outline" size="icon" onClick={handleNextWeek}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => (
                          <Button
                            key={day.toISOString()}
                            variant={selectedDate?.toDateString() === day.toDateString() ? "default" : "outline"}
                            className={`flex flex-col items-center rounded-[8px] p-2 h-auto ${
                              selectedDate?.toDateString() === day.toDateString()
                                ? "bg-naranja hover:bg-naranja/90 text-white"
                                : ""
                            }`}
                            onClick={() => setSelectedDate(day)}
                          >
                            <span className="text-xs">{format(day, "EEE", { locale: es })}</span>
                            <span className="text-lg">{format(day, "d")}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 2: Select Time */}
                  <CarouselItem>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Selecciona un horario
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {availability.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTime === slot.id ? "default" : "outline"}
                            className={selectedTime === slot.id ? "bg-naranja hover:bg-naranja/90 rounded-[8px] text-white" : "rounded-[8px]"}
                            onClick={() => {
                              setSelectedTime(slot.id); 
                              setSelectedTimeName(slot.time);
                            }}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Select Court */}
                  <CarouselItem>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Selecciona una cancha</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {courts.map((court) => (
                          <Button
                            key={court.id}
                            variant={selectedCourt === court.nro ? "default" : "outline"}
                            className={`h-auto flex rounded-[8px] flex-col items-start p-4 ${
                              selectedCourt === court.nro ? "bg-naranja hover:bg-naranja/90 text-white" : ""
                            }`}
                            onClick={() => setSelectedCourt(court.nro)}
                          >
                            <span className="font-bold">Cancha {court.nro}</span>
                            <span className="text-sm">{court.tipo_cancha}</span>
                            <span className="text-sm mt-2">${court.precio_por_hora}</span>
                            <span className="text-sm mt-2">${court.seña}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-medium">Resumen de reserva</p>
                    {selectedDate && <p className="text-sm text-gray-600">Fecha: {format(selectedDate, "dd/MM/yyyy")}</p>}
                    {selectedTime && <p className="text-sm text-gray-600">Hora: {selectedTimeName}</p>}
                    {selectedCourt && <p className="text-sm text-gray-600">Cancha: {selectedCourt}</p>}
                  </div>
                  <Button
                    className="bg-naranja hover:bg-naranja/90 text-white rounded-[8px]"
                    disabled={!selectedDate || !selectedTime || !selectedCourt}
                    onClick={handleSubmit}
                  >
                    Confirmar Reserva
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      {showModal && <Modal onConfirm={confirmSubmit} onCancel={closeModal} />}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
