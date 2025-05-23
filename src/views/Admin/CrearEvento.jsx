import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Plus, ChevronLeft } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import CrearPersonaModal from './Modals/CrearPersonaModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CrearEvento() {
  const [formEventoData, setFormEventoData] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    persona_id: '',
    monto: '',
  });
  const [horarios, setHorarios] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [canchasDisponibles, setCanchasDisponibles] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [detalles, setDetalles] = useState([]); // [{horarioIds: [], canchaId}]
  const [showCrearPersonaModal, setShowCrearPersonaModal] = useState(false);
  const [deportes, setDeportes] = useState([]);
  const [deporteId, setDeporteId] = useState(''); // Agrega esto a tu estado
  const [personaQuery, setPersonaQuery] = useState('');
  const [personas, setPersonas] = useState([]);
  const [showPersonas, setShowPersonas] = useState(false);
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {
    api.get('/deportes')
      .then(res => setDeportes(res.data || []))
      .catch(() => toast.error('Error al traer deportes'));
  }, []);


  // Traer horarios disponibles al seleccionar fecha
  useEffect(() => {
    setHoraInicio('');
    setHoraFin('');
    setHorarios([]);
    setCanchasDisponibles([]);
    setCanchaSeleccionada('');
    if (formEventoData.fecha && deporteId) {
      api.get('/disponibilidad/fecha', {
        params: { fecha: formEventoData.fecha, deporte_id: deporteId }
      }).then(res => {
        setHorarios(res.data.horarios.filter(h => h.disponible));
      }).catch(() => toast.error('Error al traer horarios'));
    }
  }, [formEventoData.fecha, deporteId]);

  // Traer canchas disponibles cuando hay rango horario seleccionado
  useEffect(() => {
    if (horaInicio && horaFin && formEventoData.fecha && deporteId) {
      // Obtener los horarios del rango seleccionado
      const idxInicio = horarios.findIndex(h => h.id === parseInt(horaInicio));
      const idxFin = horarios.findIndex(h => h.id === parseInt(horaFin));
      if (idxInicio === -1 || idxFin === -1 || idxFin < idxInicio) {
        setCanchasDisponibles([]);
        return;
      }
      const rangoHorarios = horarios.slice(idxInicio, idxFin + 1);
      // Traer canchas disponibles para cada horario del rango y quedarnos solo con las que están en todos
      Promise.all(
        rangoHorarios.map(h =>
          api.get('/disponibilidad/cancha', {
            params: { fecha: formEventoData.fecha, horario_id: h.id, deporte_id: deporteId }
          }).then(res => res.data.canchas.filter(c => c.disponible).map(c => c.id))
        )
      ).then(listasIds => {
        // Intersección de ids de canchas disponibles en todos los horarios del rango
        const idsComunes = listasIds.reduce((a, b) => a.filter(id => b.includes(id)));
        // Traer info de las canchas
        if (idsComunes.length > 0) {
          api.get('/disponibilidad/cancha', {
            params: { fecha: formEventoData.fecha, horario_id: rangoHorarios[0].id, deporte_id: deporteId }
          }).then(res => {
            setCanchasDisponibles(res.data.canchas.filter(c => idsComunes.includes(c.id)));
          });
        } else {
          setCanchasDisponibles([]);
        }
      });
    } else {
      setCanchasDisponibles([]);
    }
    setCanchaSeleccionada('');
  }, [horaInicio, horaFin, formEventoData.fecha, deporteId, horarios]);

  // Agregar cancha seleccionada al detalle
  const handleAgregarCancha = () => {
    if (!horaInicio || !horaFin || !canchaSeleccionada) return;
    const idxInicio = horarios.findIndex(h => h.id === parseInt(horaInicio));
    const idxFin = horarios.findIndex(h => h.id === parseInt(horaFin));
    const rangoHorarios = horarios.slice(idxInicio, idxFin + 1).map(h => h.id);
    setDetalles(prev => [
      ...prev,
      { horarioIds: rangoHorarios, canchaId: parseInt(canchaSeleccionada), label: `${horarios[idxInicio].hora_inicio} - ${horarios[idxFin].hora_fin}` }
    ]);
    setCanchaSeleccionada('');
  };

  // Eliminar cancha de la lista
  const handleEliminarDetalle = idx => {
    setDetalles(detalles.filter((_, i) => i !== idx));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formEventoData.nombre || !formEventoData.fecha || !formEventoData.descripcion || !formEventoData.persona_id || !formEventoData.monto || detalles.length === 0) {
      toast.error('Completa todos los campos y agrega al menos una cancha');
      return;
    }
    // Normalizar arrays para el backend
    const combinaciones = [];
  detalles.forEach(d => {
    d.horarioIds.forEach(horarioId => {
      combinaciones.push({ horario_id: horarioId, cancha_id: d.canchaId });
    });
  });

    // Elimina duplicados
     const unicas = [];
  const seen = new Set();
  for (const c of combinaciones) {
    const key = `${c.horario_id}-${c.cancha_id}`;
    if (!seen.has(key)) {
      seen.add(key);
      unicas.push(c);
    }
  }

    try {
        setLoading(true);
    await api.post('/eventos', {
      ...formEventoData,
      combinaciones: unicas, // Envía solo las combinaciones únicas
    });
    toast.success('Evento creado correctamente');
    navigate('/panel-admin?tab=turnos');
  } catch {
    toast.error('Error al crear el evento');
  }
};

  // Buscador de personas
  useEffect(() => {
    const fetchPersonas = async () => {
      if (personaQuery.length < 3) {
        setPersonas([]);
        return;
      }
      try {
        const params = {};
        if (/^\d+$/.test(personaQuery)) {
          params.dni = personaQuery;
        } else {
          params.name = personaQuery;
        }
        const res = await api.get('/personas', { params });
        setPersonas(res.data.data || []);
        setShowPersonas(true);
      } catch {
        setPersonas([]);
      }
    };
    const timeout = setTimeout(fetchPersonas, 300); // debounce
    return () => clearTimeout(timeout);
  }, [personaQuery]);

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <ToastContainer position="top-right" />
      <div className="flex items-center px-4 py-2">
                <Button 
                  onClick={() => navigate('/panel-admin?tab=turnos')} 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-naranja hover:text-white rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Volver a Turnos</span>
                </Button>
              </div>
      <main className="flex-1 flex items-center justify-center pb-4">
        
        <div className="bg-white shadow rounded-[8px] p-4 w-full max-w-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5" /> Crear Evento
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  className="w-full border rounded-[6px] text-sm p-2"
                  value={formEventoData.nombre}
                  onChange={e => setFormEventoData(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Cumpleaños, Reunión, Fiesta, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  className="w-full text-sm border rounded p-2"
                  value={formEventoData.fecha}
                  onChange={e => setFormEventoData(f => ({ ...f, fecha: e.target.value }))}
                />
              </div>
            <div>
              <label className="block text-sm font-medium">Descripción</label>
              <textarea
                className="w-full text-sm p-1 rounded-[6px] shadow-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={formEventoData.descripcion}
                onChange={e => setFormEventoData(f => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <div>
                <label className="block text-sm font-medium">Deporte</label>
                <select
                  className="w-full border rounded-[6px] text-sm p-2"
                  value={deporteId}
                  onChange={e => setDeporteId(e.target.value)}
                >
                  <option value="">Selecciona un deporte</option>
                  {deportes.map(deporte => (
                    <option key={deporte.id} value={deporte.id}>{deporte.nombre} {deporte.jugadores_por_equipo}</option>
                  ))}
                </select>
              </div>
              </div>
            <div>
              <label className="block text-sm font-medium">Persona asociada</label>
              <div className="relative w-full gap-2">
                <input
                  type="search"
                  className="w-full text-sm border rounded-[6px] p-2"
                  placeholder="Buscar por DNI o nombre"
                  value={personaQuery}
                  onChange={e => {
                    setPersonaQuery(e.target.value);
                    setShowPersonas(true);
                  }}
                  autoComplete="off"
                />
                {showPersonas && personas.length > 0 && (
                  <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto rounded shadow">
                    {personas.map(persona => (
                      <li
                        key={persona.id}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          setFormEventoData(f => ({ ...f, persona_id: persona.id }));
                          setPersonaQuery(`${persona.name} (${persona.dni})`);
                          setShowPersonas(false);
                        }}
                      >
                        {persona.name} - DNI: {persona.dni} - Tel: {persona.telefono}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  className="absolute right-2 top-2 bg-verde py-1 px-2 rounded text-white"
                  onClick={() => setShowCrearPersonaModal(true)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Hora Inicio</label>
                <select
                  className="w-full flex text-sm border rounded p-2"
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                  disabled={!formEventoData.fecha || horarios.length === 0}
                >
                  <option value="">Selecciona hora inicio</option>
                  {horarios.map(h => (
                    <option key={h.id} value={h.id}>{h.hora_inicio}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Hora Fin</label>
                <select
                  className="w-full flex text-sm border rounded p-2"
                  value={horaFin}
                  onChange={e => setHoraFin(e.target.value)}
                  disabled={!horaInicio}
                >
                  <option value="">Selecciona hora fin</option>
                  {horarios
                    .filter(h => {
                      const horarioInicio = horarios.find(hora => hora.id === parseInt(horaInicio));
                      if (!horarioInicio) return false;
                      
                      const horaInicioValue = horarioInicio.hora_inicio.replace(':', '');
                      const horaActualValue = h.hora_inicio.replace(':', '');
                      
                      return parseInt(horaActualValue) >= parseInt(horaInicioValue);
                    })
                    .map(h => {
                      return (
                        <option key={h.id} value={h.id}>{h.hora_fin}</option>
                      )
                    })
                  }
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Cancha</label>
                <div className="flex gap-2">
                  <select
                    className="w-full flex text-sm border rounded p-2"
                    value={canchaSeleccionada}
                    onChange={e => setCanchaSeleccionada(e.target.value)}
                    disabled={!horaInicio || !horaFin || canchasDisponibles.length === 0}
                  >
                    <option value="">Selecciona una cancha</option>
                    {canchasDisponibles.map(c => (
                      <option key={c.id} value={c.id}>
                        {`Cancha ${c.nro} - ${c.tipo}`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-2 rounded hover:bg-blue-700"
                    disabled={!canchaSeleccionada}
                    onClick={handleAgregarCancha}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Canchas seleccionadas</label>
                <ul className="w-full flex flex-col text-sm p-2 gap-2">
                  {detalles.map((d, idx) => (
                    <li key={idx} className="w-full justify-between flex items-center bg-gray-100 rounded px-2 py-1">
                      <span>
                        {d.label} - Cancha {canchasDisponibles.find(c => c.id === d.canchaId)?.nro}
                      </span>
                      <button
                        type="button"
                        className="ml-2 text-red-600 hover:text-red-800"
                        onClick={() => handleEliminarDetalle(idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium">Precio</label>
                <input
                  type="number"
                  className="w-full text-sm border rounded p-2"
                  value={formEventoData.monto}
                  onChange={e => setFormEventoData(f => ({ ...f, monto: e.target.value }))}
                />
              </div>
            </div>
            <div className="justify-end flex w-full">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white py-2 px-4 rounded-[6px] hover:bg-blue-700 transition duration-200"
              >
                {loading ? 'Creando Evento' : 'Crear Evento'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
      {showCrearPersonaModal && (
        <CrearPersonaModal
          onClose={() => setShowCrearPersonaModal(false)}
          onPersonaCreada={persona => {
            setFormEventoData(f => ({ ...f, persona_id: persona.id }));
            setPersonaQuery(`${persona.name} (${persona.dni})`);
            setShowCrearPersonaModal(false);
          }}
        />
      )}
    </div>
  );
}

