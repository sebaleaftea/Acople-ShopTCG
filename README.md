# 🛒 Acople-TCG - Frontend E-commerce para Juegos de Cartas

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue)](https://acople-shop-tcg.vercel.app/)

**Acople-TCG** es una plataforma de e-commerce especializada en juegos de cartas coleccionables (TCG). Permite la venta de cartas individuales ("singles") de juegos como Magic: The Gathering, Pokémon y Yu-Gi-Oh!, además de accesorios relacionados.

## 📋 Tabla de Contenidos
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración del Entorno](#configuración-del-entorno)
- [Integración con Backend](#integración-con-backend)
- [Páginas y Funcionalidades](#páginas-y-funcionalidades)
- [Contextos y Gestión de Estado](#contextos-y-gestión-de-estado)
- [Ejecución de la Aplicación](#ejecución-de-la-aplicación)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Próximos Pasos](#próximos-pasos)

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- Backend API (Spring Boot) corriendo en el puerto configurado

## 🚀 Instalación

1. Clona el repositorio:
   ```bash
   git clone <repository-url>
   cd acople-tcg
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## ⚙️ Configuración del Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL base del backend API
VITE_API_URL=http://localhost:8080/api
```

**Nota:** Asegúrate de que el backend esté corriendo en la URL especificada. La aplicación automáticamente elimina barras finales para evitar problemas de redirección.

## 🔗 Integración con Backend

### Endpoints de API Utilizados

#### Productos
- **GET /products**: Obtiene la lista completa de productos
  - **Respuesta esperada:**
    ```json
    [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        "price": number,
        "stock": number,
        "description": "string",
        "game": "magic|pokemon|yugioh|accesorio",
        "category": "string"
      }
    ]
    ```

#### Carrito de Compras
- **GET /cart?userId={userId}**: Obtiene el carrito del usuario
- **POST /cart/items**: Agrega item al carrito
  - **Body:**
    ```json
    {
      "userId": "string",
      "productId": "string",
      "quantity": number
    }
    ```
- **PUT /cart/items/{productId}?userId={userId}**: Actualiza cantidad
  - **Body:** `{ "quantity": number }`
- **DELETE /cart/items/{productId}?userId={userId}**: Elimina item del carrito
- **DELETE /cart?userId={userId}**: Vacía el carrito completo

#### Autenticación (Futuro)
- Los endpoints de autenticación se integrarán con Firebase Authentication

### Estructura de Datos

#### Producto (Backend → Frontend)
```javascript
{
  id: "mongoId",           // ID único del producto
  nombre: "string",        // Nombre del producto
  slug: "string",          // Slug para URLs
  precio: number,          // Precio en la moneda local
  stock: number,           // Cantidad disponible
  descripcion: "string",   // Descripción detallada
  imagen: "string",        // URL de imagen (mapeada localmente)
  productType: "single|accesorio",  // Tipo de producto
  game: "magic|pokemon|yugioh|accesorio",  // Juego al que pertenece
  category: "string"       // Categoría específica
}
```

#### Item del Carrito
```javascript
{
  id: "productId",
  nombre: "string",
  precio: number,
  imagen: "string",
  cantidad: number,
  fromBackend: boolean  // Indica si viene del backend
}
```

## 📄 Páginas y Funcionalidades

### 🏠 Home (`/`)
- **Landing page** con introducción al sitio
- **Buscador global** de productos
- **Cartas destacadas** con efecto ticker
- **Enlaces directos** a secciones de singles por juego
- **Blog preview** con últimas publicaciones

### 🛍️ Tienda (`/tienda`)
- **Vista filtrada** de productos por tipo de juego
- **Parámetros de URL:** `?productType=single&game=magic`

### 📦 Todos los Productos (`/all-products`)
- **Catálogo completo** unificado
- **Sistema de filtros avanzados:**
  - Tipo: Singles vs Accesorios
  - Juego: Magic, Pokémon, Yu-Gi-Oh!
  - Rareza, Categoría, Precio, Orden
  - Búsqueda por texto
- **Paginación** para navegación eficiente

### 🔍 Detalle de Carta (`/detalle-carta/:slug`)
- **Vista detallada** de un producto específico
- **Información completa:** precio, stock, descripción
- **Botón de agregar al carrito**

### 🛒 Checkout (`/detalle-compra`, `/checkout`)
- **Resumen del carrito** con cantidades y totales
- **Formulario de compra** (placeholder)
- **Integración futura** con pasarelas de pago

### 👤 Perfil (`/perfil`)
- **Información del usuario**
- **Historial de compras**
- **Configuración de cuenta**

### 📝 Blog (`/blog`)
- **Lista de publicaciones** sobre TCG
- **Artículos destacados** con consejos y noticias

### 🔐 Administración (`/admin`)
- **Login administrativo** (actualmente placeholder)
- **Dashboard** para gestión de inventario
- **Protección de rutas** con autenticación

## 🧠 Contextos y Gestión de Estado

### ProductContext
- **Responsabilidad:** Gestión del catálogo de productos
- **Funciones principales:**
  - `fetchProducts()`: Obtiene productos del backend
  - Procesamiento de datos para compatibilidad frontend
- **Estado:** `products`, `isLoading`, `error`

### CartContext
- **Responsabilidad:** Gestión del carrito de compras
- **Modos de operación:**
  - **Usuario logueado:** Sincronización con backend
  - **Invitado:** Persistencia en localStorage
- **Funciones principales:**
  - `addToCart()`, `removeFromCart()`
  - `increaseQuantity()`, `decreaseQuantity()`
  - `clearCart()`, `getTotal()`, `getQuantity()`
- **Estado:** `cart`, `isCartOpen`, `toast`

### AuthContext
- **Responsabilidad:** Gestión de autenticación de usuarios
- **Integración:** Firebase Authentication (parcial)
- **Estado:** `user`, `isLoggedIn`

### LoadingContext
- **Responsabilidad:** Indicadores de carga globales
- **Estado:** `isLoading`

## ▶️ Ejecución de la Aplicación

1. **Inicia el backend** en el puerto configurado (ej: `http://localhost:8080`)

2. **Configura las variables de entorno** en `.env`

3. **Ejecuta el frontend:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

## 🧪 Testing

### Funcionalidades Críticas a Probar

#### Carrito de Compras
- Agregar productos (usuario logueado vs invitado)
- Persistencia del carrito al recargar
- Sincronización con backend para usuarios autenticados
- Operaciones CRUD completas (crear, leer, actualizar, eliminar)

#### Catálogo de Productos
- Carga correcta desde el backend
- Filtros y búsqueda funcionando
- Paginación y navegación
- Mapeo correcto de imágenes

#### Autenticación
- Login/logout de usuarios
- Protección de rutas administrativas
- Sincronización de carrito por usuario

#### Navegación
- Todas las rutas funcionando correctamente
- Enlaces internos y externos
- Manejo de errores 404

## 🚀 Despliegue

### Variables de Producción
```env
VITE_API_URL=https://tu-backend-produccion.com/api
```

### Build para Producción
```bash
npm run build
npm run preview  # Para testing local del build
```

### Despliegue en Vercel/Netlify
1. Configura las variables de entorno en la plataforma
2. Despliega desde el repositorio
3. Asegura que el backend esté accesible desde el dominio del frontend

## 🔮 Próximos Pasos

### Integración Backend Completa
- **Firebase Authentication:** Autenticación real para usuarios y admin
- **Firestore:** Base de datos para productos y órdenes
- **Gestión de Stock:** Actualización automática al comprar
- **Historial de Compras:** Persistencia de órdenes completadas

### Funcionalidades Admin
- **CRUD de Productos:** Crear, editar, eliminar productos
- **Gestión de Inventario:** Control de stock y precios
- **Reportes:** Ventas, productos más vendidos

### Mejoras UX
- **Filtros Persistentes:** Estado guardado en URL
- **Búsqueda Avanzada:** Filtros combinados
- **Notificaciones:** Sistema de notificaciones en tiempo real
- **Responsive Design:** Optimización móvil completa

### Pagos y Checkout
- **Integración Stripe/PayPal:** Procesamiento de pagos
- **Validación de Órdenes:** Confirmación y envío
- **Emails de Confirmación:** Notificaciones automáticas
