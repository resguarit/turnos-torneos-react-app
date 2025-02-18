import React, { useState, useEffect, useRef } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { toast } from "react-toastify";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Volver from "@/components/Reserva/Volver";
import {Footer} from "../../components/Footer";
import DateSelector from "@/components/Reserva/DateSelector";
import TimeSelector from "@/components/Reserva/TimeSelector";
import CourtSelector from "@/components/Reserva/CourtSelector";
import ReservationSummary from "@/components/Reserva/ReservationSummary";
import ReservationModal from "@/components/Reserva/ReservationModal";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";

export default function NuevaReserva() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTimeName, setSelectedTimeName] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [availability, setAvailability] = useState([]);
  const [courts, setCourts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [loadingCancha, setLoadingCancha] = useState(false);
  const [user, setUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const horariosRef = useRef(null);
  const canchasRef = useRef(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const response = await api.get(`/usuarios/${userId}`);
          const userData = response.data.user;
          setUser(userData);
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
        .filter(horario => horario.disponible)
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
    const token = localStorage.getItem('token');
    
    if (!token) {
      localStorage.setItem('reservaTemp', JSON.stringify({
        fecha: format(selectedDate, 'yyyy-MM-dd'),
        horario_id: selectedTime,
        cancha_id: selectedCourt.id,
        monto_total: selectedCourt.precio_por_hora,
        monto_seña: selectedCourt.seña
      }));
      setShowModal(false);
      navigate(`/confirmar-turno?time=${selectedTime}&date=${format(selectedDate, 'yyyy-MM-dd')}&court=${selectedCourt.id}`);
      return;
    }
  
    setConfirmLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const bloqueoResponse = await api.post('/turnos/bloqueotemporal', {
        fecha: formattedDate,
        horario_id: selectedTime,
        cancha_id: selectedCourt.id
      });
  
      if (bloqueoResponse.status === 201) {
        localStorage.setItem('bloqueoTemp', JSON.stringify({
          id: bloqueoResponse.data.bloqueo.id,
          fecha: bloqueoResponse.data.bloqueo.fecha,
          horario_id: bloqueoResponse.data.bloqueo.horario_id,
          cancha_id: bloqueoResponse.data.bloqueo.cancha_id,
          expira_en: bloqueoResponse.data.bloqueo.expira_en
        }));
        
        localStorage.setItem('reservaTemp', JSON.stringify({
          fecha: formattedDate,
          horario_id: selectedTime,
          cancha_id: selectedCourt.id,
          monto_total: selectedCourt.precio_por_hora,
          monto_seña: selectedCourt.seña
        }));
  
        setShowModal(false);
        navigate('/bloqueo-reserva');
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error.response?.data?.message || 'Error al crear el bloqueo temporal');
    } finally {
      setConfirmLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedDate) return;
    if (currentStep === 1 && !selectedTime) return;
    carouselRef.current?.scrollNext();
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    carouselRef.current?.scrollPrev();
    setCurrentStep((prev) => prev - 1);
  };

  const isNextDisabled = () => {
    if (currentStep === 0 && !selectedDate) return true;
    if (currentStep === 1 && !selectedTime) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <Volver />
      <main className="flex-grow p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto ">
          <Card className="rounded-2xl bg-white">
            <CardContent className="md:p-6 py-4 ">
              <h2 className="text-2xl font-bold md:mb-6 mb-3 md:text-start text-center">Reserva tu cancha</h2>

              <Carousel className="w-full" ref={carouselRef}>
                <CarouselContent>
                  <CarouselItem>
                    <DateSelector
                      currentWeekStart={currentWeekStart}
                      weekDays={weekDays}
                      today={today}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      handlePrevWeek={handlePrevWeek}
                      handleNextWeek={handleNextWeek}
                      horariosRef={horariosRef}
                    />
                  </CarouselItem>

                  <CarouselItem ref={horariosRef} className="">
                    <TimeSelector
                      loadingHorario={loadingHorario}
                      availability={availability}
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                      setSelectedTimeName={setSelectedTimeName}
                      canchasRef={canchasRef}
                    />
                  </CarouselItem>

                  <CarouselItem ref={canchasRef}>
                    <CourtSelector
                      loadingCancha={loadingCancha}
                      courts={courts}
                      selectedCourt={selectedCourt}
                      setSelectedCourt={setSelectedCourt}
                    />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious onClick={handlePrev} />
                <CarouselNext onClick={handleNext} disabled={isNextDisabled()} />
              </Carousel>

              <ReservationSummary
                selectedDate={selectedDate}
                selectedTimeName={selectedTimeName}
                selectedCourt={selectedCourt}
                handleSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      {showModal && (
        <ReservationModal
          showModal={showModal}
          confirmLoading={confirmLoading}
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
