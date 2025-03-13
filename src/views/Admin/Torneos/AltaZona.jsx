import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';

export default function AltaZona() {
  const { torneoId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    formato: 'Liga', // Valor por defecto
    año: new Date().getFullYear(),
    torneo_id: torneoId, // Obtener el torneo_id de la URL
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/zonas', formData);
      if (response.status === 201) {
        // Redirigir a /zonas-admi después de crear la zona
        setLoading(false);
        navigate(`/zonas-admi/${torneoId}`);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
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
          <button onClick={() => navigate(`/zonas-admi/${torneoId}`)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="bg-white text-black p-4 rounded-xl shadow-lg w-1/2">
          <h2 className="text-2xl font-sans font-medium mb-1">Crear Nueva Zona</h2>
          <p className="mb-4 text-sm text-gray-500">Complete los datos para crear una nueva zona</p>
          <form className='flex flex-col space-y-3' onSubmit={handleSubmit}>
            <div>
              <label className="font-medium font-sans text-lg">Nombre de la Zona:</label>
              <input
                className='border-gray-300 border w-full px-2 rounded-xl'
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="font-medium font-sans text-lg">Formato:</label>
              <select
                className='border-gray-300 border w-full p-1 rounded-xl'
                value={formData.formato}
                onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
              >
                <option value="Liga">Liga</option>
                <option value="Eliminacion Directa">Eliminacion Directa</option>
                <option value="Fase De Grupos">Fase De Grupos</option>
              </select>
            </div>
            <div>
              <label className="font-medium font-sans text-lg">Año:</label>
              <select
                className='border-gray-300 border w-full p-1 rounded-xl'
                value={formData.año}
                onChange={(e) => setFormData({ ...formData, año: e.target.value })}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
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
                {loading ? 'Creando zona...' : 'Crear Zona'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}