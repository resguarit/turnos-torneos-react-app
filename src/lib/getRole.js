import CryptoJS from 'crypto-js';

export const encryptRole = (role) => {
    const clave = import.meta.env.VITE_CLAVE_ROL;
    const rolCodificado = CryptoJS.AES.encrypt(role, clave).toString();
    return rolCodificado;
};

export const decryptRole = (rolCodificado) => {
    if (!rolCodificado) return null;
    const clave = import.meta.env.VITE_CLAVE_ROL;
    const bytes = CryptoJS.AES.decrypt(rolCodificado, clave);
    const rol = bytes.toString(CryptoJS.enc.Utf8);
    return rol;
};
