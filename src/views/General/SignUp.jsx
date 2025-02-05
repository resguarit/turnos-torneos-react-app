import video from '../../assets/rng.mp4';
import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telefono: '',
        dni: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false); // Estado de carga
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const { name, email, telefono, dni, password, password_confirmation } = formData;
        if (!name || !email || !telefono || !dni || !password || !password_confirmation) {
            toast.error('Todos los campos son obligatorios');
            return false;
        }
        if (password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        if (password !== password_confirmation) {
            toast.error('Las contraseñas no coinciden');
            return false;
        }
        // Puedes agregar más validaciones aquí (por ejemplo, formato de email, longitud de la contraseña, etc.)
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true); // Iniciar estado de carga
        try {
            const registerResponse = await api.post('/register', {
                name: formData.name,
                email: formData.email,
                telefono: formData.telefono,
                dni: formData.dni,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });
            if (registerResponse.status === 201) {
                const loginResponse = await api.post('/login', {
                    dni: formData.dni,
                    password: formData.password
                });
                localStorage.setItem('user_id', loginResponse.data.user_id);
                localStorage.setItem('username', loginResponse.data.username);
                localStorage.setItem('token', loginResponse.data.token);
                toast.success('Registro exitoso');
                setTimeout(() => {
                    navigate('/');
                }, 2000); 
            }
        } catch (error) {
            toast.error('Error al registrar el usuario');
        } finally {
            setLoading(false); // Finalizar estado de carga
        }
    };

    return (
        <div className="min-h-screen w-full relative font-inter">
            <ToastContainer position="top-right" />
            <video className="absolute top-0 left-0 w-full h-full object-cover z-10" src={video} autoPlay loop muted></video>
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>
            <div className="relative z-30 flex justify-center items-center min-h-screen text-center px-4">
                <div className="w-full max-w-md bg-white rounded-xl p-5 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-center lg:text-3xl">Registrarse</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
                            <input
                                type="text"
                                name="name"
                                placeholder="Nombre Completo"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full text-black text-sm border-2 border-gray-300 p-2 rounded-xl"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full text-black text-sm border-2 border-gray-300 p-2 rounded-xl"
                            />
                            <input
                                type="tel"
                                name="telefono"
                                placeholder="Teléfono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-full text-black text-sm border-2 border-gray-300 p-2 rounded-xl"
                            />
                            <input
                                type="text"
                                name="dni"
                                placeholder="DNI"
                                value={formData.dni}
                                onChange={handleChange}
                                className="w-full text-black text-sm border-2 border-gray-300 p-2 rounded-xl"
                            />
                            </div>
                             <p className="text-xs text-gray-500">La contraseña debe tener al menos 8 caracteres</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full text-black text-sm border-2 border-gray-300 p-2 rounded-xl"
                            />
                            
                            <input
                                type="password"
                                name="password_confirmation"
                                placeholder="Confirmar Contraseña"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className="w-full text-black text-sm border-2 border-gray-300 p-2 rounded-xl"
                            />
                            </div>
                            <button type="submit" className="w-full bg-naranja text-base font-medium rounded-xl p-2 hover:bg-naranja/90 text-white" disabled={loading}>
                                {loading ? 'Registrando Usuario...' : 'Registrarme'}
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
                        <button variant="outline" className="w-full rounded-xl text-base p-2 border-2 items-center flex justify-center gap-4">
                            <FcGoogle className='h-6 w-6' />
                            Google
                        </button>
                    </div>
                    <div className="text-center pt-3 mt-2 border-t text-sm">
                        <p>¿Ya estás registrado? 
                            <Link to="/login" className="text-naranja hover:underline ml-1">
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
