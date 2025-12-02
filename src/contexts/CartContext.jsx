/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../Api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimer = useRef(null);

  // Helper para validar IDs de MongoDB
  const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

  // --- LÓGICA DE CARGA INICIAL ---
  useEffect(() => {
    const loadCart = async () => {
      // Solo cargar si estamos logueados Y tenemos un ID de usuario
      if (isLoggedIn && user?.id) { 
        try {
          // Backend Java espera el `userId` como query param
          const response = await api.get('/cart', {
            params: { userId: user.id }
          });

          // La data puede venir en `response.data` directamente
          const remoteCartItems = response.data || [];

          // Mapeamos la respuesta del backend a la estructura del frontend
          const mappedItems = remoteCartItems.map(item => {
             if (!item.product) return null;
             return {
              id: item.product.id, // Usamos el ID del producto
              nombre: item.product.name,
              precio: item.product.price,
              // Asumimos que no viene la imagen en la respuesta del carrito
              imagen: "https://placehold.co/100x100?text=Desde+BD", 
              cantidad: item.quantity,
              fromBackend: true
            };
          }).filter(Boolean);

          setCart(mappedItems);

        } catch (error) {
          // Si el carrito está vacío en el backend, puede dar 404, lo cual es normal.
          if (error.response?.status === 404) {
            setCart([]); // Nos aseguramos que el carrito local esté vacío
          } else {
            console.error("Error cargando carrito remoto:", error);
          }
        }
      } else if (!isLoggedIn) {
        // MODO INVITADO: Cargar desde LocalStorage
        const raw = localStorage.getItem('carrito');
        if (raw) {
          try {
            setCart(JSON.parse(raw));
          } catch {
            setCart([]);
          }
        }
      }
    };

    loadCart();
  }, [isLoggedIn, user?.id]);

  // Persistencia en LocalStorage (Solo para invitados o respaldo)
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('carrito', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);


  // --- FUNCIONES DE ACCIÓN ---

  const addToCart = async (producto, cantidad = 1, imagenManual) => {
    // 1. Validamos si es un producto real (del backend)
    // Miramos si trae la flag explícita 'isBackend' (de allProducts) o 'fromBackend' (de la BD)
    // O si el ID cumple con el formato de MongoDB (24 caracteres)
    const esProductoReal = producto.isBackend || producto.fromBackend || isMongoId(producto.id);

    // 2. Actualización Optimista
    const newCart = [...cart];
    const existingIdx = newCart.findIndex(item => item.id === producto.id);

    if (existingIdx >= 0) {
      newCart[existingIdx].cantidad += cantidad;
      // Aseguramos que mantenga la flag si ya existía
      if (esProductoReal) newCart[existingIdx].fromBackend = true;
    } else {
      newCart.push({
        id: producto.id,
        nombre: producto.nombre || producto.name,
        precio: Number(producto.precio || producto.price),
        imagen: imagenManual || producto.imagen || "https://placehold.co/100x100",
        cantidad: cantidad,
        fromBackend: esProductoReal // <--- ¡ESTA LÍNEA ERA LA QUE FALTABA!
      });
    }

    setCart(newCart);
    setIsCartOpen(true);
    showToast('Agregado al carrito');

    // 3. Sincronización con Backend
    if (isLoggedIn && esProductoReal && user?.id) {
      try {
        // Backend Java espera `userId`, `productId`, `quantity`
        await api.post('/cart/items', {
          userId: user.id,
          productId: producto.id,
          quantity: cantidad
        });
      } catch (error) {
        console.error("Error sincronizando add:", error);
        // Opcional: Revertir la actualización optimista si falla
      }
    }
  };

  const removeFromCart = async (indexOrId) => {
    let itemToRemove = null;
    let newCart = [...cart];

    if (typeof indexOrId === 'number') {
        itemToRemove = newCart[indexOrId];
        newCart.splice(indexOrId, 1);
    } else {
        itemToRemove = newCart.find(i => i.id === indexOrId);
        newCart = newCart.filter(i => i.id !== indexOrId);
    }

    if (!itemToRemove) return;
    setCart(newCart);

    if (isLoggedIn && user?.id && itemToRemove?.id) {
      try {
        // Backend Java espera `userId` como query param
        await api.delete(`/cart/items/${itemToRemove.id}`, {
          params: { userId: user.id }
        });
      } catch (error) {
        console.error("Error eliminando item:", error);
      }
    }
  };

  const increaseQuantity = async (index) => {
    const newCart = [...cart];
    const item = newCart[index];
    if (!item) return;

    item.cantidad += 1;
    setCart(newCart);

    if (isLoggedIn && user?.id && item?.id) {
      try {
        // Backend Java espera `userId` como query param
        await api.put(`/cart/items/${item.id}`, 
          { quantity: item.cantidad },
          { params: { userId: user.id } }
        );
      } catch (error) {
        console.error("Error incrementando:", error);
      }
    }
  };

  const decreaseQuantity = async (index) => {
    const newCart = [...cart];
    const item = newCart[index];
    if (!item) return;

    if (item.cantidad > 1) {
      item.cantidad -= 1;
      setCart(newCart);

      if (isLoggedIn && user?.id && item?.id) {
        try {
          // Backend Java espera `userId` como query param
          await api.put(`/cart/items/${item.id}`, 
            { quantity: item.cantidad },
            { params: { userId: user.id } }
          );
        } catch (error) {
          console.error("Error decrementando:", error);
        }
      }
    } else {
      removeFromCart(index); // Esto ya maneja la sincronización
    }
  };

  const clearCart = async () => {
    setCart([]);
    showToast('Carrito vaciado');

    if (isLoggedIn && user?.id) {
      try {
        // Backend Java espera `userId` como query param
        await api.delete('/cart', { 
          params: { userId: user.id } 
        });
      } catch (error) {
        console.error("Error vaciando carrito remoto:", error);
      }
    }
  };

  const getTotal = () => cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const getQuantity = () => cart.reduce((acc, item) => acc + item.cantidad, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message: msg });
    toastTimer.current = setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 2000);
  };
  const closeToast = () => setToast({ visible: false, message: '' });

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      getTotal,
      getQuantity,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      toast,
      closeToast
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;