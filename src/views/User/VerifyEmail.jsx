import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { ChevronLeft } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await api.post('/verify-email', { 
                    email, 
                    token 
                });
                setSuccess(true);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Error al verificar el email');
                setSuccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (email && token) {
            verifyEmail();
        } else {
            setIsLoading(false);
            setErrorMessage('Parámetros de verificación inválidos');
        }
    }, [email, token]);

    return (
        <div className="min-h-screen w-full relative font-inter bg-black">
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
                            <h2 className="text-2xl font-bold text-center lg:text-3xl">Verificación de Email</h2>
                            
                            {isLoading ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-naranja"></div>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    {success ? (
                                        <p className="text-green-500 text-lg">
                                            ✅ Email verificado correctamente
                                        </p>
                                    ) : (
                                        <p className="text-red-500 text-lg">
                                            ❌ {errorMessage}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;


