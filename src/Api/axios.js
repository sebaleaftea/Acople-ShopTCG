import axios from 'axios';

// Creamos la instancia base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Inyectamos el ID del tenant desde el .env
    // Esto es OBLIGATORIO según src/middlewares/tenantMiddleware.js del backend
    'x-tenant-id': import.meta.env.VITE_TENANT_ID, 
  },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
});

// Interceptor de Solicitud (Request Interceptor)
// Se ejecuta antes de que la petición salga del frontend
api.interceptors.request.use(
  (config) => {
    // Intentamos leer el usuario guardado en localStorage
    // (Usaremos la clave 'acople-user' en el próximo paso al configurar AuthContext)
    const storedUser = localStorage.getItem('acople-user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Si existe un token, lo agregamos al header Authorization
        // Esto es necesario para src/middlewares/authMiddleware.js
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error("Error al leer el token del usuario:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;