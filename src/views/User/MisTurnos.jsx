import React, { useEffect, useState } from 'react';
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';
import ModalConfirmation from '@/components/ModalConfirmation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSinHF from '@/components/LoadingSinHF';

export default function MisTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProximos, setShowProximos] = useState(true);
  const [expandedTurno, setExpandedTurno] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [turnoToCancel, setTurnoToCancel] = useState(null);

  useEffect(() => {
    fetchTurnos();
  }, [showProximos]);

  const fetchTurnos = async () => {
    setLoading(true);
    try {
      const response = await api.get('turnos/user');
      if (response.data && response.data.turnos) {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const turnosFiltrados = response.data.turnos.filter(turno => {
          return showProximos ? turno.fecha_turno >= fechaHoy && turno.estado !== 'Cancelado' : turno.fecha_turno < fechaHoy || turno.estado === 'Cancelado';
        });
        const turnosOrdenados = turnosFiltrados.sort((a, b) => {
          const fechaA = new Date(a.fecha_turno);
          const fechaB = new Date(b.fecha_turno);
          if (fechaA.getTime() === fechaB.getTime()) {
            return new Date(`1970-01-01T${a.horario.hora_inicio}`) - new Date(`1970-01-01T${b.horario.hora_inicio}`);
          }
          return fechaA - fechaB;
        });
        setTurnos(turnosOrdenados);
      } else {
        setTurnos([]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTurnos = () => {
    setShowProximos(!showProximos);
  };

  const toggleExpand = (turnoId) => {
    setExpandedTurno(expandedTurno === turnoId ? null : turnoId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1); // Sumar un día para corregir el desfase
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleCancelarClick = (turnoId) => {
    setTurnoToCancel(turnoId);
    setIsOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await api.patch(`turnos/${turnoToCancel}`, { estado: 'Cancelado' });
      toast.success('Turno cancelado correctamente');
      fetchTurnos(); // Refrescar la lista de turnos
    } catch (error) {
      toast.error('Error al cancelar el turno');
    } finally {
      setIsOpen(false);
      setTurnoToCancel(null);
    }
  };
  
  if (loading) {
    return <LoadingSinHF />;
  }

  return (
    <div className="flex flex-col">
      <ToastContainer position="bottom-right" />
      <main className="flex-grow bg-gray-100 p-6">
        <div className="w-full flex justify-end">
          <button
            onClick={toggleTurnos}
            className="mb-6 p-3 bg-naranja text-white text-xl rounded-[8px]"
          >
            {showProximos ? 'Ver Turnos Anteriores' : 'Ver Turnos Próximos'}
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex flex-col gap-4 w-full">
          {turnos.map((turno) => (
            <div key={turno.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className='flex justify-between'>
                <div>
                  <h2 className="text-2xl font-semibold">{formatDate(turno.fecha_turno)}</h2>
                  <p className="text-xl"><span className="font-semibold">Cancha:</span> {turno.cancha.nro} - {turno.cancha.tipo_cancha}</p>
                  <p className="text-xl"><span className="font-semibold">Horario:</span> {turno.horario.hora_inicio} - {turno.horario.hora_fin}</p>
                  {expandedTurno === turno.id && (
                    <div className="mt-4 text-gray-600">
                      <p><span className="font-semibold">Fecha reserva:</span> {formatDate(turno.fecha_reserva)}</p>
                      <p><span className="font-semibold">Monto Total:</span> {turno.monto_total}</p>
                      <p><span className="font-semibold">Monto Seña:</span> {turno.monto_seña}</p>
                    </div>
                  )}
                  <button
                    onClick={() => toggleExpand(turno.id)}
                    className="mt-4 p-2 bg-gray-200 text-black rounded-lg"
                  >
                    {expandedTurno === turno.id ? 'Ver Menos' : 'Ver Más'}
                  </button>
                </div>
                {showProximos && (
                  <div className='flex items-center'>
                    <button
                      onClick={() => handleCancelarClick(turno.id)}
                      className="mt-4 p-2 bg-red-500 text-white rounded-lg"
                    >
                      Cancelar Turno
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      {isOpen && (
        <ModalConfirmation
          onConfirm={handleConfirmCancel}
          onCancel={() => setIsOpen(false)}
          title="Cancelar Turno"
          subtitle="¿Estás seguro de que deseas cancelar este turno?"
          botonText1="No"
          botonText2="Sí, cancelar"
        />
      )}
    </div>
  );
}