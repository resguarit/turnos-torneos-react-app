import heroImage from '../../assets/hero-foto.png'; // Cambiado a imagen estática
import React, { useState, useEffect } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { encryptRole } from '@/lib/getRole';

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordMsg, setShowPasswordMsg] = useState(false);
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
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('user_id', loginResponse.data.user_id);
                localStorage.setItem('username', loginResponse.data.username);
                localStorage.setItem('token', loginResponse.data.token);
                const rolEncriptado = encryptRole(loginResponse.data.rol);
                localStorage.setItem('user_role', rolEncriptado);
                localStorage.setItem('dni', formData.dni);
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

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };    useEffect(() => {
        // Ya no necesitamos la lógica del video, pero mantenemos el useEffect
        // por si necesitamos agregar alguna inicialización futura
    }, []);

    return (
        <div className="min-h-screen w-full relative font-inter">
            <ToastContainer position="top-right" />
            
            <div className="absolute inset-0">
                <img
                    className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover"
                    src={heroImage}
                    alt="RG Turnos Background"
                />
                {/* Div para bloquear interacción en iPhone */}
                <div className="absolute inset-0 bg-transparent pointer-events-auto">
                </div>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>
            <div className="relative z-30 flex justify-center items-center min-h-screen text-center px-4">
            <div className="absolute top-4 left-4">
                    <button onClick={() => navigate('/')} className="hover:bg-naranja rounded-2xl text-white p-2 text-sm flex items-center"><ChevronLeft className="w-5"/> Volver Al Inicio</button>
                </div>
                <div className="w-full max-w-xl bg-white rounded-xl p-5 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-center lg:text-3xl">Registrarse</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nombre Completo"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border p-1 px-2 rounded-[6px]"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border p-1 px-2 rounded-[6px]"
                                />
                                <input
                                    type="tel"
                                    name="telefono"
                                    placeholder="Teléfono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border p-1 px-2 rounded-[6px]"
                                />
                                <input
                                    type="text"
                                    name="dni"
                                    placeholder="DNI"
                                    value={formData.dni}
                                    onChange={handleChange}
                                    className="w-full text-black text-sm border p-1 px-2 rounded-[6px]"
                                />
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Contraseña"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full text-black text-sm border p-1 px-2 rounded-[6px]"
                                        onFocus={() => setShowPasswordMsg(true)}
                                        onBlur={() => setShowPasswordMsg(false)}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        placeholder="Confirmar Contraseña"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className="w-full text-black text-sm border p-1 px-2 rounded-[6px]"
                                        onFocus={() => setShowPasswordMsg(true)}
                                        onBlur={() => setShowPasswordMsg(false)}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowConfirmPassword}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                                    </button>
                                </div>
                            </div>
                            {showPasswordMsg && (
                                <div className='flex ml-1 w-full'>
                                    <p className="text-xs text-red-500">La contraseña debe tener al menos 8 caracteres</p>
                                </div>
                            )}
                            <div className="flex justify-center pt-3">
                                <button type="submit" className="w-full bg-naranja font-medium rounded-xl p-2 hover:bg-naranja/90 text-white" disabled={loading}>
                                    {loading ? 'Registrando Usuario...' : 'Registrarme'}
                                </button>
                            </div>
                        </form>
                        
                    </div>
                    <div className="text-center pt-3 border-t text-sm">
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
