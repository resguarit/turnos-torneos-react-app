import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, Search, Calendar, Clock, User, DollarSign, Users, MapPin } from "lucide-react";
import BtnLoading from "@/components/BtnLoading";
import api from "@/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDeportes } from '@/context/DeportesContext';
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

const PestanaClases = () => {
  const { deportes } = useDeportes();
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claseToDelete, setClaseToDelete] = useState(null);
  const [deporteId, setDeporteId] = useState('');

  // Estados para horarios extremos y selectores
  const [horariosExtremos, setHorariosExtremos] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  // Agregar estos estados que faltan para clases fijas
  const [deporteIdFijas, setDeporteIdFijas] = useState('');
  const [horariosExtremosFijas, setHorariosExtremosFijas] = useState([]);
  // Nuevos estados para horarios por día
  const [horariosPorDia, setHorariosPorDia] = useState({});
  const [horariosSeleccionados, setHorariosSeleccionados] = useState({});

  // Formulario de clase
  const [formClase, setFormClase] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    profesor_id: "",
    cancha_id: "",
    horario_id: "",
    cupo_maximo: "",
    precio_mensual: "",
    activa: true,
  });

  // Estado para mostrar el modal de clases fijas
  const [showClasesFijas, setShowClasesFijas] = useState(false);

  // Estado para el formulario de clases fijas
  const [formClasesFijas, setFormClasesFijas] = useState({
    nombre: "",
    descripcion: "",
    profesor_id: "",
    cancha_id: "",
    cupo_maximo: "",
    precio_mensual: "",
    activa: true,
    fecha_inicio: "",
    duracion_meses: 1,
    dias_semana: [],
    deporte_id: "",
    // Remover hora_inicio y hora_fin globales, ahora serán por día
  });

  // Días de la semana para el selector
  const diasSemana = [
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miércoles", label: "Miércoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sábado", label: "Sábado" },
    { value: "domingo", label: "Domingo" },
  ];

  useEffect(() => {
    fetchClases();
    fetchProfesores();
    fetchCanchas();
    fetchHorarios();
  }, []);

  // useEffect para cargar horarios extremos cuando cambie el deporte
  useEffect(() => {
    const fetchHorariosExtremos = async () => {
      if (deporteId) {
        try {
          const response = await api.get('/horarios-extremos-activos', {
            params: { deporte_id: deporteId }
          });
          setHorariosExtremos(response.data.horarios_extremos || []);
          // Reset selectores
          setHoraInicio('');
          setHoraFin('');
          setFormClase(prev => ({ ...prev, horario_id: '' }));
        } catch (error) {
          console.error('Error al cargar horarios extremos:', error);
          setHorariosExtremos([]);
        }
      } else {
        setHorariosExtremos([]);
        setHoraInicio('');
        setHoraFin('');
      }
    };

    fetchHorariosExtremos();
  }, [deporteId]);

  // useEffect para cargar horarios extremos para clases fijas
  useEffect(() => {
    const fetchHorariosExtremosFijas = async () => {
      if (deporteIdFijas) {
        try {
          const response = await api.get('/horarios-extremos-activos', {
            params: { deporte_id: deporteIdFijas }
          });
          console.log('reponse:', response.data);
          setHorariosExtremosFijas(response.data.horarios_extremos || []);
          // Reset selectores
          console.log('Horarios extremos para clases fijas:', response.data.horarios_extremos);
          setFormClasesFijas(prev => ({ 
            ...prev, 
            hora_inicio: '', 
            hora_fin: '', 
            deporte_id: deporteIdFijas 
          }));
        } catch (error) {
          console.error('Error al cargar horarios extremos para clases fijas:', error);
          setHorariosExtremosFijas([]);
        }
      } else {
        setHorariosExtremosFijas([]);
        setFormClasesFijas(prev => ({ 
          ...prev, 
          hora_inicio: '', 
          hora_fin: '', 
          deporte_id: '' 
        }));
      }
    };

    fetchHorariosExtremosFijas();
  }, [deporteIdFijas]);

  const fetchClases = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clases", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setClases(response.data.clases || response.data || []);
    } catch (error) {
      toast.error("Error al cargar las clases");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await api.get("/profesores");
      setProfesores(res.data.profesores || res.data || []);
    } catch {}
  };

  const fetchCanchas = async () => {
    try {
      const res = await api.get("/canchas");
      setCanchas(res.data.canchas || res.data || []);
    } catch {}
  };

  const fetchHorarios = async () => {
    try {
      const res = await api.get("/horarios");
      setHorarios(res.data.horarios || res.data || []);
    } catch {}
  };

  const handleSearch = () => {
    fetchClases();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchClases();
  };

  const handleAddClase = () => {
    // Si el formulario ya está abierto, lo cierra
    if (showForm) {
      setShowForm(false);
      setEditando(null);
      return;
    }
    setShowForm(true);
    setEditando(null);
    setFormClase({
      nombre: "",
      descripcion: "",
      fecha: "",
      profesor_id: "",
      cancha_id: "",
      horario_id: "",
      cupo_maximo: "",
      precio_mensual: "",
      activa: true,
    });
    setValidationErrors({});
    setDeporteId('');
    setHoraInicio('');
    setHoraFin('');
  };

  const handleToggleClasesFijas = () => {
    // Si el formulario ya está abierto, lo cierra
    if (showClasesFijas) {
      setShowClasesFijas(false);
      return;
    }
    setShowClasesFijas(true);
  };

  const handleEditClase = (clase) => {
    setShowForm(true);
    setEditando(clase);
    setFormClase({
      nombre: clase.nombre || "",
      descripcion: clase.descripcion || "",
      fecha: clase.fecha || "",
      profesor_id: clase.profesor_id || "",
      cancha_id: clase.cancha_id || "",
      horario_id: clase.horario_id || "",
      cupo_maximo: clase.cupo_maximo || "",
      precio_mensual: clase.precio_mensual || "",
      activa: !!clase.activa,
    });
    setValidationErrors({});
  };

  const handleDeleteClase = (clase) => {
    setClaseToDelete(clase);
    setShowDeleteModal(true);
  };

  const confirmDeleteClase = async () => {
    setIsSaving(true);
    try {
      await api.delete(`/clases/${claseToDelete.id}`);
      setClases(clases.filter((c) => c.id !== claseToDelete.id));
      toast.success("Clase eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la clase");
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
      setClaseToDelete(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormClase((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setValidationErrors({});
    try {
      const dia = getDiaSemanaBackend(formClase.fecha);
      const diaBackend = dia.charAt(0).toUpperCase() + dia.slice(1);
      const horariosDelDia = horariosPorDia[diaBackend] || [];
      const horaInicioStr = horaInicio.slice(0,5);
      const horaFinStr = horaFin.slice(0,5);

      // Siempre enviar array de horarios_id
      const horariosEnRango = horariosDelDia.filter(h =>
        h.hora_inicio >= `${horaInicioStr}:00` && h.hora_fin <= `${horaFinStr}:00`
      );
      const horarios_id = horariosEnRango.map(h => h.id); // SIEMPRE array

      const duracion = horarios_id.length;

      // Construir el objeto a enviar
      const dataToSend = {
        nombre: formClase.nombre,
        descripcion: formClase.descripcion,
        fecha_inicio: formClase.fecha,
        fecha_fin: formClase.fecha,
        profesor_id: parseInt(formClase.profesor_id),
        cancha_id: parseInt(formClase.cancha_id),
        cupo_maximo: parseInt(formClase.cupo_maximo),
        precio_mensual: parseFloat(formClase.precio_mensual),
        activa: formClase.activa,
        tipo: "unica",
        deporte_id: parseInt(deporteId),
        dia,
        hora_inicio: horaInicioStr,
        hora_fin: horaFinStr,
        duracion,
        horarios_id, // <-- SIEMPRE array, aunque sea uno solo
      };

      if (editando) {
        const response = await api.put(`/clases/${editando.id}`, dataToSend);
        setClases(
          clases.map((c) =>
            c.id === editando.id ? response.data.clase : c
          )
        );
        toast.success("Clase editada correctamente");
      } else {
        const response = await api.post("/clases", dataToSend);
        setClases([response.data.clase, ...clases]);
        toast.success("Clase creada correctamente");
      }
      setShowForm(false);
      setEditando(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Error al guardar la clase");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para el formulario de clases fijas
  const handleClasesFijasChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "dias_semana") {
      const nuevosDias = checked
        ? [...formClasesFijas.dias_semana, value]
        : formClasesFijas.dias_semana.filter((d) => d !== value);
      
      setFormClasesFijas((prev) => ({
        ...prev,
        dias_semana: nuevosDias,
      }));
      
      // Limpiar horarios de días no seleccionados
      if (!checked) {
        setHorariosSeleccionados(prev => {
          const newHorarios = { ...prev };
          delete newHorarios[value];
          return newHorarios;
        });
      }
    } else if (type === "checkbox") {
      setFormClasesFijas((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormClasesFijas((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Enviar clases fijas
  const handleSubmitClasesFijas = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setValidationErrors({});
    
    try {
      const formatearHora = (hora) => {
        if (!hora) return '';
        return hora.slice(0, 5);
      };

      // Para cada día, obtener los horarios_id en el rango seleccionado
      const diasHorarios = formClasesFijas.dias_semana.map(dia => {
        const diasMap = {
          'lunes': 'Lunes',
          'martes': 'Martes', 
          'miércoles': 'Miércoles',
          'jueves': 'Jueves',
          'viernes': 'Viernes',
          'sábado': 'Sábado',
          'domingo': 'Domingo'
        };
        const diaBackend = diasMap[dia];
        const horariosDelDia = horariosPorDia[diaBackend] || [];
        const horaInicioStr = formatearHora(horariosSeleccionados[dia]?.hora_inicio);
        const horaFinStr = formatearHora(horariosSeleccionados[dia]?.hora_fin);

        // Obtener todos los horarios_id en el rango
        const horarios_id = horariosDelDia
          .filter(h => h.hora_inicio >= `${horaInicioStr}:00` && h.hora_fin <= `${horaFinStr}:00`)
          .map(h => h.id);

        return {
          dia,
          hora_inicio: horaInicioStr,
          hora_fin: horaFinStr,
          horarios_id // <-- SIEMPRE array, aunque sea uno solo
        };
      }).filter(item => item.hora_inicio && item.hora_fin);

      // Preparar datos para enviar
      const dataToSend = {
        nombre: formClasesFijas.nombre,
        descripcion: formClasesFijas.descripcion,
        profesor_id: parseInt(formClasesFijas.profesor_id),
        cancha_id: parseInt(formClasesFijas.cancha_id),
        cupo_maximo: parseInt(formClasesFijas.cupo_maximo),
        precio_mensual: parseFloat(formClasesFijas.precio_mensual),
        activa: formClasesFijas.activa,
        fecha_inicio: formClasesFijas.fecha_inicio,
        duracion_meses: parseInt(formClasesFijas.duracion_meses),
        deporte_id: parseInt(deporteIdFijas),
        dias_horarios: diasHorarios, // cada item tiene horarios_id array
      };

      const res = await api.post("/clases/crear-fijas", dataToSend);
      toast.success("Clases fijas creadas correctamente");
      setShowClasesFijas(false);
      setDeporteIdFijas('');
      setHorariosPorDia({});
      setHorariosSeleccionados({});
      setFormClasesFijas({
        nombre: "",
        descripcion: "",
        profesor_id: "",
        cancha_id: "",
        cupo_maximo: "",
        precio_mensual: "",
        activa: true,
        fecha_inicio: "",
        duracion_meses: 1,
        dias_semana: [],
        deporte_id: "",
      });
      fetchClases();
    } catch (error) {
      console.error('Error completo:', error.response?.data);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error("Error en la validación");
      } else if (error.response?.data?.errores) {
        const erroresTexto = error.response.data.errores.join('\n');
        toast.error(`Errores en horarios:\n${erroresTexto}`);
      } else {
        toast.error(error.response?.data?.message || "Error al crear clases fijas");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // useEffect para cargar horarios por días seleccionados
  useEffect(() => {
    const fetchHorariosPorDias = async () => {
      if (deporteIdFijas && formClasesFijas.dias_semana.length > 0) {
        try {
          // Convertir días a formato que espera el backend
          const diasBackend = formClasesFijas.dias_semana.map(dia => {
            const diasMap = {
              'lunes': 'Lunes',
              'martes': 'Martes', 
              'miércoles': 'Miércoles',
              'jueves': 'Jueves',
              'viernes': 'Viernes',
              'sábado': 'Sábado',
              'domingo': 'Domingo'
            };
            return diasMap[dia];
          });

          const response = await api.post('/horarios/activos-por-dias', {
            deporte_id: deporteIdFijas,
            dias: diasBackend
          });

          setHorariosPorDia(response.data.horarios_por_dia || {});
          
          // Reset horarios seleccionados cuando cambian los días
          setHorariosSeleccionados({});
        } catch (error) {
          console.error('Error al cargar horarios por días:', error);
          setHorariosPorDia({});
          setHorariosSeleccionados({});
        }
      } else {
        setHorariosPorDia({});
        setHorariosSeleccionados({});
      }
    };

    fetchHorariosPorDias();
  }, [deporteIdFijas, formClasesFijas.dias_semana]);

  // Función para manejar cambio de horarios por día
  const handleHorarioChange = (dia, tipo, valor) => {
    setHorariosSeleccionados(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [tipo]: valor,
        // Reset hora_fin si cambia hora_inicio
        ...(tipo === 'hora_inicio' ? { hora_fin: '' } : {})
      }
    }));
  };

  // Función para obtener opciones de hora inicio por día
  const getOpcionesHoraInicioPorDia = (dia) => {
    const diasMap = {
      'lunes': 'Lunes',
      'martes': 'Martes', 
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    const diaBackend = diasMap[dia];
    const horariosDelDia = horariosPorDia[diaBackend] || [];
    
    const horasInicio = horariosDelDia
      .filter(h => h.hora_inicio)
      .map(h => h.hora_inicio);
    
    return [...new Set(horasInicio)].sort();
  };

  // Función para obtener opciones de hora fin por día
  const getOpcionesHoraFinPorDia = (dia) => {
    const horaInicioSeleccionada = horariosSeleccionados[dia]?.hora_inicio;
    if (!horaInicioSeleccionada) return [];
    
    const diasMap = {
      'lunes': 'Lunes',
      'martes': 'Martes', 
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    const diaBackend = diasMap[dia];
    const horariosDelDia = horariosPorDia[diaBackend] || [];
    
    const horasFin = horariosDelDia
      .filter(h => h.hora_fin && h.hora_fin >= horaInicioSeleccionada)
      .map(h => h.hora_fin);
    
    return [...new Set(horasFin)].sort();
  };

  // Funciones helper para clases individuales (que faltan)
  const getOpcionesHoraInicio = () => {
    const horasInicio = horariosExtremos
      .filter(h => !h.inactivo && h.hora_inicio)
      .map(h => h.hora_inicio);
    return [...new Set(horasInicio)].sort();
  };

  const getOpcionesHoraFin = () => {
    if (!horaInicio) return [];
    
    const horasFin = horariosExtremos
      .filter(h => !h.inactivo && h.hora_fin && h.hora_fin >= horaInicio)
      .map(h => h.hora_fin);
    return [...new Set(horasFin)].sort();
  };

  // Función de validación - solo verificar que existan horarios en el rango
  const validarRangoCompleto = (dia, horaInicio, horaFin) => {
    const diasMap = {
      'lunes': 'Lunes',
      'martes': 'Martes', 
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    const diaBackend = diasMap[dia];
    const horariosDelDia = horariosPorDia[diaBackend] || [];
    // Solo valida que haya al menos un horario activo en el rango seleccionado
    return horariosDelDia.some(h =>
      h.hora_inicio >= `${horaInicio}:00` && h.hora_fin <= `${horaFin}:00`
    );
  };

  // Función para obtener horarios disponibles para mostrar al usuario
  const getHorariosDisponiblesPorDia = (dia) => {
    const diasMap = {
      'lunes': 'Lunes',
      'martes': 'Martes', 
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    const diaBackend = diasMap[dia];
    const horariosDelDia = horariosPorDia[diaBackend] || [];
    
    return horariosDelDia
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
      .map(h => `${h.hora_inicio.slice(0,5)} - ${h.hora_fin.slice(0,5)}`)
      .join(', ');
  };

  // Helper para obtener el día de la semana en formato backend
  const getDiaSemanaBackend = (fecha) => {
    if (!fecha) return '';
    // Asegura formato yyyy-mm-dd
    const [year, month, day] = fecha.split('-').map(Number);
    // Mes en JS es 0-indexado
    const d = new Date(year, month - 1, day);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[d.getDay()];
  };

  // useEffect para cargar horarios activos del día cuando cambia fecha o deporte
  useEffect(() => {
    const cargarHorariosUnicos = async () => {
      if (formClase.fecha && deporteId) {
        const dia = getDiaSemanaBackend(formClase.fecha);
        const diaBackend = dia.charAt(0).toUpperCase() + dia.slice(1);
        try {
          const res = await api.post('/horarios/activos-por-dias', {
            deporte_id: deporteId,
            dias: [diaBackend]
          });
          setHorariosPorDia(res.data.horarios_por_dia || {});
        } catch (error) {
          setHorariosPorDia({});
        }
      } else {
        setHorariosPorDia({});
      }
    };
    cargarHorariosUnicos();
  }, [formClase.fecha, deporteId]);

  // Opciones para hora inicio y fin en clase única
  const getOpcionesHoraInicioUnica = () => {
    const dia = getDiaSemanaBackend(formClase.fecha);
    const diaBackend = dia.charAt(0).toUpperCase() + dia.slice(1);
    const horariosDelDia = horariosPorDia[diaBackend] || [];
    return [...new Set(horariosDelDia.map(h => h.hora_inicio))].sort();
  };

  const getOpcionesHoraFinUnica = () => {
    const dia = getDiaSemanaBackend(formClase.fecha);
    const diaBackend = dia.charAt(0).toUpperCase() + dia.slice(1);
    const horariosDelDia = horariosPorDia[diaBackend] || [];
    return [...new Set(horariosDelDia.filter(h => h.hora_fin >= horaInicio).map(h => h.hora_fin))].sort();
  };

  // Nueva funcionalidad: mostrar clases fijas individualmente
  const [mostrarIndividuales, setMostrarIndividuales] = useState(false);

  // Agrupa clases fijas por nombre, profesor, cancha, cupo, precio, etc.
  const agruparClasesFijas = (clases) => {
    const fijas = clases.filter(c => c.tipo === 'fija');
    const grupos = {};
    fijas.forEach(clase => {
      const key = [
        clase.nombre,
        clase.descripcion,
        clase.profesor_id,
        clase.cancha_id,
        clase.cupo_maximo,
        clase.precio_mensual,
        clase.activa,
        clase.profesor?.nombre,
        clase.profesor?.apellido,
        clase.cancha?.nro,
        clase.cancha?.nombre
      ].join('|');
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(clase);
    });
    return Object.values(grupos);
  };

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 justify-between items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1 pl-8 text-sm border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2 top-2 h-5 w-5 text-gray-400" />
          <button
            onClick={handleSearch}
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-[6px] shadow hover:bg-green-700"
          >
            <Search className="w-5 h-5 mr-1" />
            Buscar
          </button>
          <button
            onClick={handleClearSearch}
            className="flex items-center px-4 py-2 text-white bg-red-500 rounded-[6px] shadow hover:bg-red-600"
          >
            Limpiar
          </button>
        </div>
        <div className="flex gap-2">
        <button
          onClick={handleAddClase}
          className="inline-flex items-center px-4 py-2 bg-naranja hover:bg-blue-700 text-white rounded-[6px] shadow transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Clase Única
        </button>
              {/* Botón para crear clases fijas */}
      <button
        onClick={handleToggleClasesFijas}
        className="inline-flex items-center px-4 py-2 bg-naranja hover:bg-blue-700 text-white rounded-[6px] shadow transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Crear Clase Fija
      </button>
      </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-1">
            {editando ? "Editar Clase" : "Crear Nueva Clase"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {editando
              ? "Modifica los datos de la clase seleccionada."
              : "Completa todos los campos para crear una nueva clase."}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formClase.nombre}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.nombre ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.nombre && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.nombre[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                value={formClase.descripcion}
                onChange={handleFormChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
                maxLength={255}
              />
              {validationErrors.descripcion && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.descripcion[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profesor
              </label>
              <select
                name="profesor_id"
                value={formClase.profesor_id}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.profesor_id ? "border-red-500 text-red-500" : ""
                }`}
                required
              >
                <option value="">Seleccionar profesor</option>
                {profesores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre} {prof.apellido}
                  </option>
                ))}
              </select>
              {validationErrors.profesor_id && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.profesor_id[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de inicio
              </label>
              <input
                type="date"
                name="fecha"
                value={formClase.fecha}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.fecha ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.fecha && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.fecha[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deporte
              </label>
              <select
                name="deporte_id"
                value={deporteId}
                onChange={e => setDeporteId(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
                required
              >
                <option value="">Seleccionar deporte</option>
                {deportes.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre} {d.jugadores_por_equipo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cancha
              </label>
              <select
                name="cancha_id"
                value={formClase.cancha_id}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.cancha_id ? "border-red-500 text-red-500" : ""
                }`}
                required
              >
                <option value="">Seleccionar cancha</option>
                {canchas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nro ? `Cancha ${c.nro}` : c.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.cancha_id && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.cancha_id[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hora de Inicio
              </label>
              <select
                value={horaInicio}
                onChange={(e) => {
                  setHoraInicio(e.target.value);
                  setHoraFin(''); // Reset hora fin cuando cambia inicio
                }}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
                required
                disabled={!deporteId || !formClase.fecha}
              >
                <option value="">Seleccionar hora inicio</option>
                {getOpcionesHoraInicioUnica().map((hora) => (
                  <option key={hora} value={hora}>
                    {hora?.slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hora de Fin
              </label>
              <select
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
                required
                disabled={!horaInicio}
              >
                <option value="">Seleccionar hora fin</option>
                {getOpcionesHoraFinUnica().map((hora) => (
                  <option key={hora} value={hora}>
                    {hora?.slice(0, 5)}
                  </option>
                ))}
              </select>
              {horaInicio && horaFin && (
                <p className="text-sm text-gray-500 mt-1">
                  Duración: {((new Date(`1970-01-01T${horaFin}`) - new Date(`1970-01-01T${horaInicio}`)) / (1000 * 60 * 60))} hora(s)
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cupo máximo
              </label>
              <input
                type="number"
                name="cupo_maximo"
                value={formClase.cupo_maximo}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.cupo_maximo ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.cupo_maximo && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.cupo_maximo[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio mensual
              </label>
              <input
                type="number"
                name="precio_mensual"
                value={formClase.precio_mensual}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.precio_mensual ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.precio_mensual && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.precio_mensual[0]}
                </p>
              )}
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                name="activa"
                checked={formClase.activa}
                onChange={handleFormChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Activa
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-[6px] shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-[6px] shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : editando ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      )}



      {/* Modal para crear clases fijas */}
      {showClasesFijas && (
        <form
          onSubmit={handleSubmitClasesFijas}
          className="mb-6 bg-white p-4 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-1">Crear Clases Fijas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formClasesFijas.nombre}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                name="descripcion"
                value={formClasesFijas.descripcion}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profesor</label>
              <select
                name="profesor_id"
                value={formClasesFijas.profesor_id}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              >
                <option value="">Seleccionar profesor</option>
                {profesores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre} {prof.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deporte
              </label>
              <select
                name="deporte_id"
                value={deporteIdFijas}
                onChange={e => setDeporteIdFijas(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              >
                <option value="">Seleccionar deporte</option>
                {deportes.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre} {d.jugadores_por_equipo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cancha</label>
              <select
                name="cancha_id"
                value={formClasesFijas.cancha_id}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              >
                <option value="">Seleccionar cancha</option>
                {canchas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nro ? `Cancha ${c.nro}` : c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cupo máximo</label>
              <input
                type="number"
                name="cupo_maximo"
                value={formClasesFijas.cupo_maximo}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio mensual</label>
              <input
                type="number"
                name="precio_mensual"
                value={formClasesFijas.precio_mensual}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formClasesFijas.fecha_inicio}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duración (meses)</label>
              <input
                type="number"
                name="duracion_meses"
                value={formClasesFijas.duracion_meses}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                min={1}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Días de la semana</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {diasSemana.map((d) => (
                  <label key={d.value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="dias_semana"
                      value={d.value}
                      checked={formClasesFijas.dias_semana.includes(d.value)}
                      onChange={handleClasesFijasChange}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Horarios por día */}
            {formClasesFijas.dias_semana.length > 0 && (
              <div className="sm:col-span-2 space-y-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Horarios por día 
                  <span className="text-red-500 text-xs ml-1">
                    (Selecciona horarios para todos los días)
                  </span>
                </h3>
                {formClasesFijas.dias_semana.map((dia) => {
                  const tieneHorarios = horariosSeleccionados[dia]?.hora_inicio && horariosSeleccionados[dia]?.hora_fin;
                  const rangoValido = tieneHorarios ? validarRangoCompleto(
                    dia, 
                    horariosSeleccionados[dia].hora_inicio.slice(0,5), 
                    horariosSeleccionados[dia].hora_fin.slice(0,5)
                  ) : true;
                  const horariosDisponibles = getHorariosDisponiblesPorDia(dia);
                  return (
                    <div key={dia} className={`border rounded-lg p-3 ${
                      tieneHorarios 
                        ? (rangoValido ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
                        : 'bg-gray-50'
                    }`}>
                      <h4 className="text-sm font-medium text-gray-800 mb-2 capitalize flex items-center">
                        {diasSemana.find(d => d.value === dia)?.label}
                        {tieneHorarios && (
                          rangoValido ? (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              ✓ Válido
                            </span>
                          ) : (
                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              ⚠ No disponible
                            </span>
                          )
                        )}
                      </h4>
                      {horariosDisponibles && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-xs">
                          <span className="font-medium text-blue-700">Horarios disponibles:</span>
                          <div className="text-blue-600 ml-1 mt-1">{horariosDisponibles}</div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Hora Inicio</label>
                          <select
                            value={horariosSeleccionados[dia]?.hora_inicio || ''}
                            onChange={(e) => handleHorarioChange(dia, 'hora_inicio', e.target.value)}
                            className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            required
                            disabled={!deporteIdFijas}
                          >
                            <option value="">Seleccionar</option>
                            {getOpcionesHoraInicioPorDia(dia).map((hora) => (
                              <option key={hora} value={hora}>
                                {hora?.slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Hora Fin</label>
                          <select
                            value={horariosSeleccionados[dia]?.hora_fin || ''}
                            onChange={(e) => handleHorarioChange(dia, 'hora_fin', e.target.value)}
                            className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            required
                            disabled={!horariosSeleccionados[dia]?.hora_inicio}
                          >
                            <option value="">Seleccionar</option>
                            {getOpcionesHoraFinPorDia(dia).map((hora) => (
                              <option key={hora} value={hora}>
                                {hora?.slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {horariosSeleccionados[dia]?.hora_inicio && horariosSeleccionados[dia]?.hora_fin && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500">
                            Duración: {((new Date(`1970-01-01T${horariosSeleccionados[dia].hora_fin}`) - 
                                        new Date(`1970-01-01T${horariosSeleccionados[dia].hora_inicio}`)) / 
                                       (1000 * 60 * 60))} hora(s)
                          </p>
                          {!rangoValido && (
                            <p className="text-xs text-red-600 bg-red-100 p-1 rounded">
                              ⚠ Este horario no está disponible para {dia}. 
                              Selecciona un horario de los disponibles arriba.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center mt-2 sm:col-span-2">
              <input
                type="checkbox"
                name="activa"
                checked={formClasesFijas.activa}
                onChange={handleClasesFijasChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Activa
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowClasesFijas(false)}
              className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-[6px] shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-[6px] shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={isSaving || 
                !deporteIdFijas || 
                !formClasesFijas.cancha_id ||
                formClasesFijas.dias_semana.length === 0 ||
                !formClasesFijas.dias_semana.every(dia => {
                  const horarios = horariosSeleccionados[dia];
                  return horarios?.hora_inicio && horarios?.hora_fin;
                })
              }
            >
              {isSaving ? "Creando..." : "Crear Clases Fijas"}
            </button>
          </div>
        </form>
      )}

      {/* Checkbox para alternar vista */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={mostrarIndividuales}
          onChange={e => setMostrarIndividuales(e.target.checked)}
          id="mostrarIndividuales"
          className="mr-2"
        />
        <label htmlFor="mostrarIndividuales" className="text-sm font-medium text-gray-700">
          Mostrar clases fijas individualmente
        </label>
      </div>

      {/* Lista de Clases */}
      {loading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <BtnLoading />
        </div>
      ) : (
        <div>
          {clases.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No hay clases registradas.</div>
          ) : (
            <ul className="space-y-6">
              {/* Vista individual */}
              {mostrarIndividuales ? (
                clases.map((clase) => (
                  <li key={clase.id} className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-2">
                    <div className="w-full justify-between flex items-center">               
                      <div className="flex items-center gap-3 mb-1">
                        <div className="bg-blue-100 rounded-full p-3">
                          <Users className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="text-lg capitalize font-semibold text-gray-900">
                              {clase.nombre}
                            </span>
                            {clase.activa && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
                                Activa
                              </span>
                            )}
                          </div>
                          <div className="text-gray-600 text-sm mb-2">{clase.descripcion}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleEditClase(clase)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClase(clase)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 mt-4 md:grid-cols-4 gap-2 text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Fecha inicio:</span>{" "}
                          <span className="font-medium capitalize">{clase.fecha_inicio && format(parseISO(clase.fecha_inicio), "EEEE, dd/MM/yyyy", { locale: es })}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Horario:</span>{" "}
                          <span className="font-medium">
                            {clase.horarios && clase.horarios.length > 0
                              ? `${clase.horarios[0].hora_inicio.slice(0,5)} - ${clase.horarios[clase.horarios.length-1].hora_fin.slice(0,5)}`
                              : "-"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Cancha:</span>{" "}
                          <span className="font-medium">
                            {clase.cancha?.nro ? `Cancha ${clase.cancha.nro}` : clase.cancha?.nombre}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Profesor:</span>{" "}
                          <span className="font-medium">{clase.profesor?.nombre} {clase.profesor?.apellido}</span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Cupo máximo:</span>{" "}
                          <span className="font-medium">{clase.cupo_maximo}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Precio mensual:</span>{" "}
                          <span className="font-medium">${clase.precio_mensual}</span>
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <>
                  {/* Clases únicas */}
                  {clases.filter(c => c.tipo !== 'fija').map((clase) => (
                    <li key={clase.id} className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-2">
                      <div className="w-full justify-between flex items-center">               
                        <div className="flex items-center gap-3 mb-1">
                          <div className="bg-blue-100 rounded-full p-3">
                            <Users className="h-7 w-7 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="text-lg capitalize font-semibold text-gray-900">
                                {clase.nombre}
                              </span>
                              {clase.activa && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
                                  Activa
                                </span>
                              )}
                            </div>
                            
                            <div className="text-gray-600 text-sm mb-2">{clase.descripcion}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handleEditClase(clase)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClase(clase)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 mt-4 md:grid-cols-4 gap-2 text-sm mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="flex-col flex">
                            <span className=" text-gray-500">Fecha inicio:</span>{" "}
                            <span className="font-medium capitalize">{clase.fecha_inicio && format(parseISO(clase.fecha_inicio), "EEEE, dd/MM/yyyy", { locale: es })}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="flex-col flex">
                            <span className=" text-gray-500">Horario:</span>{" "}
                            <span className="font-medium">
                              {clase.horarios && clase.horarios.length > 0
                                ? `${clase.horarios[0].hora_inicio.slice(0,5)} - ${clase.horarios[clase.horarios.length-1].hora_fin.slice(0,5)}`
                                : "-"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="flex-col flex">
                            <span className=" text-gray-500">Cancha:</span>{" "}
                            <span className="font-medium">
                              {clase.cancha?.nro ? `Cancha ${clase.cancha.nro}` : clase.cancha?.nombre}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="flex-col flex">
                            <span className=" text-gray-500">Profesor:</span>{" "}
                            <span className="font-medium">{clase.profesor?.nombre} {clase.profesor?.apellido}</span>
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="flex-col flex">
                            <span className=" text-gray-500">Cupo máximo:</span>{" "}
                            <span className="font-medium">{clase.cupo_maximo}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="flex-col flex">
                            <span className=" text-gray-500">Precio mensual:</span>{" "}
                            <span className="font-medium">${clase.precio_mensual}</span>
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                  {/* Clases fijas agrupadas */}
                  {agruparClasesFijas(clases).map((grupo, idx) => {
                    const clase = grupo[0];
                    return (
                      <li key={idx} className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="bg-blue-100 rounded-full p-3">
                            <Users className="h-7 w-7 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-lg capitalize font-semibold text-gray-900">{clase.nombre}</span>
                            {clase.activa && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
                                Activa
                              </span>
                            )}
                            <div className="text-gray-600 text-sm mb-2">{clase.descripcion}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 mt-4 md:grid-cols-4 gap-2 text-sm mb-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Cancha:</span>{" "}
                              <span className="font-medium">
                                {clase.cancha?.nro ? `Cancha ${clase.cancha.nro}` : clase.cancha?.nombre}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Profesor:</span>{" "}
                              <span className="font-medium">{clase.profesor?.nombre} {clase.profesor?.apellido}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Cupo máximo:</span>{" "}
                              <span className="font-medium">{clase.cupo_maximo}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Precio mensual:</span>{" "}
                              <span className="font-medium">${clase.precio_mensual}</span>
                            </span>
                          </div>
                        </div>
                        {/* Horarios por día */}
                        <div className="mt-2">
                          <span className="font-medium text-gray-700">Días y horarios:</span>
                          <ul className="mt-1 space-y-1">
                            {grupo.map((c) => (
                              <li key={c.id} className="text-sm text-gray-700">
                                <span className="font-semibold capitalize">{format(parseISO(c.fecha_inicio), "EEEE", { locale: es })}:</span>{" "}
                                {c.horarios && c.horarios.length > 0
                                  ? `${c.horarios[0].hora_inicio.slice(0,5)} - ${c.horarios[c.horarios.length-1].hora_fin.slice(0,5)}`
                                  : "-"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-[8px] shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Confirmar Eliminación
            </h2>
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar la clase?
            </p>
            <div className="font-semibold mb-2 text-center text-gray-900 bg-gray-50 px-3 py-2 rounded-[8px] border">
              "{claseToDelete?.nombre}"
            </div>
            <p className="text-red-600">Esta acción no se puede deshacer.</p>
            <div className="flex mt-6 justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteClase}
                disabled={isSaving}
                className={`px-3 py-2 capitalize text-white rounded ${
                  isSaving
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSaving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PestanaClases;