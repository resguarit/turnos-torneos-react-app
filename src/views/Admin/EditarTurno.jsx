import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayPicker } from 'react-day-picker';
import { ScrollArea } from "@/components/ui/scroll-area";
import 'react-day-picker/dist/style.css';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditarTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [turnoExistente, setTurnoExistente] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const response = await api.get(`/turnos/${id}`);
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
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          navigate('/*');
        } else {
          toast.error('Error al cargar el turno');
          setError(error.message);
          setLoading(false);
        }
      }
    };

    fetchTurno();
  }, [id, navigate]);

  const fetchHorarios = async (fecha) => {
    try {
      const response = await api.get(`/disponibilidad/fecha?fecha=${fecha}`);
      const horariosDisponibles = response.data.horarios.filter(horario => horario.disponible);
      setHorarioOptions(horariosDisponibles);
    } catch (error) {
      toast.error('Error al cargar los horarios');
    }
  };

  const fetchCanchas = async (fecha, horarioId) => {
    try {
      const response = await api.get(`/disponibilidad/cancha?fecha=${fecha}&horario_id=${horarioId}`);
      const canchasDisponibles = response.data.canchas.filter(cancha => cancha.disponible);
      setCanchaOptions(canchasDisponibles);
    } catch (error) {
      toast.error('Error al cargar las canchas');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    setFormData({
      ...formData,
      fecha_turno: formattedDate,
      horario_id: '', // Deseleccionar la hora
      cancha_id: '' // Deseleccionar la cancha
    });
    fetchHorarios(formattedDate);
    setIsOpen(false); // Cerrar el calendario después de seleccionar una fecha
  };

  const handleHorarioChange = (value) => {
    setFormData({
      ...formData,
      horario_id: value,
      cancha_id: '' // Deseleccionar la cancha
    });
    fetchCanchas(formData.fecha_turno, value);
  };

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFetching(true);
    const updatedData = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== booking[key]) {
        updatedData[key] = formData[key];
      }
    });

    try {
      const response = await api.patch(`/turnos/${id}`, updatedData);
      if (response.status === 200) {
        toast.success('Turno actualizado correctamente');
        setFetching(false);
        setTimeout(() => {
          navigate('/nuevo-panel-admin?tab=turnos');
        }, 2000); // Esperar 2 segundos antes de redirigir
      }
    } catch (error) {
      if (error.response && error.response.status === 409){
        setFetching(false);
        setTurnoExistente(true);
        toast.error('Ya existe un turno para esa cancha en esta fecha y horario');
      } else {
        toast.error('Error al actualizar el turno');
        setError(error.message);
      }
    }
  };

  const formatMonto = (value) => {
    if (!value) return '';
    return parseFloat(value).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });
  };

  if (loading) return <div><Loading /></div>;

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        <BackButton />
        <h1 className='text-4xl font-semibold '>Detalles del Turno</h1>
        <Card className="max-w-7xl mx-auto border-0 shadow-none">
          <CardContent className="space-y-6 pt-4 ">
            <ToastContainer position="bottom-right" />
            {/* Campos de solo lectura */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-2xl font-bold mb-1 block">Nombre:</Label>
                  <div className="p-2 text-xl bg-white rounded-md border">{turnoData.usuario_nombre}</div>
                </div>
                <div>
                  <Label className="text-2xl font-bold mb-1 block">Teléfono:</Label>
                  <div className="p-2 text-xl bg-white rounded-md border">{turnoData.usuario_telefono}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-2xl font-bold mb-1 block">Email:</Label>
                  <div className="p-2 text-xl bg-white rounded-md border">{turnoData.usuario_email}</div>
                </div>
                <div>
                  <Label className="text-2xl font-bold mb-1 block">Tipo de Turno:</Label>
                  <div className="p-2 text-xl bg-white rounded-md border">{turnoData.tipo_turno}</div>
                </div>
              </div>
              <div>
                <Label className="text-2xl font-bold mb-1 block">Fecha de Reserva:</Label>
                <div className="p-2 text-xl bg-white rounded-md border">{turnoData.fecha_reserva}</div>
              </div>
            </div>

            {/* Formulario editable */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-2xl font-semibold mb-1 block">Fecha del Turno</Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleCalendar}
                      className="w-full text-xl p-2 border rounded-md pl-10 bg-white text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-naranja focus:border-naranja"
                    >
                      {formData.fecha_turno ? format(parseISO(formData.fecha_turno), 'PPP', { locale: es }) : 'Seleccionar Fecha'}
                    </button>
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    {isOpen && (
                      <div className="absolute mt-2 z-10">
                        <div className="bg-white  border rounded-lg shadow-lg p-4">
                          <DayPicker
                            selected={parseISO(formData.fecha_turno)}
                            onDayClick={handleDateChange}
                            locale={es}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-2xl font-semibold mb-1 block">Horario</Label>
                  <Select 
                    value={formData.horario_id.toString()}
                    onValueChange={handleHorarioChange}
                    disabled={!formData.fecha_turno}
                  >
                    <SelectTrigger className="w-full text-xl bg-white border-gray-200 focus:ring-2 focus:ring-naranja focus:border-naranja">
                      <SelectValue placeholder="Seleccionar horario"/>
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg text-xl">
                      <ScrollArea className="h-[200px]">
                        {horarioOptions.map((horario) => (
                          <SelectItem 
                            key={horario.id} 
                            value={horario.id.toString()}
                            className="hover:bg-gray-100 text-xl"
                          >
                            {`${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-2xl font-semibold mb-1 block">Cancha</Label>
                  <Select 
                    value={formData.cancha_id.toString()}
                    onValueChange={(value) => setFormData({...formData, cancha_id: value})}
                    disabled={!formData.horario_id}
                  >
                    <SelectTrigger className="w-full text-xl bg-white border-gray-200 focus:ring-2 focus:ring-naranja focus:border-naranja">
                      <SelectValue placeholder="Seleccionar cancha" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-xl border shadow-lg">
                      <ScrollArea className="h-[200px]">
                        {canchaOptions.map((cancha) => (
                          <SelectItem 
                            key={cancha.id} 
                            value={cancha.id.toString()}
                            className="hover:bg-gray-100 text-xl"
                          >
                            {`Cancha ${cancha.nro} - ${cancha.tipo}`}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-2xl font-semibold mb-1 block">Monto Total</Label>
                    <div className="relative">
                      <span className="absolute left-3 text-xl top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="monto_total"
                        value={formData.monto_total}
                        onChange={handleChange}
                        className="pl-8 text-xl items-center py-1 w-full bg-white border-gray-200 focus:ring-2 focus:ring-naranja focus:border-naranja"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-2xl font-semibold mb-1 block">Monto de la Seña</Label>
                    <div className="relative">
                      <span className="absolute text-xl left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="monto_seña"
                        value={formData.monto_seña}
                        onChange={handleChange}
                        className="pl-8 py-1 w-full text-xl bg-white border-gray-200 focus:ring-2 focus:ring-naranja focus:border-naranja"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-2xl font-semibold mb-1 block">Estado</Label>
                  <Select 
                    value={formData.estado}
                    onValueChange={(value) => setFormData({...formData, estado: value})}
                  >
                    <SelectTrigger className="w-full text-xl bg-white border-gray-200 focus:ring-2 focus:ring-naranja focus:border-naranja">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg text-xl">
                      <SelectItem value="Pendiente" className="hover:bg-gray-100 text-xl">Pendiente</SelectItem>
                      <SelectItem value="Señado" className="hover:bg-gray-100 text-xl">Señado</SelectItem>
                      <SelectItem value="Pagado" className="hover:bg-gray-100 text-xl">Pagado</SelectItem>
                      <SelectItem value="Cancelado" className="hover:bg-gray-100 text-xl">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {turnoExistente && (
                <div className="text-red-500 text-2xl">
                  Ya existe un turno para esa cancha en esta fecha y horario.
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="mt-4 p-3 lg:text-2xl bg-naranja text-white rounded-xl hover:bg-naranja/80"
                >
                  {fetching ? "Guardando Cambios" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default EditarTurno;