# TODO: Implementar Cambios en Banner y AdminDashboard

## 1. Actualizar CSS del Banner
- [x] Modificar `header[role=banner]` en `src/styles/home.css`:
  - Cambiar `background-size: cover` a `contain`
  - Cambiar `background-position: center` a `center top`
  - Agregar `background-color: #0d0d0d`
  - Agregar `min-height: 600px`

## 2. Refactorizar AdminDashboard.jsx
- [x] Agregar propiedad `isEditing: false` a cada producto en el estado `rows`
- [x] Actualizar estructura de la tabla con nuevas columnas: ID, Nombre, Slug, Descripción, Juego/Categoría, Stock, Precio, Acciones
- [x] Implementar renderizado condicional: texto vs inputs/selects basado en `isEditing`
- [x] Agregar función `toggleEdit(id)` para alternar modo edición
- [x] Actualizar botones de acción: "Editar" (toggle), "Guardar" (API + toggle off), "Cancelar" (toggle off)
- [x] Asegurar que la API de guardar envíe el objeto completo
- [x] Manejar cambios locales en modo edición

## 3. Verificación
- [ ] Probar cambios en banner: imagen completa, fondo oscuro, legibilidad
- [ ] Probar AdminDashboard: toggle edición, guardar, cancelar, eliminar
