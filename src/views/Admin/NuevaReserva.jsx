import React, { useState, useEffect, useRef } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import api from '@/lib/axiosConfig';
import { useNavigate } from 'react-router-dom';
import LoadingSinHF from "@/components/LoadingSinHF";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, User, Clock, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [loadingCancha, setLoadingCancha] = useState(false);
  const [user, setUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const navigate = useNavigate();
  const carouselRef = useRef(null); // Referencia para el carrusel
  const horariosRef = useRef(null); // Referencia para la sección de horarios
  const canchasRef = useRef(null); // Referencia para la sección de canchas

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const response = await api.get(`/usuarios/${userId}`);
          const userData = response.data.user;
          setUser(userData); // Almacenar el usuario completo en el estado
          console.log("El usuario es", userData);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };
  
    fetchUserDetails();
  }, []);

  const fetchAvailability = async (date) => {
    try {
      setLoadingHorario(true);
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
      setLoadingHorario(false);
    }
  };

  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        setLoadingCancha(true);
        const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
        const response = await api.get(`/disponibilidad/cancha?fecha=${formattedDate}&horario_id=${selectedTime}`);
        const data = response.data;
        if (data.status === 200) {
          const availableCourts = data.canchas.filter(court => court.disponible);
          setCourts(availableCourts);
        }
      } catch (error) {
        console.error("Error fetching canchas:", error);
      } finally {
        setLoadingCancha(false);
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
    setSelectedCourt();
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
    setConfirmLoading(true);
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        navigate(`/confirmar-turno?time=${selectedTime}&date=${formattedDate}&court=${selectedCourt.id}`);
        setConfirmLoading(false);
        return;
    }

    try {
      // Primero verificar disponibilidad
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
       const disponibilidadResponse = await api.get(`/disponibilidad/cancha?fecha=${formattedDate}&horario_id=${selectedTime}`);
      const canchaDisponible = disponibilidadResponse.data.canchas.some(
          cancha => cancha.id === selectedCourt.id && cancha.disponible
      );

      /*  if (!canchaDisponible) {
          setError('El turno ya no está disponible');
          return;
      } */
  
      // Crear bloqueo temporal
      const bloqueoResponse = await api.post('/turnos/bloqueotemporal', {
          fecha: formattedDate,
          horario_id: selectedTime,
          cancha_id: selectedCourt.id
      });

      if (bloqueoResponse.status === 201) {
          try {
              // Crear reserva
              const response = await api.post('/turnos/turnounico', {
                  fecha_turno: formattedDate,
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
    setConfirmLoading(false);
  }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const response = await api.get(`/usuarios/${userId}`);
          const user = response.data;
          setUsername(user.nombre); // Asumiendo que el nombre del usuario está en la propiedad 'nombre'
          setDni(user.dni); // Asumiendo que el DNI del usuario está en la propiedad 'dni'
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };
  
    fetchUserDetails();
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  const señaPercentage = selectedCourt ? (selectedCourt.seña / selectedCourt.precio_por_hora) * 100 : 0;

  const Modal = ({ onConfirm, onCancel, selectedDate, selectedTimeName, selectedCourt, user }) => (
    <Dialog open={showModal} onClose={onCancel}>
      <DialogContent className="max-w-[250px] lg:max-w-[400px] p-0 rounded-2xl">
        <div className="md:p-6 p-4 space-y-3 md:space-y-6 ">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl font-semibold text-center">
              Detalles de la Reserva
            </DialogTitle>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              Rock & Gol 520 esq. 20
            </div>
          </DialogHeader>
  
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Fecha y Hora</p>
                  <div className="flex full justify-between items-center">
                    <p className="font-medium text-xs md:text-sm">{selectedDate}</p>
                    <p className="font-medium text-xs md:text-sm"> {selectedTimeName}</p>
                  </div>
                </div>
              </div>
  
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Duración y Cancha</p>
                  <div className="flex w-full justify-between items-center">
                    <p className="font-medium text-xs md:text-sm">60 min </p>
                    <p className="font-medium text-xs md:text-sm">Cancha {selectedCourt.nro} - {selectedCourt.tipo} </p>
                  </div>
                </div>
              </div>
            </div>
  
            {user && (
              <div className="pt-3 md:pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Reservado por</p>
                    <div className="flex justify-between">
                      <p className="font-medium text-xs md:text-sm">{user.name}</p>
                      <p className="text-gray-500 text-xs md:text-sm">DNI: {user.dni}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
  
            <div className="pt-3 md:pt-4 border-t">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Resumen de pago</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <p className="text-xs md:text-sm">Total</p>
                      <p className="font-medium text-xs md:text-sm">${selectedCourt.precio_por_hora}</p>
                    </div>
                    
                    <div className="flex justify-between text-naranja">
                      <p className="text-xs md:text-sm">Seña ({señaPercentage.toFixed(0)}%)</p>
                      <p className="font-medium text-xs md:text-sm">${selectedCourt?.seña}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="space-y-3">
            <button 
              className="text-sm md:text-base w-full bg-naranja hover:bg-naranja/90 text-white rounded-[10px] py-2"
              onClick={onConfirm}
              disabled={confirmLoading}
            >
              {confirmLoading ? 'Cargando...' : 'Confirmar Reserva'}
            </button>
            <button 
              variant="outline"
              className=" text-sm md:text-base w-full rounded-[10px] py-2 border border-black "
              onClick={onCancel}
              disabled={confirmLoading}
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-1 md:p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="rounded-2xl bg-white">
            <CardContent className="md:p-6 py-4 ">
              <h2 className="text-2xl font-bold md:mb-6 mb-3 md:text-start text-center">Reserva tu cancha</h2>

              <Carousel className="w-full" ref={carouselRef}>
                <CarouselContent>
                  {/* Step 1: Select Date */}
                  <CarouselItem>
                    <div className="md:p-4 p-3">
                      <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 md:justify-start justify-center">
                        <CalendarDays className="w-4 h-4 md:w-5 md:h-5" />
                        Selecciona una fecha
                      </h3>
                      <div className="flex justify-between items-center mb-4">
                        <Button className="rounded-[10px]" variant="ghost" size="icon" onClick={handlePrevWeek}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{format(currentWeekStart, "MMMM yyyy", { locale: es })}</span>
                        <Button className="rounded-[10px]" variant="ghost" size="icon" onClick={handleNextWeek}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-7 ">
                        {weekDays.map((day) => (
                          <Button
                            key={day.toISOString()}
                            variant={selectedDate?.toDateString() === day.toDateString() ? "default" : "outline"}
                            className={`flex flex-col items-center rounded-[8px] p-2 h-auto ${
                              selectedDate?.toDateString() === day.toDateString()
                                ? "bg-naranja hover:bg-naranja/90 text-white"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedDate(day);
                              console.log("La fecha seleccionada es", selectedDate);
                              horariosRef.current.scrollIntoView({ behavior: "smooth" }); // Desplazar a la sección de horarios
                            }}
                          >
                            <span className="text-xs">{format(day, "EEE", { locale: es })}</span>
                            <span className="text-lg">{format(day, "d")}</span>
                          </Button>
                        ))}
</div>

                    </div>
                  </CarouselItem>

                  {/* Step 2: Select Time */}
                  <CarouselItem ref={horariosRef} className="">
                    <div className="md:p-4 p-0  md:justify-start flex flex-col justify-center">
                      <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 md:justify-start justify-center">
                        <Clock className="w-4 h-4 md:w-5 md:h-5" />
                        Selecciona un horario
                      </h3>
                      <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-3 ">
                      {loadingHorario ? (
                          <div className="col-span-3 flex justify-center items-center">
                            <LoadingSinHF />
                          </div>
                        ) : (
                          availability.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedTime === slot.id ? "default" : "outline"}
                              className={selectedTime === slot.id ? "bg-naranja hover:bg-naranja/90 rounded-[8px] text-white" : " rounded-[8px]"}
                              onClick={() => {
                                setSelectedTime(slot.id); 
                                setSelectedTimeName(slot.time);
                                canchasRef.current.scrollIntoView({ behavior: 'smooth' }); // Desplazar a la sección de canchas
                              }}
                            >
                              {slot.time}
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Step 3: Select Court */}
                  <CarouselItem ref={canchasRef}>
                  <div className="md:p-4 p-0  md:justify-start flex flex-col justify-center">
                  <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 md:justify-start justify-center">Selecciona una cancha</h3>
                      <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-3 ">
                      {loadingCancha ? (
                          <div className="col-span-2 flex justify-center items-center">
                            <LoadingSinHF />
                          </div>
                        ) : (
                          courts.map((court) => (
                            <Button
                              key={court.id}
                              variant={selectedCourt === court ? "default" : "outline"}
                              className={`h-auto w-[80%] lg:w-auto flex rounded-[8px] flex-col items-start p-2 md:p-4 ${
                                selectedCourt === court ? "bg-naranja hover:bg-naranja/90 text-white" : ""
                              }`}
                              onClick={() => setSelectedCourt(court)}
                            >
                              <span className="font-bold md:text-base text-sm">Cancha {court.nro} - {court.tipo}</span>
                              <span className="md:text-sm text-xs">Precio: ${court.precio_por_hora}</span>
                              <span className="md:text-sm text-xs">Seña: ${court.seña}</span>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>

              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-medium md:text-base text-sm">Resumen de reserva</p>
                    {selectedDate && <p className="text-xs md:text-sm text-gray-600">Fecha: {format(selectedDate, "dd/MM/yyyy")}</p>}
                    {selectedTime && <p className=" text-xs md:text-sm text-gray-600">Hora: {selectedTimeName}</p>}
                    {selectedCourt && <p className="text-xs md:text-sm text-gray-600">Cancha: {selectedCourt.nro}</p>}
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
      {showModal && (
      <Modal 
          onConfirm={confirmSubmit} 
          onCancel={closeModal}            
          selectedDate={selectedDate ? format(selectedDate, "dd/MM/yyyy") : ''}
          selectedTimeName={selectedTimeName}
          selectedCourt={selectedCourt}
          user={user}
          />
        )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
