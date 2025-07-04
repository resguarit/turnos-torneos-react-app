import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { X, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDeportes } from '@/context/DeportesContext'; // <-- Importa el contexto
import ConfirmModal from '../Modals/ConfirmModal'; 
import BackButton from '@/components/BackButton';

export default function AltaTorneo() {
  const { id } = useParams();
  const { deportes, setDeportes } = useDeportes(); // <-- Usa el contexto
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    año: new Date().getFullYear(),
    deporte_id: '',
    precio_inscripcion: '',
    precio_por_fecha: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoDeporte, setNuevoDeporte] = useState({ nombre: '', jugadores_por_equipo: '', duracion_turno: '' });
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    const fetchTorneo = async () => {
      if (id) {
        try {
          const response = await api.get(`/torneos/${id}`);
          setFormData({
            nombre: response.data.nombre,
            año: response.data.año,
            deporte_id: response.data.deporte_id,
            precio_inscripcion: response.data.precio_inscripcion || '',
            precio_por_fecha: response.data.precio_por_fecha || '',
          });
        } catch (error) {
          console.error('Error fetching torneo:', error);
          toast.error('Error al cargar los datos del torneo');
          navigate('/torneos-admi');
        }
      }
    };

    // Ya no necesitas fetchDeportes ni fetchData
    const fetchData = async () => {
      await fetchTorneo();
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      setShowConfirmModal(true);
      setPendingSubmit(true);
    } else {
      await submitZona();
    }
  };


  const submitZona = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.deporte_id) {
      toast.error('Debe seleccionar un deporte');
      return;
    }
    try {
      setLoading(true);
      if (id) {
        await api.put(`/torneos/${id}`, formData);
        toast.success('Torneo actualizado correctamente');
      } else {
        await api.post('/torneos', formData);
        toast.success('Torneo creado correctamente');
      }
      navigate('/torneos-admi');
    } catch (error) {
      console.error('Error saving torneo:', error);
      toast.error('Error al guardar el torneo');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setPendingSubmit(false);
    }
  };

  const handleConfirmUpdate = async () => {
    await submitZona();
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
    setPendingSubmit(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNuevoDeporteSubmit = async () => {
    try {
      await api.post('/deportes', nuevoDeporte);
      // Vuelve a consultar la lista completa de deportes
      const response = await api.get('/deportes');
      const deportesActualizados = response.data.deportes || response.data;
      setDeportes(deportesActualizados); // Esto actualiza el contexto y el localStorage
      // Selecciona el último deporte creado automáticamente
      const ultimo = deportesActualizados[deportesActualizados.length - 1];
      setFormData({ ...formData, deporte_id: ultimo?.id || '' });
      toast.success('Deporte creado correctamente');
      setModalVisible(false);
    } catch (error) {
      console.error('Error creando deporte:', error);
      toast.error('Error al crear el deporte');
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
          <BtnLoading />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-col grow p-4 sm:p-6 bg-gray-100 flex items-center">
        <div className="w-full flex mb-2">
          <BackButton ruta={'/torneos-admi'} />
        </div>
        <div className="bg-white text-black p-4 rounded-xl shadow-lg w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2">
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">{id ? 'Editar Torneo' : 'Crear Nuevo Torneo'}</h2>
          <p className="mb-4 text-sm text-gray-500">Complete los datos para {id ? 'editar el' : 'crear un nuevo'} torneo</p>
          <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium text-base sm:text-lg">Nombre del Torneo:</label>
              <input
                className="border-gray-300 border w-full p-1 rounded-[6px]"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-medium text-base sm:text-lg">Año:</label>
              <select
                className="border-gray-300 border w-full p-1 py-[5px] rounded-[6px]"
                name="año"
                value={formData.año}
                onChange={handleChange}
                required
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-medium text-base sm:text-lg">Deporte:</label>
              <select
                className="border-gray-300 border w-full p-1 py-[5px] rounded-[6px]"
                name="deporte_id"
                value={formData.deporte_id}
                onChange={(e) => {
                  if (e.target.value === 'nuevo') {
                    setModalVisible(true);
                  } else {
                    handleChange(e);
                  }
                }}
                required
              >
                <option value="" disabled>
                  Seleccione un deporte
                </option>
                {deportes.map((deporte) => (
                  <option key={deporte.id} value={deporte.id}>
                    {deporte.nombre} {deporte.jugadores_por_equipo}
                  </option>
                ))}
                <option className="bg-gray-300" value="nuevo">+ Nuevo Deporte</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-base sm:text-lg">Precio Inscripción:</label>
              <input
                type="number"
                className="border-gray-300 border w-full p-1 rounded-[6px]"
                name="precio_inscripcion"
                value={formData.precio_inscripcion}
                onChange={handleChange}
                required
                min={0}
              />
            </div>
            <div>
              <label className="font-medium text-base sm:text-lg">Precio por Fecha:</label>
              <input
                type="number"
                className="border-gray-300 border w-full p-1 rounded-[6px]"
                name="precio_por_fecha"
                value={formData.precio_por_fecha}
                onChange={handleChange}
                required
                min={0}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="p-2 px-4 bg-naranja text-white rounded-[6px]"
              >
                {loading ? 'Guardando...' : id ? 'Actualizar Torneo' : 'Crear Torneo'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmUpdate}
        loading={loading}
        accionTitulo="actualización"
        accion="actualizar"
        pronombre="el"
        entidad="torneo"
        accionando="Actualizando"
      />

      {/* Modal para crear un nuevo deporte */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-[8px] shadow-lg w-full max-w-[400px]">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Deporte</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Nombre del Deporte:</label>
              <input
                type="text"
                className="border border-gray-300 rounded-[6px] p-1 w-full"
                value={nuevoDeporte.nombre}
                onChange={(e) => setNuevoDeporte({ ...nuevoDeporte, nombre: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Jugadores por Equipo:</label>
              <input
                type="number"
                className="border border-gray-300 rounded-[6px] p-1 w-full"
                value={nuevoDeporte.jugadores_por_equipo}
                onChange={(e) => setNuevoDeporte({ ...nuevoDeporte, jugadores_por_equipo: e.target.value })}
                min={1}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Duración del Turno (minutos):</label>
              <input
                type="number"
                className="border border-gray-300 rounded-[6px] p-1 w-full"
                value={nuevoDeporte.duracion_turno}
                onChange={(e) => setNuevoDeporte({ ...nuevoDeporte, duracion_turno: e.target.value })}
                min={1}
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-[6px] hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleNuevoDeporteSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-[6px]"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}