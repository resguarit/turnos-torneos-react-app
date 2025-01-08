import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/header';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import api from '@/lib/axiosConfig';
import Loading from '@/components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
      })
      .catch((error) => {
        setError(error.message);
      });

    // Obtener opciones de canchas
    api.get('/canchas')
      .then((response) => {
        setCanchaOptions(response.data.canchas);
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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Detalles del Turno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información del Cliente - Read Only */}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Nombre:</Label>
                <div className="col-span-3">{turnoData.usuario_nombre}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Teléfono:</Label>
                <div className="col-span-3">{turnoData.usuario_telefono}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Email:</Label>
                <div className="col-span-3">{turnoData.usuario_email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Fecha Reserva:</Label>
                <div className="col-span-3">{turnoData.fecha_reserva}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Tipo Turno:</Label>
                <div className="col-span-3">{turnoData.tipo_turno}</div>
              </div>
            </div>

            {/* Formulario de Edición */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fecha_turno">Fecha del Turno:</Label>
                  <Input
                    id="fecha_turno"
                    type="date"
                    name="fecha_turno"
                    value={formData.fecha_turno}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cancha_id">Cancha:</Label>
                  <Select 
                    value={formData.cancha_id}
                    onValueChange={(value) => setFormData({...formData, cancha_id: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar cancha" />
                    </SelectTrigger>
                    <SelectContent>
                      {canchaOptions.map((cancha) => (
                        <SelectItem key={cancha.id} value={cancha.id}>
                          {`Cancha ${cancha.nro} - ${cancha.tipo_cancha}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="horario_id">Horario:</Label>
                  <Select 
                    value={formData.horario_id}
                    onValueChange={(value) => setFormData({...formData, horario_id: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarioOptions.map((horario) => (
                        <SelectItem key={horario.id} value={horario.id}>
                          {`${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="monto_total">Monto Total:</Label>
                  <Input
                    id="monto_total"
                    type="number"
                    name="monto_total"
                    value={formData.monto_total}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="monto_seña">Monto de la Seña:</Label>
                  <Input
                    id="monto_seña"
                    type="number"
                    name="monto_seña"
                    value={formData.monto_seña}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estado">Estado:</Label>
                  <Select 
                    value={formData.estado}
                    onValueChange={(value) => setFormData({...formData, estado: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Señado">Señado</SelectItem>
                      <SelectItem value="Pagado">Pagado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="submit">Guardar Cambios</Button>
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