import video from '../../assets/rng.mp4';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function Login() {
    return (
        <>
            <div className="min-h-screen w-full relative font-inter">
                {/* Video de fondo */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover z-10"
                    src={video}
                    autoPlay
                    loop
                    muted
                ></video>

                {/* Overlay para oscurecer el video */}
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-20"></div>

                {/* Contenido principal */}
                <div className="relative z-30 flex justify-center items-center min-h-screen text-center px-4">
                    <div className="w-full max-w-md bg-white rounded-xl p-6 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-center lg:text-4xl">Iniciar Sesión</h2>

                            <div className="space-y-4">
                                <input 
                                    type="email" 
                                    placeholder="Correo electrónico"
                                    className="w-full text-black text-lg border-2 border-gray-300 p-3 rounded-xl "
                                />
                                <input 
                                    type="password" 
                                    placeholder="Contraseña"
                                    className="w-full text-black text-lg border-2 border-gray-300 p-3 rounded-xl"
                                />
                            </div>

                            <button 
                                className="w-full bg-[#FF5115] text-2xl font-medium rounded-xl p-3 hover:bg-[#FF5115]/90 text-white"
                            >
                                Iniciar Sesión
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 text-lg bg-white text-gray-500">O continúa con</span>
                                </div>
                            </div>

                            <button 
                                variant="outline" 
                                className="w-full border-2"
                                onClick={() => {}}
                            >
                                <img 
                                    src="/api/placeholder/20/20" 
                                    alt="Google" 
                                    className="w-5 h-5 mr-2"
                                />
                                Google
                            </button>
                        </div>

                        <div className="text-center pt-4 mt-6 border-t text-lg">
                            <p>¿No tienes una cuenta? 
                                <a href="#" className="text-[#FF5115] hover:underline ml-1">
                                    Regístrate
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
