// ResetPassword.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/reset-password', { 
        email, 
        token, 
        password, 
        password_confirmation: confirm 
      });
      toast.success(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Error al restablecer la contraseña');
      toast.error('Error al restablecer la contraseña');
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
              <h2 className="text-2xl font-bold text-center lg:text-3xl">Restablecer Contraseña</h2>
              <p className="text-gray-600 text-sm">Ingresa tu nueva contraseña</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                    className="w-full rounded-xl text-sm p-2 border-2 border-gray-200 focus:border-naranja focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirmar contraseña"
                    className="w-full rounded-xl text-sm p-2 border-2 border-gray-200 focus:border-naranja focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
                
                <button 
                  type="submit" 
                  className="w-full bg-naranja text-lg font-medium rounded-xl p-2 hover:bg-naranja/90 text-white transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Cambiar contraseña'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
