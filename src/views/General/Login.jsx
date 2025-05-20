import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { encryptRole } from '@/lib/getRole';

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
            saveUserRole(response.rol);
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

    const saveUserRole = (rol) => {
        const rolEncriptado = encryptRole(rol);
        localStorage.setItem('user_role', rolEncriptado);
    };

    return (
        <div className="min-h-screen w-full relative font-inter bg-black">
            <ToastContainer position="top-right" />
            <div className="relative z-30 min-h-screen">
                <div className="absolute top-4 left-4">
                    <button 
                        onClick={() => navigate('/')} 
                        className="hover:bg-naranja rounded-2xl text-white p-2 text-sm flex items-center"
                    >
                        <ChevronLeft className="w-5"/> Volver Al Inicio
                    </button>
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
                                <button 
                                    type="submit" 
                                    className="w-full bg-naranja text-lg font-medium rounded-xl p-2 hover:bg-naranja/90 text-white transition-colors" 
                                    disabled={loading}
                                >
                                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </button>
                            </form>
                        </div>
                        <div className="text-center pt-4 mt-6 border-t text-sm gap-4">
                            <p><Link to="/forgot-password" className="text-naranja py-3 hover:underline ml-1">¿Olvidaste tu contraseña?</Link></p>
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
