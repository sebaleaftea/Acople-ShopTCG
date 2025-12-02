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

  // Helper para identificar si un producto viene del backend (Java usa IDs numéricos)
  // Si el ID es un número (o string numérico), asumimos que es del backend.
  // Si es un string como "black-lotus", es estático.
  const isRemoteItem = (item) => {
    return item.fromBackend || (item.id && !isNaN(Number(item.id)));
  };

  // --- LÓGICA DE CARGA INICIAL ---
  useEffect(() => {
    const loadCart = async () => {
      if (isLoggedIn && user?.id) {
        // MODO CONECTADO: Cargar desde Backend Java
        try {
          // Endpoint Java: GET /api/cart?userId=...
          const response = await api.get(`/cart?userId=${user.id}`);
          const remoteItems = response.data; // Java devuelve array directo de CartItems

          const mappedRemoteItems = remoteItems.map(item => ({
            id: item.product.id, // ID del producto en BD
            nombre: item.product.name,
            precio: item.product.price,
            // Usamos la imagen que venga del backend, o placeholder si no hay
            imagen: item.product.image || "https://placehold.co/100x100?text=Sin+Foto",
            cantidad: item.quantity,
            fromBackend: true
          }));

          // FUSIÓN: Combinamos con los items estáticos locales que no existen en el backend
          setCart(prev => {
             const localStaticItems = prev.filter(p => !isRemoteItem(p));
             return [...mappedRemoteItems, ...localStaticItems];
          });

        } catch (error) {
          console.error("Error cargando carrito remoto:", error);
        }
      } else {
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
  }, [isLoggedIn, user]);

  // Persistencia Local (Solo para invitados o respaldo de estáticos)
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('carrito', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);


  // --- FUNCIONES DE ACCIÓN ---

  const addToCart = async (producto, cantidad = 1, imagenManual) => {
    // Detectamos si es un producto real para sincronizarlo
    // En Java los IDs son números, en el estático son strings
    const esReal = producto.isBackend || !isNaN(Number(producto.id));

    // 1. Actualización Optimista
    const newCart = [...cart];
    const existingIdx = newCart.findIndex(item => item.id === producto.id);

    if (existingIdx >= 0) {
      newCart[existingIdx].cantidad += cantidad;
      if (esReal) newCart[existingIdx].fromBackend = true;
    } else {
      newCart.push({
        id: producto.id,
        nombre: producto.nombre || producto.name,
        precio: Number(producto.precio || producto.price),
        imagen: imagenManual || producto.imagen || "https://placehold.co/100x100",
        cantidad: cantidad,
        fromBackend: esReal
      });
    }
    
    setCart(newCart);
    setIsCartOpen(true);
    showToast('Agregado al carrito');

    // 2. Sincronización con Backend Java
    if (isLoggedIn && user?.id && esReal) {
      try {
        // Endpoint Java: POST /api/cart/items
        // Body: { userId, productId, quantity }
        await api.post('/cart/items', {
          userId: user.id,
          productId: producto.id,
          quantity: cantidad
        });
      } catch (error) {
        console.error("Error sincronizando add:", error);
      }
    }
  };

  const removeFromCart = async (indexOrId) => {
    let itemToRemove = null;
    let newCart = [...cart];

    if (typeof indexOrId === 'number' && !cart.find(i => i.id === indexOrId)) {
        itemToRemove = newCart[indexOrId];
        newCart.splice(indexOrId, 1);
    } else {
        itemToRemove = newCart.find(i => i.id === indexOrId);
        newCart = newCart.filter(i => i.id !== indexOrId);
    }

    if (!itemToRemove) return;
    setCart(newCart);

    if (isLoggedIn && user?.id && itemToRemove.fromBackend) {
      try {
        // Endpoint Java: DELETE /api/cart/items/{productId}?userId=...
        await api.delete(`/cart/items/${itemToRemove.id}?userId=${user.id}`);
      } catch (error) {
        console.error("Error eliminando item:", error);
      }
    }
  };

  const updateQtyBackend = async (item, newQty) => {
      if (isLoggedIn && user?.id && item.fromBackend) {
          try {
            // Endpoint Java: PUT /api/cart/items/{productId}?userId=...
            // Body: { quantity: newQty }
            await api.put(`/cart/items/${item.id}?userId=${user.id}`, { 
                quantity: newQty 
            });
          } catch (e) { console.error(e); }
      }
  };

  const increaseQuantity = (index) => {
    const newCart = [...cart];
    const item = newCart[index];
    if(!item) return;

    item.cantidad += 1;
    setCart(newCart);
    updateQtyBackend(item, item.cantidad);
  };

  const decreaseQuantity = (index) => {
    const newCart = [...cart];
    const item = newCart[index];
    if(!item) return;

    if (item.cantidad > 1) {
      item.cantidad -= 1;
      setCart(newCart);
      updateQtyBackend(item, item.cantidad);
    } else {
      removeFromCart(item.id);
    }
  };

  const clearCart = async () => {
    setCart([]);
    showToast('Carrito vaciado');
    
    if (isLoggedIn && user?.id) {
      try {
        // Endpoint Java: DELETE /api/cart?userId=...
        await api.delete(`/cart?userId=${user.id}`);
      } catch (error) {
        console.error("Error vaciando carrito remoto:", error);
      }
    }
  };

  // --- UTILIDADES ---
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
      cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart,
      getTotal, getQuantity, isCartOpen, openCart, closeCart, toggleCart, toast, closeToast
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;