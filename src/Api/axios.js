import axios from 'axios';

// Creamos la instancia base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ahora apunta a .../api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
});

// NOTA: Hemos eliminado el interceptor de Authorization y el header x-tenant-id
// porque el nuevo backend Java gestiona la identidad mediante el userId explícito
// en el cuerpo o parámetros de las peticiones, no mediante headers.

export default api;