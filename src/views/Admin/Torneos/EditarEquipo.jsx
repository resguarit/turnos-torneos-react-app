import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '../Modals/ConfirmModal';

export default function EditarEquipo() {
  const { equipoId } = useParams();
  const navigate = useNavigate();
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [equipo, setEquipo] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [escudo, setEscudo] = useState(null);
  const [preview, setPreview] = useState(null);

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

  const handleEscudoChange = (e) => {
    const file = e.target.files[0];
    setEscudo(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombreEquipo.trim()) {
      toast.error('El nombre del equipo no puede estar vacío');
      return;
    }

    try {
      setSaving(true);

      const zonaId = equipo.zonas?.[0]?.id;
      const formData = new FormData();
      formData.append('nombre', nombreEquipo);
      if (escudo) formData.append('escudo', escudo);

      const response = await api.post(`/equipos/${equipoId}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        toast.success('Equipo actualizado correctamente');
        navigate(`/detalle-zona/${zonaId}?tab=equipos`);
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

  const handleOpenModal = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button 
            onClick={() => navigate(`/detalle-zona/${equipo.zonas[0].id}?tab=equipos`)} 
            
            className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5" /> Atrás
          </button>
          {console.log(equipo)}
        </div>
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-[8px] shadow-md p-6">
            <h1 className="text-2xl font-semibold mb-6">Editar Equipo</h1>
            
            <form onSubmit={handleOpenModal} className="space-y-4">
              <div className="mb-4">
                <label htmlFor="nombreEquipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  id="nombreEquipo"
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  className="w-full p-1 px-2 border border-gray-300 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del equipo"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escudo del equipo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEscudoChange}
                  className="block mt-1"
                  disabled={saving}
                />
                <div className="mt-2 flex items-center gap-4">
                  {preview ? (
                    <img src={preview} alt="Nuevo escudo" className="h-16 object-contain border rounded" />
                  ) : equipo?.escudo ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/storage/${equipo.escudo}`}
                      alt="Escudo actual"
                      className="h-16 object-contain border rounded"
                    />
                  ) : (
                    <span className="text-gray-400">Sin escudo</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !nombreEquipo.trim()}
                  className={`px-3 py-2 text-sm rounded-[6px] ${
                    saving || !nombreEquipo.trim() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmit}
        loading={saving}
        accionTitulo="Actualizar"
        accion="actualizar"
        pronombre="el"
        entidad="equipo"
        accionando="actualizando"
      />
    </div>
  );
}