import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSinHF from '@/components/LoadingSinHF';
import ModalConfirmation from '@/components/ModalConfirmation';
import PageHeader from '@/components/PanelAdmin/VerTurnos/TurnoHeader';
import DateSelector from '@/components/PanelAdmin/VerTurnos/TurnoDateSelector';
import FilterControls from '@/components/PanelAdmin/VerTurnos/TurnoFilterControls';
import TurnoList from '@/components/PanelAdmin/VerTurnos/TurnoList';
import SearchBar from '@/components/PanelAdmin/VerTurnos/TurnoSearchBar';
import { Button } from '@/components/ui/button';

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

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter">
        <main className="flex-1 p-6 bg-gray-100">
          <div className="mb-8">
            <div className="space-y-4">
              <SearchBar
                searchType={searchType}
                setSearchType={setSearchType}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleFilterToggle={handleFilterToggle}
                handleSearch={handleSearch}
                isFilterOpen={isFilterOpen}
              />
              {isFilterOpen && (
                <FilterControls
                  selectedCourt={selectedCourt}
                  setSelectedCourt={setSelectedCourt}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  courts={courts}
                  handleStatusChange={handleStatusChange}
                />
              )}
              <div className="flex flex-col gap-4 items-start lg:flex-row lg:items-center lg:gap-2">
                <span className="text-sm font-semibold lg:text-xl">Selecciona el Día o Intervalo:</span>
                <Button onClick={() => setViewOption('day')} variant={viewOption === 'day' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-lg rounded-[8px] hover:bg-naranja  hover:text-white ${viewOption === 'day' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Día</Button>
                <Button onClick={() => setViewOption('range')} variant={viewOption === 'range' ? 'default' : 'outline'} className={`px-4 py-2 lg:text-lg rounded-[8px] hover:bg-naranja hover:text-white ${viewOption === 'range' ? 'bg-naranja text-white' : 'bg-white text-naranja border-0'}`} style={{ borderRadius: '8px' }}>Intervalo</Button>
                <DateSelector
                  viewOption={viewOption}
                  selectedDate={selectedDate}
                  startDate={startDate}
                  endDate={endDate}
                  isOpen={isOpen}
                  toggleCalendar={toggleCalendar}
                  handleDateChange={handleDateChange}
                  handleRangeChange={handleRangeChange}
                />
              </div>
              {loading && (<LoadingSinHF/>)}
              {!loading && (
              <TurnoList
                filteredBookings={filteredBookings}
                handleDeleteSubmit={handleDeleteSubmit}
              />
              )}
            </div>
          </div>
          {showModal && <ModalConfirmation onConfirm={confirmDeleteSubmit} onCancel={closeDeleteModal} title="Cancelar Turno" subtitle={"Desea Cancelar el turno?"} botonText1={"Volver"} botonText2={"Eliminar"} />}
        </main>
      </div>
    </>
  );
}

export default VerTurnos;