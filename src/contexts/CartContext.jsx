/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimer = useRef(null);

  // Helper para validar IDs de MongoDB
  const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

  // --- LÓGICA DE CARGA INICIAL ---
  useEffect(() => {
    const loadCart = async () => {
      if (isLoggedIn) {
        // MODO CONECTADO: Cargar desde Backend
        try {
          const response = await api.get('/cart');
          const remoteCart = response.data.data;

          // Mapeamos la respuesta del backend a la estructura del frontend
          const mappedItems = remoteCart.items.map(item => {
             if (!item.productId) return null;
             return {
              id: item.productId._id,
              nombre: item.productId.name,
              precio: item.productId.price,
              imagen: item.productId.images?.[0]?.url || "https://placehold.co/100x100?text=Sin+Foto",
              cantidad: item.quantity,
              fromBackend: true
            };
          }).filter(Boolean);

          // Combinamos con items locales que NO sean del backend (los estáticos)
          setCart(prev => {
             const localStaticItems = prev.filter(p => !isMongoId(p.id));
             return [...mappedItems, ...localStaticItems];
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
  }, [isLoggedIn]);

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
    if (isLoggedIn && esProductoReal) {
      try {
        await api.post('/cart/items', {
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

    if (typeof indexOrId === 'number') {
        itemToRemove = newCart[indexOrId];
        newCart.splice(indexOrId, 1);
    } else {
        itemToRemove = newCart.find(i => i.id === indexOrId);
        newCart = newCart.filter(i => i.id !== indexOrId);
    }

    if (!itemToRemove) return;
    setCart(newCart);

    if (isLoggedIn && isMongoId(itemToRemove.id)) {
      try {
        await api.delete(`/cart/items/${itemToRemove.id}`);
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

    if (isLoggedIn && isMongoId(item.id)) {
      try {
        await api.put(`/cart/items/${item.id}`, {
          quantity: item.cantidad
        });
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

      if (isLoggedIn && isMongoId(item.id)) {
        try {
          await api.put(`/cart/items/${item.id}`, {
            quantity: item.cantidad
          });
        } catch (error) {
          console.error("Error decrementando:", error);
        }
      }
    } else {
      removeFromCart(index);
    }
  };

  const clearCart = async () => {
    setCart([]);
    showToast('Carrito vaciado');

    if (isLoggedIn) {
      try {
        await api.delete('/cart');
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