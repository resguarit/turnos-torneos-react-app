import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';

export default function AltaTorneo() {
  const { id } = useParams(); // Obtener el ID del torneo desde la URL
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga inicializado en true
  const [formData, setFormData] = useState({
    nombre: '',
    año: new Date().getFullYear(),
    deporte_id: '',
  });
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
          alert('Error al cargar los datos del torneo');
          navigate('/torneos-admi'); // Redirigir si ocurre un error
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
      setLoading(false); // Finalizar el estado de carga
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deporte_id) {
      alert('Debe seleccionar un deporte');
      return;
    }
    try {
      setLoading(true);
      if (id) {
        await api.put(`/torneos/${id}`, formData);
        alert('Torneo actualizado correctamente');
      } else {
        await api.post('/torneos', formData);
        alert('Torneo creado correctamente');
      }
      navigate('/torneos-admi');
    } catch (error) {
      console.error('Error saving torneo:', error);
      alert('Error al guardar el torneo');
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);11

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
                onChange={handleChange}
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
    </div>
  );
}