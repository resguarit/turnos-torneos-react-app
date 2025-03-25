import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import api from '@/lib/axiosConfig';

export default function AltaEquipo() {
  const { zonaId } = useParams(); // Obtener el zona_id de la URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    zona_id: zonaId, // Asignar el zona_id desde la URL
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardarEquipo = async () => {
    if (!formData.nombre.trim()) {
      alert('Debe ingresar un nombre para el equipo');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/equipos', formData);
      if (response.status === 201) {
        alert('Equipo guardado correctamente');
        navigate(`/detalle-zona/${zonaId}`);
      }
    } catch (error) {
      console.error('Error guardando equipo:', error);
      alert('Error al guardar el equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-col grow p-6 bg-gray-100 flex items-center ">
        <div className="w-full flex mb-2">
          <button
            onClick={() => navigate(`/detalle-zona/${zonaId}`)}
            className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="bg-white text-black p-4 rounded-xl shadow-lg w-1/2">
          <h2 className="text-2xl font-sans font-medium mb-1">Cargar Equipo</h2>
          <p className="mb-4 text-sm text-gray-500">Complete los datos del equipo</p>
          <form
            className="flex flex-col space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleGuardarEquipo();
            }}
          >
            <div>
              <label className="font-medium font-sans text-lg">Nombre del Equipo:</label>
              <input
                className="border-gray-300 border w-full px-2 rounded-xl"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre del equipo"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="p-2 px-4 bg-naranja text-white rounded-[6px]"
              >
                {loading ? 'Guardando...' : 'Guardar Equipo'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}