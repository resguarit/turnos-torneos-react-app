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
  const [turnoData, setTurnoData] = useState({
    fecha_reserva: '',
    usuario_nombre: '',
    usuario_telefono: '',
    usuario_email: '',
    tipo_turno: ''
  });
  const [formData, setFormData] = useState({
    fecha_turno: '',
    cancha_id: '',
    horario_id: '',
    monto_total: '',
    monto_seña: '',
    estado: ''
  });

  useEffect(() => {
    // Obtener los detalles de la reserva
    api.get(`/turnos/${id}`)
      .then((response) => {
        const turno = response.data.turno;
        setBooking(turno);
        setFormData({
          fecha_turno: turno.fecha_turno,
          cancha_id: response.data.cancha_id,
          horario_id: response.data.horario_id,
          monto_total: turno.monto_total,
          monto_seña: turno.monto_seña,
          estado: turno.estado,
        });
        setTurnoData({
          fecha_reserva: turno.fecha_reserva,
          usuario_nombre: turno.usuario.nombre,
          usuario_telefono: turno.usuario.telefono,
          usuario_email: turno.usuario.email,
          tipo_turno: turno.tipo
        });
        console.log("La reserva es", turno);
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
      const response = await api.patch(`/turnos/${id}`, formData);
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

  if (!booking && !canchaOptions.length && !horarioOptions.length) {
    return <div><Loading /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        <BackButton />
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">Editar Turno: </h1>
          </div>
          <div className="flex flex-col justify-between items-start space-y-4 "> 
          <div className="flex flex-col space-y-8 w-1/2 h-full mb-10">
            <p className="text-lg lg:text-2xl "><strong>Nombre:</strong> {turnoData.usuario_nombre}</p>
            <p className="text-lg lg:text-2xl "><strong>Teléfono:</strong> {turnoData.usuario_telefono}</p>
            <p className="text-lg lg:text-2xl "><strong>Email:</strong> {turnoData.usuario_email}</p>
            <p className="text-lg lg:text-2xl "><strong>Fecha Reserva:</strong> {turnoData.fecha_reserva}</p>
            <p className="text-lg lg:text-2xl "><strong>Tipo Turno:</strong> {turnoData.tipo_turno}</p>
          </div>
          <div className="w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm lg:text-2xl font-semibold text-gray-700">Fecha del Turno</label>
              <input
                type="date"
                name="fecha_turno"
                value={formData.fecha_turno}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border lg:text-xl border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-semibold text-gray-700">Cancha</label>
              <select
                name="cancha_id"
                value={formData.cancha_id}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border lg:text-xl text-black border-gray-300 rounded-xl"
              >
                <option className="text-black" value="">Selecciona una cancha</option>
                {canchaOptions.map((cancha) => (
                  <option  className="text-black" key={cancha.id} value={cancha.id}>
                    {cancha.nro} - {cancha.tipo_cancha}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-semibold text-gray-700">Horario</label>
              <select
                name="horario_id"
                value={formData.horario_id}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border lg:text-xl border-gray-300 rounded-xl overflow-y-auto"
              >
                <option value="">Selecciona un horario</option>
                {horarioOptions.map((horario) => (
                  <option key={horario.id} value={horario.id}>
                    {horario.hora_inicio} - {horario.hora_fin}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-semibold text-gray-700">Monto Total</label>
              <input
                type="number"
                name="monto_total"
                value={formData.monto_total}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border lg:text-xl border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-semibold text-gray-700">Monto de la Seña</label>
              <input
                type="number"
                name="monto_seña"
                value={formData.monto_seña}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border lg:text-xl border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-semibold text-gray-700">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border lg:text-xl border-gray-300 rounded-xl"
              >
                <option value="">Selecciona un estado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            
          </form>
          </div>
          
          </div>
          <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="px-4 py-3 lg:text-xl bg-naranja text-white rounded-xl hover:bg-naranja/80"
                onClick={handleSubmit}
              >
                Guardar Cambios
              </button>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default EditarTurno;