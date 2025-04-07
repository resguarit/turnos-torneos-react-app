import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { X, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AltaTorneo() {
  const { id } = useParams();
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    año: new Date().getFullYear(),
    deporte_id: '',
  });
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar el modal
  const [nuevoDeporte, setNuevoDeporte] = useState({ nombre: '', jugadores_por_equipo: '' }); // Datos del nuevo deporte
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTorneo = async () => {
      if (id) {
        try {
          const response = await api.get(`/torneos/${id}`);
          setFormData({
            nombre: response.data.nombre,
            año: response.data.año,
            deporte_id: response.data.deporte_id,
          });
        } catch (error) {
          console.error('Error fetching torneo:', error);
          toast.error('Error al cargar los datos del torneo');
          navigate('/torneos-admi');
        }
      }
    };

    const fetchDeportes = async () => {
      try {
        const response = await api.get('/deportes');
        setDeportes(response.data);
      } catch (error) {
        console.error('Error fetching deportes:', error);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchTorneo(), fetchDeportes()]);
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNuevoDeporteSubmit = async () => {
    try {
      const response = await api.post('/deportes', nuevoDeporte);
      const deporteCreado = response.data.deporte;
      setDeportes([...deportes, deporteCreado]); // Agregar el nuevo deporte a la lista
      setFormData({ ...formData, deporte_id: deporteCreado.id }); // Seleccionar el nuevo deporte
      toast.success('Deporte creado correctamente');
      setModalVisible(false); // Cerrar el modal
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
      <main className="flex-col grow p-6 bg-gray-100 flex items-center ">
        <div className="w-full flex mb-2">
          <button onClick={() => navigate('/torneos-admi')} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="bg-white text-black p-4 rounded-xl shadow-lg w-1/2">
          <h2 className="text-2xl font-sans font-medium mb-1">{id ? 'Editar Torneo' : 'Crear Nuevo Torneo'}</h2>
          <p className="mb-4 text-sm text-gray-500">Complete los datos para {id ? 'editar el' : 'crear un nuevo'} torneo</p>
          <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium font-sans text-lg">Nombre del Torneo:</label>
              <input
                className="border-gray-300 border w-full px-2 rounded-xl"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-medium font-sans text-lg">Año:</label>
              <select
                className="border-gray-300 border w-full p-1 rounded-xl"
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
              <label className="font-medium font-sans text-lg">Deporte:</label>
              <select
                className="border-gray-300 border w-full p-1 rounded-xl"
                name="deporte_id"
                value={formData.deporte_id}
                onChange={(e) => {
                  if (e.target.value === 'nuevo') {
                    setModalVisible(true); // Abrir el modal si se selecciona "Nuevo Deporte"
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
                    {deporte.nombre} ({deporte.jugadores_por_equipo} jugadores por equipo)
                  </option>
                ))}
                <option value="nuevo">+ Nuevo Deporte</option>
              </select>
            </div>
            <div className="flex justify-end">
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

      {/* Modal para crear un nuevo deporte */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Deporte</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Nombre del Deporte:</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={nuevoDeporte.nombre}
                onChange={(e) => setNuevoDeporte({ ...nuevoDeporte, nombre: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Jugadores por Equipo:</label>
              <input
                type="number"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={nuevoDeporte.jugadores_por_equipo}
                onChange={(e) => setNuevoDeporte({ ...nuevoDeporte, jugadores_por_equipo: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleNuevoDeporteSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
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