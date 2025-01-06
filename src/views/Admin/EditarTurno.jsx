import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';

function EditarTurno() {
  const { id } = useParams(); // Obtener el ID de la reserva desde la URL
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [canchaOptions, setCanchaOptions] = useState([]);
  const [horarioOptions, setHorarioOptions] = useState([]);
  const [formData, setFormData] = useState({
    fecha_turno: '',
    canchaID: '',
    horarioID: '',
    monto_total: '',
    monto_seña: '',
    estado: ''
  });

  useEffect(() => {
    // Obtener los detalles de la reserva
    api.get(`/reservas/${id}`)
      .then((response) => {
        setBooking(response.data.reserva);
        setFormData({
          fecha_turno: response.data.reserva.fecha_turno,
          canchaID: response.data.reserva.canchaID,
          horarioID: response.data.reserva.horarioID,
          monto_total: response.data.reserva.monto_total,
          monto_seña: response.data.reserva.monto_seña,
          estado: response.data.reserva.estado
        });
      })
      .catch((error) => {
        setError(error.message);
      });

    // Obtener opciones de canchas
    api.get('/canchas')
      .then((response) => {
        setCanchaOptions(response.data.canchas);
        console.log("Las canchas son", response.data.canchas);
      })
      .catch((error) => {
        setError(error.message);
      });

    // Obtener opciones de horarios
    api.get('/horarios')
      .then((response) => {
        setHorarioOptions(response.data.horarios);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/reservas/${id}`, formData);
      if (response.status === 200) {
        console.log("Reserva actualizada correctamente:", response.data);
        navigate('/ver-turnos'); // Redirige a la página de turnos
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      setError(error.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!booking) {
    return <div><Loading /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <BackButton />
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">Editar Turno: {booking.id}</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha del Turno</label>
              <input
                type="date"
                name="fecha_turno"
                value={formData.fecha_turno}
                onChange={handleChange}
                className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cancha</label>
              <select
                name="canchaID"
                value={formData.canchaID}
                onChange={handleChange}
                className="mt-1 block w-1/2 p-2 border text-black border-gray-300 rounded-md"
              >
                <option className="text-black" value="">Selecciona una cancha</option>
                {canchaOptions.map((cancha) => (
                  <option  className="text-black" key={cancha.id} value={cancha.id}>
                    {cancha.nro} - {cancha.tipoCancha}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Horario</label>
              <select
                name="horarioID"
                value={formData.horarioID}
                onChange={handleChange}
                className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md overflow-y-auto"
              >
                <option value="">Selecciona un horario</option>
                {horarioOptions.map((horario) => (
                  <option key={horario.id} value={horario.id}>
                    {horario.horaInicio} - {horario.horaFin}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto Total</label>
              <input
                type="number"
                name="monto_total"
                value={formData.monto_total}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto de la Seña</label>
              <input
                type="number"
                name="monto_seña"
                value={formData.monto_seña}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="mt-1 block w-1/2 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecciona un estado</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default EditarTurno;