import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalConfirmation from '@/components/ModalConfirmation';
import CancelacionTurnoAdminModal from '@/components/PanelAdmin/VerTurnos/CancelacionTurnoAdminModal';
import PageHeader from '@/components/PanelAdmin/VerTurnos/TurnoHeader';
import UnifiedDateSelector from '@/components/PanelAdmin/VerTurnos/UnifiedDateSelector';
import FilterControls from '@/components/PanelAdmin/VerTurnos/TurnoFilterControls';
import TurnoList from '@/components/PanelAdmin/VerTurnos/TurnoList';
import SearchBar from '@/components/PanelAdmin/VerTurnos/TurnoSearchBar';
import { Button } from '@/components/ui/button';
import CrearTurnoFijoModal from '@/components/PanelAdmin/VerTurnos/CrearTurnoFijoModal';
import BtnLoading from '@/components/BtnLoading';
import TurnoCard from '@/components/PanelAdmin/VerTurnos/TurnoCard';

function VerTurnos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewOption, setViewOption] = useState('day'); // 'day' or 'range'
  const [searchType, setSearchType] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateReset, setDateReset] = useState(false);
  const [showTurnoFijoModal, setShowTurnoFijoModal] = useState(false);
  const filterRef = useRef(null);
  const [selectedTipos, setSelectedTipos] = useState([]);
  const [eventosPagados, setEventosPagados] = useState({});
  const [showModalEvento, setShowModalEvento] = useState(false);
  const [showCancelTurnoAdminModal, setShowCancelTurnoAdminModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const queryParams = new URLSearchParams(location.search);
    const usuarioDni = queryParams.get('usuario');
    const idTurno = queryParams.get('id');

    if (idTurno) {
      setSearchType('id');
      setSearchTerm(idTurno);
      handleSearch('id', idTurno, signal);
    }

    if (usuarioDni) {
      setSearchType('dni');
      setSearchTerm(usuarioDni);
      handleSearch('dni', usuarioDni, signal);
    } else {
      if ((startDate && endDate) || (!startDate && !endDate)) {
        fetchTurnos(signal);
      }
    }

    return () => {
      controller.abort();
    };
  }, [location.search, selectedDate, startDate, endDate]);

  const fetchTurnos = async (signal) => {
    setLoading(true);
    let url = '/turnos';
    const params = {};

    if (viewOption === 'day' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      url += `?fecha=${formattedDate}`;
    } else if (viewOption === 'range' && startDate && endDate) {
      const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      url += `?fecha_inicio=${formattedStartDate}&fecha_fin=${formattedEndDate}`;
    }

    if (searchTerm && searchType) {
      params.searchType = searchType;
      params.searchTerm = searchTerm;
    }

    try {
      // 1. Traer turnos normales
      const response = await api.get(url, { params, signal });
      let bookings = response.data.turnos || [];

      // 2. Traer eventos como turnos
      const eventosResponse = await api.get('/eventosComoTurnos', { signal });
      const eventosTurnos = eventosResponse.data.eventos_turnos || [];

      // 3. Adaptar eventosTurnos al formato de booking y agregarlos
      const eventosAdaptados = eventosTurnos.map(ev => ({
        id: `evento-${ev.evento_id}-${ev.horario.id}`,
        tipo: 'evento',
        evento_id: ev.evento_id,
        nombre: ev.nombre,
        descripcion: ev.descripcion,
        monto: ev.monto,
        fecha_turno: ev.fecha,
        horario: ev.horario,
        canchas: ev.canchas,
        persona: ev.persona,
        estado: ev.estado_combinacion,
      }));
      console.log("Eventos adaptados:", eventosAdaptados);

      // 4. Unir bookings y eventosAdaptados
      const allBookings = [...bookings, ...eventosAdaptados];

      // 5. Agrupar por fecha
      const grouped = allBookings.reduce((acc, booking) => {
        const date = booking.fecha_turno.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(booking);
        return acc;
      }, {});
      setGroupedBookings(grouped);
    } catch (error) {
      if (!signal?.aborted){
        console.error('Error fetching reservations:', error);
        toast.error('Error al cargar los turnos');
      }
    } finally {
      if(!signal?.aborted){
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    api.get('/canchas', {signal})
      .then(response => setCourts(response.data.canchas))
      .catch(error => {
        if (!signal?.aborted){
          console.error('Error fetching courts:', error)
        }
      });

    return () => {
      controller.abort();
    }
  }, []);

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  const handleRangeChange = (range) => {
    setStartDate(range?.from || null);
    setEndDate(range?.to || null);

    if (range?.from && range?.to) {
      setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  const handleFilterToggle = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handleSearch = async (type = searchType, term = searchTerm, signal) => {
    setLoading(true);
    let url = '/turnos';
    const params = {
      searchType: type,
      searchTerm: term
    };

    if (viewOption === 'day' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      url += `?fecha=${formattedDate}`;s
    } else if (viewOption === 'range' && startDate && endDate) {
      const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      url += `?fecha_inicio=${formattedStartDate}&fecha_fin=${formattedEndDate}`;
    }

    try {
      const response = await api.get(url, { params, signal });
      const grouped = response.data.turnos.reduce((acc, booking) => {
        const date = booking.fecha_turno.split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(booking);
        return acc;
      }, {});
      setGroupedBookings(grouped);
    } catch (error) {
      if (!signal?.aborted){
        console.error('Error fetching reservations:', error);
        toast.error('Error al buscar los turnos');
      }
    } finally {
      if (!signal?.aborted){
        setLoading(false);
      }
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignora la hora

  // Ajuste: restar un día para evitar desfase por zona horaria
  const todayMinusOne = new Date(today);
  todayMinusOne.setDate(todayMinusOne.getDate() - 1);

  const isFilteringByDate =
    (viewOption === 'day' && selectedDate) ||
    (viewOption === 'range' && startDate && endDate);

  const filteredBookings = Object.keys(groupedBookings).reduce((acc, date) => {
    const dateObj = new Date(date);
    let includeDate = true;

    if (isFilteringByDate) {
      if (viewOption === 'day' && selectedDate) {
        includeDate = dateObj.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
      } else if (viewOption === 'range' && startDate && endDate) {
        includeDate = dateObj >= new Date(startDate.setHours(0,0,0,0)) && dateObj <= new Date(endDate.setHours(0,0,0,0));
      }
    } else {
      includeDate = dateObj >= todayMinusOne;
    }

    if (!includeDate) return acc;

    const filtered = groupedBookings[date].filter(booking => {
      const matchesCourt = selectedCourt
        ? (booking.cancha?.nro === selectedCourt ||
          (booking.canchas && booking.canchas.some(c => c.nro === selectedCourt)))
        : true;
      const matchesStatus = selectedStatus.length > 0 ? selectedStatus.includes(booking.estado) : true;
      const matchesTipo = selectedTipos.length > 0 ? selectedTipos.includes(booking.tipo) : true;
      return matchesCourt && matchesStatus && matchesTipo;
    });
    if (filtered.length > 0) {
      acc[date] = filtered;
    }
    return acc;
  }, {});

  const handleDeleteSubmit = (booking) => {
    setSelectedBooking(booking);
    if (booking.tipo === 'evento') {
      setShowModalEvento(true);
    } else {
      setShowCancelTurnoAdminModal(true);
    }
    console.log("Turno seleccionado para cancelar:", booking);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setShowCancelTurnoAdminModal(false);
    setSelectedBooking(null);
  };

  const confirmDeleteSubmit = async () => {
    if (!selectedBooking || !selectedBooking.id) {
      toast.error('Error: No se ha seleccionado ningún turno para cancelar.');
      closeDeleteModal();
      return;
    }

    setShowCancelTurnoAdminModal(false);

    try {
      const response = await api.post(`/turnos/cancelar/${selectedBooking.id}`);
      
      if (response.status === 200) {
        toast.success(response.data.message || 'Turno cancelado correctamente');
        fetchTurnos();
      } else {
        toast.error(response.data.message || 'Error al cancelar el turno desde el backend');
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al conectar con el servidor para cancelar el turno.');
      }
    } finally {
      setSelectedBooking(null);
    }
  };

  const confirmDeleteEvento = async () => {
    if (!selectedBooking || !selectedBooking.evento_id) {
      toast.error('Error: No se ha seleccionado ningún evento para cancelar.');
      closeDeleteModalEvento();
      return;
    }
    setShowModalEvento(false);
    try {
      const response = await api.delete(`/eventos/${selectedBooking.evento_id}`);
      if (response.status === 200) {
        toast.success('Evento cancelado correctamente');
        fetchTurnos();
      }
    } catch (error) {
      toast.error('Error al cancelar el evento');
      console.error("Error canceling event:", error);
    } finally {
      setSelectedBooking(null);
    }
  };

  const closeDeleteModalEvento = () => {
    setShowModalEvento(false);
    setSelectedBooking(null);
  };

  const clearFilters = () => {
    setDateReset(true);
    setSelectedDate(null);
    setStartDate(null);
    setEndDate(null);
    setSearchType('name');
    setSearchTerm('');
    setSelectedCourt('');
    setSelectedStatus([]);
    setViewOption('day');
    fetchTurnos();
    setTimeout(() => setDateReset(false), 100); // Reset the flag
  };

  const handleUnifiedDateSelect = ({ type, date, startDate, endDate }) => {
    if (type === 'single') {
      setSelectedDate(date);
      setStartDate(null);
      setEndDate(null);
      setViewOption('day');
    } else {
      setSelectedDate(null);
      setStartDate(startDate);
      setEndDate(endDate);
      setViewOption('range');
    }
  };

  const handleTurnoFijoSuccess = () => {
    fetchTurnos();
  };

  const handlePagoRegistrado = (data) => {
    if (data && data.evento_id) {
      setEventosPagados(prev => ({
        ...prev,
        [data.evento_id]: true
      }));
    }
    fetchTurnos();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Fetch de estados de pago de eventos
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchEstadosPagoEventos = async () => {
      try {
        const res = await api.get('/estadoPago/eventos', { signal });
        if (res.data && res.data.eventos) {
          const pagos = {};
          res.data.eventos.forEach(ev => {
            pagos[ev.evento_id] = ev.estado_pago;
          });
          setEventosPagados(pagos);
        }
      } catch (err) {
        setEventosPagados({});
      }
    };

    fetchEstadosPagoEventos();

    return () => controller.abort();
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter">
        <ToastContainer position="top-right" />
        <main className="flex-1  bg-gray-100">
          <div className="mb-8">
            <div className="space-y-4">
              <div className="flex gap-6 items-center">
                <button
                  onClick={() => navigate('/nuevo-turno-admi')}
                  className="p-2 text-sm rounded-[6px] bg-naranja hover:bg-naranja/90 text-white"
                >
                  Crear Turno 
                </button>
                <button
                  onClick={() => navigate('/crear-evento')}
                  className="p-2 text-sm rounded-[6px] bg-naranja hover:bg-naranja/90 text-white"
                >
                  Crear Evento 
                </button>
                <button
                  onClick={() => navigate('/bloquear-turnos')}
                  className="p-2 text-sm rounded-[6px] bg-red-600 hover:bg-red-600/90 text-white"
                >
                  Bloquear Turnos
                </button>
              </div>
              <div className='flex w-full gap-4 flex-col sm:flex-row items-center sm:items-start relative'>
                <UnifiedDateSelector onDateSelect={handleUnifiedDateSelect} reset={dateReset} />
                <SearchBar
                  className="w-full"
                  searchType={searchType}
                  setSearchType={setSearchType}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleFilterToggle={handleFilterToggle}
                  handleSearch={handleSearch}
                  isFilterOpen={isFilterOpen}
                  clearFilters={clearFilters}
                />
                {isFilterOpen && (
                  <div className="absolute right-0 top-12 sm:top-10 z-50">
                    <FilterControls
                      selectedCourt={selectedCourt}
                      setSelectedCourt={setSelectedCourt}
                      selectedStatus={selectedStatus}
                      setSelectedStatus={setSelectedStatus}
                      courts={courts}
                      handleStatusChange={handleStatusChange}
                      onClose={() => setIsFilterOpen(false)}
                      selectedTipos={selectedTipos}
                      setSelectedTipos={setSelectedTipos}
                    />
                  </div>
                )}
              </div>
              {loading && (<div className='flex justify-center items-center h-[50vh]'>
    <BtnLoading />
    </div>)}
              {!loading && (
              <TurnoList
                filteredBookings={filteredBookings}
                handleDeleteSubmit={handleDeleteSubmit}
                onPagoRegistrado={handlePagoRegistrado}
                eventosPagados={eventosPagados}
              />
              )}
            </div>
          </div>
          {showModalEvento && 
            <ModalConfirmation 
              onConfirm={confirmDeleteEvento} 
              onCancel={closeDeleteModalEvento} 
              title="Cancelar Evento" 
              subtitle={"¿Está seguro de que desea cancelar este evento?"} 
              botonText1={"Volver"} 
              botonText2={"Confirmar Cancelación"} 
            />
          }
          {selectedBooking && showCancelTurnoAdminModal && (
            <CancelacionTurnoAdminModal
              isOpen={showCancelTurnoAdminModal}
              onClose={closeDeleteModal}
              onConfirm={confirmDeleteSubmit}
              turno={selectedBooking} 
            />
          )}
          {showTurnoFijoModal && (
          <CrearTurnoFijoModal
            isOpen={showTurnoFijoModal}
            onClose={() => setShowTurnoFijoModal(false)}
            courts={courts}
            onSuccess={handleTurnoFijoSuccess}
          />)}
        </main>
      </div>
    </>
  );
}

export default VerTurnos;