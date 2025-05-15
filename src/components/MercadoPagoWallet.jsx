import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useEffect, useState } from "react";
import api from '@/lib/axiosConfig';
import BtnLoading from "./BtnLoading";
import { Loader2 } from "lucide-react";

const PUBLIC_KEY = 'APP_USR-ea10856b-f68f-4e56-a05b-a2621a1f2ff1';

const MercadoPagoWallet = ({ turnoId, onReady }) => {
    const [preferenceId, setPreferenceId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Solo inicializar MercadoPago una vez
        if (!window.mercadoPagoInitialized) {
            initMercadoPago(PUBLIC_KEY, { locale: 'es-AR' });
            window.mercadoPagoInitialized = true;
        }

        let isMounted = true; // Para evitar setState si el componente se desmonta

        const createPreference = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await api.post('/mercadopago/create-preference', {
                    turno_id: turnoId,
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

    return (
        <div>
            {preferenceId && (
                <Wallet initialization={{ preferenceId }} onReady={onReady} />
            )}
        </div>
    );
};

export default MercadoPagoWallet;