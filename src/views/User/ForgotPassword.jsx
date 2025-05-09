// ForgotPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { ChevronLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/forgot-password', { email });
      toast.success(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Error al enviar el enlace de recuperación');
      toast.error('Error al enviar el enlace de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative font-inter bg-black">
      <ToastContainer position="top-right" />
      <div className="relative z-30 min-h-screen">
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => navigate('/login')} 
            className="hover:bg-naranja rounded-2xl text-white p-2 text-sm flex items-center"
          >
            <ChevronLeft className="w-5"/> Volver al Login
          </button>
        </div>
        
        <div className="flex justify-center items-center min-h-screen text-center px-4">
          <div className="w-full max-w-md bg-white rounded-xl p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center lg:text-3xl">Recuperar Contraseña</h2>
              <p className="text-gray-600 text-sm">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    className="w-full rounded-xl text-sm p-2 border-2 border-gray-200 focus:border-naranja focus:outline-none"
                    required
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
                
                <button 
                  type="submit" 
                  className="w-full bg-naranja text-lg font-medium rounded-xl p-2 hover:bg-naranja/90 text-white transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
