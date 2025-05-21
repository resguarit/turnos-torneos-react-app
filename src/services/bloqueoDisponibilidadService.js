import api from '@/lib/axiosConfig';

export const bloqueoDisponibilidadService = {
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

    async bloquearDisponibilidad(data) {
        try {
            const response = await api.post(`/bloquear-disponibilidad`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async desbloquearDisponibilidad(data) {
        try {
            const response = await api.post(`/desbloquear-disponibilidad`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getAll() {
        try {
            const response = await api.get(`/bloqueados`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async destroy(id) {
        try {
            const response = await api.delete(`/bloqueados/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 