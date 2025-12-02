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

  // --- 1. CARGA INICIAL ---
  useEffect(() => {
    const loadCart = async () => {
      // Intentamos obtener el ID del usuario de dos fuentes
      const storageUser = JSON.parse(localStorage.getItem('acople-user') || '{}');
      const activeUserId = user?.id || storageUser?.id;

      console.log("🕵️‍♂️ [CartContext] ID de usuario detectado:", activeUserId);

      if (activeUserId) {
        try {
          console.log(`📡 [GET] Solicitando carrito a: /cart?userId=${activeUserId}`);
          const response = await api.get('/cart', { 
            params: { userId: activeUserId } 
          });
          
          // ... lógica de mapeo exitosa (igual que antes) ...
          const remoteItems = response.data || [];
          const mappedRemoteItems = remoteItems.map(item => {
             if (!item.product) return null;
             return {
                id: item.product.id,
                nombre: item.product.name,
                precio: item.product.price,
                imagen: item.product.image || "https://placehold.co/100x100?text=Sin+Foto",
                cantidad: item.quantity,
                fromBackend: true
             };
          }).filter(Boolean);

          setCart(prev => {
             const localStaticItems = prev.filter(p => !isRemoteItem(p));
             return [...mappedRemoteItems, ...localStaticItems];
          });

        } catch (error) {
          console.error("❌ Error cargando carrito:", error.message);
          if (error.response) console.error("   Detalle:", error.response.data);
        }
      } else {
        // Carga local
        const raw = localStorage.getItem('carrito');
        if (raw) try { setCart(JSON.parse(raw)); } catch { setCart([]); }
      }
    };

    loadCart();
  }, [isLoggedIn, user]); // Se ejecuta al loguearse

  // Persistencia local
  useEffect(() => {
    if (!isLoggedIn) localStorage.setItem('carrito', JSON.stringify(cart));
  }, [cart, isLoggedIn]);

  // --- 2. AGREGAR AL CARRITO ---
  const addToCart = async (producto, cantidad = 1, imagenManual) => {
    const storageUser = JSON.parse(localStorage.getItem('acople-user') || '{}');
    const activeUserId = user?.id || storageUser?.id;

    const esReal = producto.isBackend || !isNaN(Number(producto.id));

    // Optimista
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

    // Sincronización
    if (activeUserId && esReal) {
      try {
        const payload = {
          userId: parseInt(activeUserId, 10),
          productId: parseInt(producto.id, 10),
          quantity: parseInt(cantidad, 10)
        };
        
        console.log("📤 [POST] Enviando item:", payload);
        await api.post('/cart/items', payload);

      } catch (error) {
        console.error("❌ Error agregando item:", error.message);
      }
    } else if (!activeUserId) {
        console.warn("⚠️ No se sincronizó porque no se encontró ID de usuario.");
    }
  };

  // ... (Mantén el resto de funciones: removeFromCart, etc. igual que antes) ...
  // Para abreviar, solo cambié la lógica de obtención del ID arriba.
  
  // ... Copia aquí el resto de tus funciones removeFromCart, increaseQuantity, decreaseQuantity, clearCart, getTotal...

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
    
    const storageUser = JSON.parse(localStorage.getItem('acople-user') || '{}');
    const activeUserId = user?.id || storageUser?.id;

    if (activeUserId && itemToRemove.fromBackend) {
      try {
        await api.delete(`/cart/items/${itemToRemove.id}`, {
            params: { userId: activeUserId }
        });
      } catch (error) { console.error(error); }
    }
  };

  const updateQtyBackend = async (item, newQty) => {
      const storageUser = JSON.parse(localStorage.getItem('acople-user') || '{}');
      const activeUserId = user?.id || storageUser?.id;
      if (activeUserId && item.fromBackend) {
          try {
            await api.put(`/cart/items/${item.id}`, { quantity: newQty }, {
                params: { userId: activeUserId }
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
      const storageUser = JSON.parse(localStorage.getItem('acople-user') || '{}');
      const activeUserId = user?.id || storageUser?.id;
      if (activeUserId) {
          try { await api.delete('/cart', { params: { userId: activeUserId } }); } 
          catch (error) { console.error(error); }
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
    toastTimer.current = setTimeout(() => setToast({ visible: false, message: '' }), 2000);
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