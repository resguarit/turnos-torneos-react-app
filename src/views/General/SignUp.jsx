import video from '../../assets/rng.mp4';
import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import { register, login } from '@/services/authService';
import api from '@/lib/axiosConfig';

function SignUp() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telefono: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
        setError('Las contraseñas no coinciden');
        return;
        }
        try {
            const registerResponse = await api.post('/register', {
                name: formData.name,
                email: formData.email,
                telefono: formData.telefono,
                password: formData.password,
                password_confirmation: formData.password_confirmation
              });
                if (registerResponse.status === 201) {
                    const loginResponse = await api.post('/login', {
                        email: formData.email,
                        password: formData.password
                    });
                    localStorage.setItem('user_id', loginResponse.data.user_id);
                    localStorage.setItem('username', loginResponse.data.username);
                    localStorage.setItem('token', loginResponse.data.token);
                    navigate('/');
                }
        } catch (error) {
        setError(error.message);
        }
    };
    
    return (
        <div className="min-h-screen w-full relative font-inter">
        <video className="absolute top-0 left-0 w-full h-full object-cover z-10" src={video} autoPlay loop muted></video>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>
        <div className="relative z-30 flex justify-center items-center min-h-screen text-center px-4">
            <div className="w-full max-w-md bg-white rounded-xl p-10 space-y-6">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center lg:text-4xl">Registrarse</h2>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre Completo"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full text-black text-lg border-2 border-gray-300 p-3 rounded-xl"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-black text-lg border-2 border-gray-300 p-3 rounded-xl"
                />
                <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full text-black text-lg border-2 border-gray-300 p-3 rounded-xl"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full text-black text-lg border-2 border-gray-300 p-3 rounded-xl"
                />
                <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirmar Contraseña"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="w-full text-black text-lg border-2 border-gray-300 p-3 rounded-xl"
                />
                <button type="submit" className="w-full bg-[#FF5115] text-2xl font-medium rounded-xl p-3 hover:bg-[#FF5115]/90 text-white">
                    Registrarme
                </button>
                </form>
                <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-lg bg-white text-gray-500">O continúa con</span>
                </div>
                </div>
                <button variant="outline" className="w-full rounded-xl text-lg p-2 border-2 items-center flex justify-center gap-4">
                <FcGoogle className='h-8 w-8' />
                Google
                </button>
            </div>
            <div className="text-center pt-4 mt-6 border-t text-lg">
                <p>¿Ya estás registrado? 
                <Link to="/login" className="text-[#FF5115] hover:underline ml-1">
                    Inicia Sesión
                </Link>
                </p>
            </div>
            </div>
        </div>
        </div>
    );
}

export default SignUp;
