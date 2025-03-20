import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalConfirmation from '@/components/ModalConfirmation';
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

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const queryParams = new URLSearchParams(location.search);
    const usuarioDni = queryParams.get('usuario');
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
      const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];endDate.toISOString().split('T')[0];
      url += `?fecha_inicio=${formattedStartDate}&fecha_fin=${formattedEndDate}`;
    }

    if (searchTerm && searchType) {
      params.searchType = searchType;
      params.searchTerm = searchTerm;
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

  const filteredBookings = Object.keys(groupedBookings).reduce((acc, date) => {
    const filtered = groupedBookings[date].filter(booking => {
      const matchesCourt = selectedCourt ? booking.cancha.nro === selectedCourt : true;
      const matchesStatus = selectedStatus.length > 0 ? selectedStatus.includes(booking.estado) : true;
      return matchesCourt && matchesStatus;
    });
    if (filtered.length > 0) {
      acc[date] = filtered;
    }
    return acc;
  }, {});

  const handleDeleteSubmit = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    console.log("Turno seleccionado:", booking);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
  };

  const confirmDeleteSubmit = async () => {
    setShowModal(false);
    try {
      const response = await api.patch(`/turnos/${selectedBooking.id}`, { estado: 'Cancelado' });
      if (response.status === 200) {
        toast.success('Turno cancelado correctamente');
        // Actualiza el estado para reflejar la cancelación
        setSelectedBooking({ ...selectedBooking, estado: 'Cancelado' });
        setGroupedBookings(prev => {
          const updated = { ...prev };
          const date = selectedBooking.fecha_turno.split('T')[0];
          updated[date] = updated[date].map(booking => 
            booking.id === selectedBooking.id ? { ...booking, estado: 'Cancelado' } : booking
          );
          return updated;
        });
      }
    } catch (error) {
      toast.error('Error al cancelar el turno');
      console.error("Error canceling reservation:", error);
    }
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

  const handlePagoRegistrado = () => {
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

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter">
        <main className="flex-1 mt-4 bg-gray-100">
          <div className="mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate('/nuevo-turno-admi')}
                  className="p-2 text-sm rounded-[6px] bg-naranja hover:bg-naranja/90 text-white"
                >
                  Crear Turno 
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
              />
              )}
            </div>
          </div>
          {showModal && <ModalConfirmation onConfirm={confirmDeleteSubmit} onCancel={closeDeleteModal} title="Cancelar Turno" subtitle={"Desea Cancelar el turno?"} botonText1={"Volver"} botonText2={"Cancelar"} />}
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