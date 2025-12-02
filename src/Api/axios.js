import axios from 'axios';

// 1. Obtenemos la URL base del entorno
let baseURL = import.meta.env.VITE_API_URL || '';

// 2. CORRECCIÓN AUTOMÁTICA: Eliminamos la barra final si existe
// Esto evita el problema de ".../api//cart" que causa redirecciones y pérdida de datos
if (baseURL.endsWith('/')) {
  baseURL = baseURL.slice(0, -1);
}

// 3. Creamos la instancia
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export default api;