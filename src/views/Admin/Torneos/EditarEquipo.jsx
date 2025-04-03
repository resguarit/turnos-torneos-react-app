import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export default function EditarEquipo() {
  const { equipoId } = useParams();
  const navigate = useNavigate();
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [equipo, setEquipo] = useState(null);

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/equipos/${equipoId}`);
        setEquipo(response.data);
        setNombreEquipo(response.data.nombre);
      } catch (error) {
        console.error('Error al cargar el equipo:', error);
        toast.error('Error al cargar la información del equipo');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipo();
  }, [equipoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombreEquipo.trim()) {
      toast.error('El nombre del equipo no puede estar vacío');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await api.put(`/equipos/${equipoId}`, {
        nombre: nombreEquipo,
        zona_id: equipo.zona_id
      });
      
      if (response.status === 200) {
        toast.success('Equipo actualizado correctamente');
        // Navegar de vuelta a la página de la zona
        navigate(`/detalle-zona/${equipo.zona_id}`);
      }
    } catch (error) {
      console.error('Error al actualizar el equipo:', error);
      toast.error('Error al actualizar el equipo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-center items-center h-full">
            <BtnLoading />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button 
            onClick={() => navigate(`/detalle-zona/${equipo.zona_id}`)} 
            className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-6">Editar Equipo</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombreEquipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  id="nombreEquipo"
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del equipo"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !nombreEquipo.trim()}
                  className={`px-4 py-2 rounded-md ${
                    saving || !nombreEquipo.trim() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}