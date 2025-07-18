import api from '@/lib/axiosConfig';

export const descuentoService = {
    async getDeportes() {
        try {
            const response = await api.get(`/deportes`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getCanchas() {
        try {
            const response = await api.get(`/canchas`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async aplicarDescuento(data) {
        try {
            const response = await api.post(`/descuentos`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getDescuentos() {
        try {
            const response = await api.get(`/descuentos`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async eliminarDescuento(id) {
        try {
            const response = await api.delete(`/descuentos/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 