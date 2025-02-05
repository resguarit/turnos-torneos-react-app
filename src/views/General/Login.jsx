import video from '../../assets/rng.mp4';
import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
            navigate('/');
        } catch (error) {
            if (error.status === 401) {
                setError('Contraseña incorrecta');
                setInputErrors({ identifier: false, password: true });
            } else if (error.status === 404) {
                setError('Credenciales incorrectas');
                setInputErrors({ identifier: true, password: true });
            } else {
                setError('Error al iniciar sesión');
                setInputErrors({ identifier: true, password: true });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://127.0.0.1:8000/api/auth/google/redirect';
    };

    return (
        <div className="min-h-screen w-full relative font-inter">
            <video className="absolute top-0 left-0 w-full h-full object-cover z-10" src={video} autoPlay loop muted></video>
            <ToastContainer position="top-right" />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>
            <div className="relative z-30 flex justify-center items-center min-h-screen text-center px-4">
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
                                    className={`w-full rounded-xl text-base p-2 border-2 ${
                                        inputErrors.identifier ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full rounded-xl text-base p-2 border-2 ${
                                        inputErrors.password ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                            <button type="submit" className="w-full bg-naranja text-lg font-medium rounded-xl p-2 hover:bg-naranja/90 text-white" disabled={loading}>
                                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </button>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 text-sm bg-white text-gray-500">O continúa con</span>
                            </div>
                        </div>
                        <button onClick={handleGoogleLogin} className="w-full rounded-xl text-base p-2 border-2 items-center flex justify-center gap-4">
                            <FcGoogle className='h-6 w-6' />
                            Google
                        </button>
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
    );
}

export default Login;
