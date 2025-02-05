import React, { useEffect, useState } from 'react';
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';
import ModalConfirmation from '@/components/ModalConfirmation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSinHF from '@/components/LoadingSinHF';
import ListaMisTurnos from '@/components/ListaMisTurnos';

export default function MisTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [turnosPrueba, setTurnosPrueba] = useState([]);
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
      if (response.status === 404) {
        setTurnos([]);
        setError('No tienes turnos');
      } else if (response.data && response.data.turnos) {
        setTurnosPrueba(response.data.turnos);
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
        setError(null);
      } else {
        setTurnos([]);
        setError('No tienes turnos');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setTurnos([]);
        setError('No tienes turnos');
      } else {
        setError('Error al cargar los turnos. Por favor, intente nuevamente.');
      }
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

  
  if (loading) {
    return <LoadingSinHF />;
  }

  return (
    <div className="flex flex-col">
      <ToastContainer position="top-right" />
      <main className="flex-grow bg-gray-100">
        <ListaMisTurnos 
          turnos={turnosPrueba} 
          onTurnoCanceled={fetchTurnos}  
        />
      </main>
    </div>
  );
}