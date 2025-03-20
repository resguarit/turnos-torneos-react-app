import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';

export default function AltaTorneo() {
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    año: new Date().getFullYear(),
    deporte_id: '', // Asumiendo que tienes una lista de deportes para seleccionar
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeportes = async () => {
      try {
        const response = await api.get('/deportes');
        setDeportes(response.data);
      } catch (error) {
        console.error('Error fetching sports:', error);
      }
    };

    fetchDeportes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deporte_id) {
      alert('Debe seleccionar un deporte');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/torneos', formData);
      if (response.status === 201) {
        // Redirigir a /torneos-admi después de crear el torneo
        setLoading(false);
        navigate('/torneos-admi');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-col grow p-6 bg-gray-100 flex items-center ">
        <div className="w-full flex mb-2">
      <button onClick={() => navigate('/torneos-admi')} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center"><ChevronLeft className="w-5"/> Atrás</button>
        </div>
        <div className="bg-white text-black p-4 rounded-xl shadow-lg w-1/2">
            <h2 className="text-2xl font-sans font-medium mb-1">Crear Nuevo Torneo</h2>
          <p className="mb-4 text-sm text-gray-500">Complete los datos para crear un nuevo torneo</p>
          <form className='flex flex-col space-y-3' onSubmit={handleSubmit}>
            <div>
              <label className="font-medium font-sans text-lg">Nombre del Torneo:</label>
              <input
                className='border-gray-300 border w-full px-2 rounded-xl'
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="font-medium font-sans text-lg">Año:</label>
              <select
                className='border-gray-300 border w-full p-1 rounded-xl'
                value={formData.año}
                onChange={(e) => setFormData({ ...formData, año: e.target.value })}
              >
zzzz                {years.map((year) => (
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
                value={formData.deporte_id}
                onChange={(e) => setFormData({ ...formData, deporte_id: e.target.value })}
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
              </select>
            </div>
            <div className="flex justify-end ">
              <button
                type="submit"
                disabled={loading}
                className="p-2 px-4 bg-naranja text-white rounded-[6px]"
              >
                {loading ? 'Creando torneo...' : 'Crear Torneo'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}