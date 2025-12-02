// src/utils/imageMapper.js

/**
 * 1. CARGA MASIVA DE IMÁGENES
 * Usamos la función especial de Vite 'import.meta.glob' para buscar
 * todos los archivos de imagen dentro de la carpeta assets.
 * * { eager: true } es CRUCIAL: le dice a Vite que importe las imágenes YA,
 * en lugar de esperar a que las pidamos (lazy loading), para poder
 * construir nuestro diccionario inmediatamente.
 */
const images = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,webp,svg,avif}', { eager: true });

// 2. CONSTRUCCIÓN DEL DICCIONARIO (Map)
// Transformaremos la lista de rutas en un objeto simple: { "slug": "ruta_de_imagen" }
// Ejemplo: { "black-lotus": "/src/assets/images/magicSingles/black-lotus.webp" }
const imageMap = {};

Object.keys(images).forEach((path) => {
  // path es algo como: "../assets/images/magicSingles/black-lotus.webp"
  
  // Extraemos solo el nombre del archivo sin la ruta
  const fileName = path.split('/').pop(); // "black-lotus.webp"
  
  // Quitamos la extensión para obtener el "slug" puro
  // Esto permite que el slug "black-lotus" encuentre "black-lotus.jpg" o "black-lotus.png"
  const slug = fileName.split('.').slice(0, -1).join('.'); // "black-lotus"
  
  // Guardamos en el mapa. 
  // 'images[path].default' es la URL pública real que Vite genera para esa imagen.
  imageMap[slug.toLowerCase()] = images[path].default;
});

/**
 * 3. FUNCIÓN DE BÚSQUEDA
 * Esta es la función que usarás en tus componentes.
 * * @param {string} slug - El identificador del producto (ej: "charizard-ex")
 * @returns {string} - La URL de la imagen encontrada o un placeholder si no existe.
 */
export const getImageBySlug = (slug) => {
  if (!slug) return "https://placehold.co/300x400?text=Sin+Slug";
  
  // Normalizamos a minúsculas para evitar errores de tipeo
  const normalizedSlug = slug.toLowerCase();
  
  // Buscamos en nuestro diccionario
  const foundImage = imageMap[normalizedSlug];
  
  // Si encontramos la imagen, la devolvemos. Si no, devolvemos un placeholder genérico.
  return foundImage || "https://placehold.co/300x400?text=No+Image";
};

// Opcional: Exportar el mapa completo por si necesitas depurar
export const debugImages = imageMap;