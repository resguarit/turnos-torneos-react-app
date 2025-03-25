import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';

export default function AltaZona() {
  const { id } = useParams(); // Obtener el ID de la zona desde la URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Estado de carga inicializado en true
  const [formData, setFormData] = useState({
    nombre: '',
    formato: 'Liga', // Valor por defecto
    año: new Date().getFullYear(),
    torneo_id: '', // ID del torneo asociado
  });

  useEffect(() => {
    const fetchZona = async () => {
      if (id) {
        try {
          const response = await api.get(`/zonas/${id}`);
          setFormData({
            nombre: response.data.nombre,
            formato: response.data.formato,
            año: response.data.año,
            torneo_id: response.data.torneo_id,
          });
        } catch (error) {
          console.error('Error fetching zona:', error);
          alert('Error al cargar los datos de la zona');
          navigate('/zonas-admi'); // Redirigir si ocurre un error
        }
      }
    };

    const fetchData = async () => {
      await fetchZona();
      setLoading(false); // Finalizar el estado de carga
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        // Editar zona
        await api.put(`/zonas/${id}`, formData);
        alert('Zona actualizada correctamente');
      } else {
        // Crear nueva zona
        await api.post('/zonas', formData);
        alert('Zona creada correctamente');
      }
      navigate('/zonas-admi');
    } catch (error) {
      console.error('Error saving zona:', error);
      alert('Error al guardar la zona');
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
          <button onClick={() => navigate('/zonas-admi')} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="bg-white text-black p-4 rounded-xl shadow-lg w-1/2">
          <h2 className="text-2xl font-sans font-medium mb-1">{id ? 'Editar Zona' : 'Crear Nueva Zona'}</h2>
          <p className="mb-4 text-sm text-gray-500">Complete los datos para {id ? 'editar la' : 'crear una nueva'} zona</p>
          <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium font-sans text-lg">Nombre de la Zona:</label>
              <input
                className="border-gray-300 border w-full px-2 rounded-xl"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-medium font-sans text-lg">Formato:</label>
              <select
                className="border-gray-300 border w-full p-1 rounded-xl"
                name="formato"
                value={formData.formato}
                onChange={handleChange}
                required
              >
                <option value="Liga">Liga</option>
                <option value="Eliminatoria">Eliminatoria</option>
                <option value="Grupos">Grupos</option>
              </select>
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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="p-2 px-4 bg-naranja text-white rounded-[6px]"
              >
                {loading ? 'Guardando...' : id ? 'Actualizar Zona' : 'Crear Zona'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}