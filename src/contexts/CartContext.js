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

  const isRemoteItem = (item) => {
    return item.fromBackend || (item.id && !isNaN(Number(item.id)));
  };

  useEffect(() => {
    const loadCart = async () => {
      if (isLoggedIn && user?.id) {
        try {
          const response = await api.get(`/cart?userId=${user.id}`);
          const remoteItems = response.data; 

          const mappedRemoteItems = remoteItems.map(item => ({
            id: item.product.id,
            nombre: item.product.name,
            precio: item.product.price,
            imagen: item.product.image || "https://placehold.co/100x100?text=Sin+Foto",
            cantidad: item.quantity,
            fromBackend: true
          }));

          setCart(prev => {
             const localStaticItems = prev.filter(p => !isRemoteItem(p));
             return [...mappedRemoteItems, ...localStaticItems];
          });

        } catch (error) {
          console.error("Error cargando carrito remoto:", error);
        }
      } else {
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

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('carrito', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);


  // --- FUNCIONES DE ACCIÓN ---

  const addToCart = async (producto, cantidad = 1, imagenManual) => {
    const esReal = producto.isBackend || !isNaN(Number(producto.id));

    // Actualización Optimista
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

    // Sincronización Backend
    if (isLoggedIn && user?.id && esReal) {
      try {
        await api.post('/cart/items', {
          userId: parseInt(user.id, 10), // FORZAMOS ENTERO
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
        await api.delete(`/cart/items/${itemToRemove.id}?userId=${user.id}`);
      } catch (error) {
        console.error("Error eliminando item:", error);
      }
    }
  };

  const updateQtyBackend = async (item, newQty) => {
      if (isLoggedIn && user?.id && item.fromBackend) {
          try {
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