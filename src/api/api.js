// Ejemplo de api/api.js

import axios from 'axios';

const api = axios.create({
     baseURL: "https://devorayaback.onrender.com", 
 
});

api.interceptors.request.use(
    (config) => {
        // Asegúrate de que la clave 'token' sea la correcta
        const token = localStorage.getItem('token'); 
        
        if (token) {
            // Este es el formato que espera tu middleware
            config.headers.Authorization = `Bearer ${token}`; 
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;