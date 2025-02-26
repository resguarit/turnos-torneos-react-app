import React, { useEffect, useState } from 'react';
import api from '@/lib/axiosConfig';
import ListaMisTurnos from '@/components/PanelUsuario/MisTurnos/ListaMisTurnos';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BtnLoading from '@/components/BtnLoading';

export default function MisTurnos() {
  const [turnosPrueba, setTurnosPrueba] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurnos();
  }, []);

  const fetchTurnos = async () => {
    setLoading(true);
    try {
      const response = await api.get('turnos/user');
      if (response.status === 404) {
        setTurnosPrueba([]);
        setError('No tienes turnos');
      } else if (response.data && response.data.turnos) {
        setTurnosPrueba(response.data.turnos);
        setError(null);
      } else {
        setTurnosPrueba([]);
        setError('No tienes turnos');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setTurnosPrueba([]);
        setError('No tienes turnos');
      } else {
        setError('Error al cargar los turnos. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className='w-full flex justify-center '>
    <BtnLoading />
    </div>;
  }

  return (
    <div className="flex flex-col">
      <ToastContainer position="top-right" />
      <main className="flex-grow bg-gray-100 p-1 md:p-6">
        <ListaMisTurnos 
          turnos={turnosPrueba} 
          onTurnoCanceled={fetchTurnos}  
        />
      </main>
    </div>
  );
}