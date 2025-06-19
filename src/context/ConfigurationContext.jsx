import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';

const ConfigurationContext = createContext();

export const useConfiguration = () => useContext(ConfigurationContext);

export const ConfigurationProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfiguracion = async () => {
            try {
                const response = await api.get('/configuracion-usuario');
                setConfig(response.data);

                if (response.data && response.data.colores) {
                    document.documentElement.style.setProperty('--color-primary', response.data.colores.primary);
                    document.documentElement.style.setProperty('--color-secundario', response.data.colores.secondary);

                }
            } catch (error) {
                console.error('Error al obtener la configuración:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfiguracion();
    }, []);

    return (
        <ConfigurationContext.Provider value={{ config, loading }}>
            {children}
        </ConfigurationContext.Provider>
    )
}