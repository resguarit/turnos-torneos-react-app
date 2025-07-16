import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, Search, Calendar, Clock, User, DollarSign, Users, MapPin } from "lucide-react";
import BtnLoading from "@/components/BtnLoading";
import api from "@/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDeportes } from '@/context/DeportesContext';
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import FormClaseUnica from "../../components/PanelAdmin/Clases/FormClaseUnica";
import FormClasesFijas from "../../components/PanelAdmin/Clases/FormClasesFijas";
import TarjetaClase from "../../components/PanelAdmin/Clases/TarjetaClase";
import TarjetaGrupoClasesFijas from "../../components/PanelAdmin/Clases/TarjetaGrupoClasesFijas";
import ConfirmDeleteModal from "./Modals/ConfirmDeleteModal";


const PestanaClases = () => {
  const { deportes } = useDeportes();
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModalInd, setShowDeleteModalInd] = useState(false);
  const [showDeleteModalMany, setShowDeleteModalMany] = useState(false);
  const [claseToDelete, setClaseToDelete] = useState(null);
  const [grupoToDelete, setGrupoToDelete] = useState(null);
  const [deporteId, setDeporteId] = useState('');
  const [horariosExtremos, setHorariosExtremos] = useState([]);

  // Estados para horarios extremos y selectores
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

    // Precarga los valores del formulario
    setFormClase({
      nombre: clase.nombre || "",
      descripcion: clase.descripcion || "",
      fecha: clase.fecha_inicio ? clase.fecha_inicio.slice(0,10) : "", // formato yyyy-mm-dd
      profesor_id: clase.profesor_id ? String(clase.profesor_id) : "",
      cancha_id: clase.cancha_id ? String(clase.cancha_id) : "",
      cupo_maximo: clase.cupo_maximo || "",
      precio_mensual: clase.precio_mensual || "",
      activa: !!clase.activa,
    });

    setValidationErrors({});
    setDeporteId(clase.deporte_id ? String(clase.deporte_id) : '');

    // Precarga hora inicio y fin si existen
    setHoraInicio(clase.hora_inicio ? clase.hora_inicio.slice(0,5) : '');
    setHoraFin(clase.hora_fin ? clase.hora_fin.slice(0,5) : '');
  };

  const handleDeleteClase = (clase) => {
    setClaseToDelete(clase);
    console.log('Clase a eliminar:', clase);
    setShowDeleteModalInd(true);
  };

  const openModalDeleteMany = (grupo) => {
    setGrupoToDelete(grupo); // Guarda el grupo a eliminar
    setShowDeleteModalMany(true);
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
      setShowDeleteModalInd(false);
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
      const horario_ids = horariosEnRango.map(h => h.id); // <-- CAMBIO DE NOMBRE

      const duracion = horario_ids.length;

      // Construir el objeto a enviar
      const dataToSend = {
        nombre: formClase.nombre,
        descripcion: formClase.descripcion,
        fecha_inicio: formClase.fecha,
        fecha_fin: formClase.fecha,
        profesor_id: parseInt(formClase.profesor_id),
        cancha_id: parseInt(formClase.cancha_id),
        horario_ids, // <-- CAMBIO DE NOMBRE
        cupo_maximo: parseInt(formClase.cupo_maximo),
        precio_mensual: parseFloat(formClase.precio_mensual),
        activa: formClase.activa,
        tipo: "unica",
        deporte_id: parseInt(deporteId),
        dia,
        hora_inicio: horaInicioStr,
        hora_fin: horaFinStr,
        duracion,
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

  // Eliminar agrupado de clases fijas
  const handleDeleteGrupoClasesFijas = async (grupo) => {
    if (!grupo) return;
    const idsActuales = grupo
      .map(c => c.id)
      .filter(id => clases.some(clase => clase.id === id));
    if (idsActuales.length === 0) {
      toast.info("No hay clases fijas actuales para eliminar en este grupo.");
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/clases/delete-many', { ids: idsActuales });
      setClases(prev => prev.filter(c => !idsActuales.includes(c.id)));
      toast.success("Clases fijas eliminadas correctamente");
    } catch (error) {
      toast.error("Error al eliminar el grupo de clases fijas");
    } finally {
      setIsSaving(false);
      setShowDeleteModalMany(false);
      setGrupoToDelete(null);
    }
  };

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

  // Filtrar canchas por deporte seleccionado
  const canchasFiltradas = deporteId
    ? canchas.filter(c => c.deporte_id === parseInt(deporteId))
    : [];

  // Filtrar canchas para clases fijas
  const canchasFiltradasFijas = deporteIdFijas
    ? canchas.filter(c => c.deporte_id === parseInt(deporteIdFijas))
    : [];

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
        <FormClaseUnica
          formClase={formClase}
          setFormClase={setFormClase}
          handleFormChange={handleFormChange}
          handleSubmit={handleSubmit}
          validationErrors={validationErrors}
          isSaving={isSaving}
          profesores={profesores}
          canchasFiltradas={canchasFiltradas}
          deportes={deportes}
          deporteId={deporteId}
          setDeporteId={setDeporteId}
          horaInicio={horaInicio}
          setHoraInicio={setHoraInicio}
          horaFin={horaFin}
          setHoraFin={setHoraFin}
          getOpcionesHoraInicioUnica={getOpcionesHoraInicioUnica}
          getOpcionesHoraFinUnica={getOpcionesHoraFinUnica}
          showForm={showForm}
          setShowForm={setShowForm}
          editando={editando}
        />
      )}



      {/* Modal para crear clases fijas */}
      {showClasesFijas && (
          <FormClasesFijas
            formClasesFijas={formClasesFijas}
            setFormClasesFijas={setFormClasesFijas}
            handleClasesFijasChange={handleClasesFijasChange}
            handleSubmitClasesFijas={handleSubmitClasesFijas}
            validationErrors={validationErrors}
            isSaving={isSaving}
            profesores={profesores}
            canchasFiltradasFijas={canchasFiltradasFijas}
            deporteIdFijas={deporteIdFijas}
            deportes={deportes}
            setDeporteIdFijas={setDeporteIdFijas}
            horariosExtremosFijas={horariosExtremosFijas}
            diasSemana={diasSemana}
            horariosPorDia={horariosPorDia}
            horariosSeleccionados={horariosSeleccionados}
            handleHorarioChange={handleHorarioChange}
            getOpcionesHoraInicioPorDia={getOpcionesHoraInicioPorDia}
            getOpcionesHoraFinPorDia={getOpcionesHoraFinPorDia}
            getHorariosDisponiblesPorDia={getHorariosDisponiblesPorDia}
            showClasesFijas={showClasesFijas}
            setShowClasesFijas={setShowClasesFijas}
            validarRangoCompleto={validarRangoCompleto}
          />
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
                  <TarjetaClase
                    key={clase.id}
                    clase={clase}
                    handleEditClase={handleEditClase}
                    handleDeleteClase={handleDeleteClase}
                  />
                ))
              ) : (
                <>
                  {/* Clases únicas */}
                  {clases.filter(c => c.tipo !== 'fija').map((clase) => (
                    <TarjetaClase
                      key={clase.id}
                      clase={clase}
                      handleEditClase={handleEditClase}
                      handleDeleteClase={handleDeleteClase}
                    />
                  ))}
                  {/* Clases fijas agrupadas */}
                  {agruparClasesFijas(clases).map((grupo, idx) => {
                    const clase = grupo[0];
                    return (
                      <TarjetaGrupoClasesFijas
                        key={idx}
                        grupo={grupo}
                        handleDeleteGrupoClasesFijas={() => openModalDeleteMany(grupo)}
                        isSaving={isSaving}
                      />
                    );
                  })}
                </>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModalInd && (
        <ConfirmDeleteModal
        isOpen={showDeleteModalInd}
        onClose={() => {
          setShowDeleteModalInd(false);
          setClaseToDelete(null);
        }}
        onConfirm={confirmDeleteClase}
        loading={isSaving}
        accionTitulo="Eliminación"
        accion="eliminar"
        pronombre="la"
        entidad="clase"
        accionando="Eliminando"
        nombreElemento={
          claseToDelete
            ? `${claseToDelete.nombre} - ${claseToDelete.fecha_inicio
                ? format(parseISO(claseToDelete.fecha_inicio), "EEE, dd/MM/yyyy", { locale: es })
                : ""}`
            : ""
        }
        />
      )}

      {showDeleteModalMany && (
        <ConfirmDeleteModal
          isOpen={showDeleteModalMany}
          onClose={() => {
            setShowDeleteModalMany(false);
            setGrupoToDelete(null);
          }}
          onConfirm={() => handleDeleteGrupoClasesFijas(grupoToDelete)}
          loading={isSaving}
          accionTitulo="Eliminación"
          accion="eliminar"
          pronombre="el grupo de"
          entidad="clases fijas"
          accionando="Eliminando"
          nombreElemento={
            grupoToDelete && grupoToDelete[0]
              ? grupoToDelete[0].nombre
              : ""
          }
        />
      )}
    </div>
  );
};

export default PestanaClases;