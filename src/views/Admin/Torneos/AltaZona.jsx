import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { toast } from 'react-toastify'; // Importar react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos de react-toastify
import { useTorneos } from '@/context/TorneosContext';
import ConfirmModal from '../Modals/ConfirmModal';
import BackButton from '@/components/BackButton';

export default function AltaZona() {
  const { id, torneoId } = useParams(); // Obtener el ID de la zona y el torneo desde la URL
  const navigate = useNavigate();
  const { setTorneos } = useTorneos();
  const [loading, setLoading] = useState(true); // Estado de carga inicializado en true
  const [formData, setFormData] = useState({
    nombre: '',
    formato: 'Liga', // Valor por defecto
    año: new Date().getFullYear(),
    torneo_id: torneoId || '', // Asignar el torneo_id desde la URL
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

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
          toast.error('Error al cargar los datos de la zona'); // Mostrar error con toastify
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
    if (id) {
      setShowConfirmModal(true);
      setPendingSubmit(true);
    } else {
      await submitZona();
    }
  };

  const submitZona = async () => {
    try {
      setLoading(true);
      if (id) {
        await api.put(`/zonas/${id}`, formData);
        toast.success('Zona actualizada correctamente');
      } else {
        await api.post('/zonas', formData);
        toast.success('Zona creada correctamente');
      }
      const torneosResponse = await api.get('/torneos');
      setTorneos(torneosResponse.data);
      navigate(`/zonas-admi/${formData.torneo_id}`);
    } catch (error) {
      console.error('Error saving zona:', error);
      toast.error('Error al guardar la zona');
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
          <BackButton ruta={`/zonas-admi/${formData.torneo_id}`} />
        </div>
        <div className="bg-white text-black p-4 rounded-xl shadow-lg w-1/2">
          <h2 className="text-2xl  font-semibold mb-1">{id ? 'Editar Zona' : 'Crear Nueva Zona'}</h2>
          <p className="mb-4 text-sm text-gray-500">Complete los datos para {id ? 'editar la' : 'crear una nueva'} zona</p>
          <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium  text-lg">Nombre de la Zona:</label>
              <input
                className="border-gray-300 border w-full px-2 rounded-xl"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-medium  text-lg">Formato:</label>
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
                <option value="Liga + Playoff">Liga + PlayOff</option>
                <option value="Liga Ida y Vuelta">Liga Ida y Vuelta</option>
              </select>
            </div>
            <div>
              <label className="font-medium  text-lg">Año:</label>
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
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmUpdate}
        loading={loading}
        accionTitulo="actualización"
        accion="actualizar"
        pronombre="la"
        entidad="zona"
        accionando="Actualizando"
      />
    </div>
  );
}