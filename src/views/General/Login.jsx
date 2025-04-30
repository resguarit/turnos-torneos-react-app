import rngBlack from '../../assets/rngBlack.mp4';
import React, { useState, useEffect } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import Volver from '@/components/Reserva/Volver';
import { Button } from '@/components/ui/button';

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [inputErrors, setInputErrors] = useState({
        identifier: false,
        password: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInputErrors({ identifier: false, password: false });
        const isNumeric = /^\d+$/.test(formData.identifier);
        
        try {
            const loginData = {
                [isNumeric ? 'dni' : 'email']: formData.identifier,
                password: formData.password
            };
            const response = await login(loginData);
            localStorage.setItem('user_id', response.user_id);
            localStorage.setItem('username', response.username);
            localStorage.setItem('user_role', response.rol);
            localStorage.setItem('dni', response.dni);
            navigate('/');
        } catch (error) {
            setError('Credenciales incorrectas');
            setInputErrors({ identifier: true, password: true });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://127.0.0.1:8000/api/auth/google/redirect';
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        const videoElement = document.querySelector("video");
    
        if (videoElement) {
          videoElement.addEventListener("contextmenu", (e) => e.preventDefault());
          videoElement.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
    
          // Prevenir la interacción en iOS
          videoElement.addEventListener("touchstart", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        }
      }, []);

    return (
        <div className="min-h-screen w-full relative font-inter">
            <div className="absolute inset-0">
                <video
                    className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover "
                    src={rngBlack}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                ></video>
                {/* Div para bloquear interacción en iPhone */}
                <div className="absolute inset-0 bg-transparent pointer-events-auto"></div>
            </div>

            <ToastContainer position="top-right" />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>
            <div className="relative z-30 min-h-screen">
                {/* Add Volver button here */}
                <div className="absolute top-4 left-4">
                    <button onClick={() => navigate('/')} className="hover:bg-naranja rounded-2xl text-white p-2 text-sm flex items-center"><ChevronLeft className="w-5"/> Volver Al Inicio</button>
                </div>
                
                <div className="flex justify-center items-center min-h-screen text-center px-4">
                    <div className="w-full max-w-md bg-white rounded-xl p-8 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-center lg:text-3xl">Iniciar Sesión</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="identifier"
                                        placeholder="Email o DNI"
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl text-sm p-2 border-2 ${
                                            inputErrors.identifier ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Contraseña"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl text-sm p-2 border-2 ${
                                            inputErrors.password ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                                    </button>
                                </div>
                                {error && (
                                    <p className="text-red-500 text-sm mt-1">{error}</p>
                                )}
                                <button type="submit" className="w-full bg-naranja text-lg font-medium rounded-xl p-2 hover:bg-naranja/90 text-white" disabled={loading}>
                                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </button>
                            </form>
                        </div>
                        <div className="text-center pt-4 mt-6 border-t text-sm">
                            <p>¿No tienes una cuenta? 
                                <Link to="/signup" className="text-naranja hover:underline ml-1">
                                    Regístrate
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
