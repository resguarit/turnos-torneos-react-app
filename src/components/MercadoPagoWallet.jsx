import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useEffect, useState } from "react";
import api from '@/lib/axiosConfig';
import BtnLoading from "./BtnLoading";
import { Loader2 } from "lucide-react";
import { useConfiguration } from '@/context/ConfigurationContext';

const MercadoPagoWallet = ({ turnoId, onReady }) => {
    const { config, loading: loadingConfig } = useConfiguration();
    const [preferenceId, setPreferenceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loadingConfig || !config?.mercado_pago_public_key) return;
        // Solo inicializar MercadoPago una vez
        if (!window.mercadoPagoInitialized) {
            initMercadoPago(config.mercado_pago_public_key, { locale: 'es-AR' });
            window.mercadoPagoInitialized = true;
        }

        let isMounted = true; // Para evitar setState si el componente se desmonta

        const createPreference = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await api.post('/mercadopago/create-preference', {
                    turno_id: turnoId,
                    binary_mode: true,
                });

                if (response && response.data && isMounted) {
                    setPreferenceId(response.data.preference.id);
                }
            } catch (error) {
                if (isMounted) setError(error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        createPreference();

        return () => { isMounted = false; };
    }, [turnoId]);

    if (loadingConfig || !config?.mercado_pago_public_key) {
        return <BtnLoading />;
    }

    return (
        <div>
            {preferenceId && (
                <Wallet initialization={{ preferenceId }} onReady={onReady} />
            )}
        </div>
    );
};

export default MercadoPagoWallet;