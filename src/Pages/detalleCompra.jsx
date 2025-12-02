import React, { useState } from "react";
import { useCart } from "../contexts/useCart";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import api from "../Api/axios"; 
import { useLoading } from "../contexts/useLoading";
import "../styles/home.css";

const DetalleCompra = () => {
    const { cart, increaseQuantity, decreaseQuantity, removeFromCart, getTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showLoading } = useLoading();

    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [paymentMethod, setPaymentMethod] = useState('mercadopago');
    const [installments, setInstallments] = useState(1);
    const [promoCode, setPromoCode] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm();

    const total = getTotal();
    const shipping = deliveryMethod === 'delivery' ? 5000 : 0;
    const taxes = Math.round(total * 0.19);
    const finalTotal = total + shipping + taxes;

    const onSubmit = async () => {
        // 1. Validación de Sesión
        if (!user || !user.id) {
            alert('Debes iniciar sesión para procesar la compra.');
            return;
        }

        // 2. Validación de Productos Reales (Backend Java)
        const hasBackendItems = cart.some(i => i.fromBackend || !isNaN(Number(i.id)));
        
        if (!hasBackendItems && cart.length > 0) {
            alert("Tu carrito solo contiene productos 'Demo' (estáticos) que no existen en el servidor. \n\nPor favor, agrega productos reales creados desde el Panel de Admin para probar el checkout.");
            return;
        }

        if (cart.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        // 3. Procesar Orden
        showLoading({ message: "Procesando tu compra...", duration: 5000 });

        try {
            // BACKEND JAVA: POST /api/orders
            // Convertimos user.id a entero para cumplir con Map<String, Long>
            const payload = {
                userId: parseInt(user.id, 10)
            };

            const response = await api.post('/orders', payload);

            if (response.status === 200 || response.status === 201) {
                // Éxito
                await clearCart(); 
                
                showLoading({ message: "¡Compra exitosa! Redirigiendo...", duration: 2000 });
                setTimeout(() => {
                    navigate('/perfil'); 
                }, 2000);
            }

        } catch (error) {
            console.error('Error en checkout:', error);
            const msg = error.response?.data?.message || error.response?.data || 'Hubo un error al procesar tu pedido.';
            alert(`Error: ${msg}`);
            showLoading({ active: false }); 
        }
    };

    return (
        <main className="checkout-main">
            <h1 className="checkout-title">Checkout</h1>

            <div className="checkout-container">
                {/* Left Column - Shipping & Payment */}
                <div className="checkout-left">
                    <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
                        {/* Delivery Method */}
                        <section className="checkout-section">
                            <h2 className="section-title">Método de Entrega</h2>
                            <div className="delivery-options">
                                <label className="delivery-option">
                                    <input
                                        type="radio"
                                        value="pickup"
                                        checked={deliveryMethod === 'pickup'}
                                        onChange={(e) => setDeliveryMethod(e.target.value)}
                                    />
                                    <span>Retiro en tienda (Gratis)</span>
                                </label>
                                <label className="delivery-option">
                                    <input
                                        type="radio"
                                        value="delivery"
                                        checked={deliveryMethod === 'delivery'}
                                        onChange={(e) => setDeliveryMethod(e.target.value)}
                                    />
                                    <span>Envío a domicilio ($5.000)</span>
                                </label>
                            </div>
                        </section>

                        {/* Shipping Form */}
                        {deliveryMethod === 'delivery' && (
                            <section className="checkout-section">
                                <h2 className="section-title">Dirección de Envío</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre Completo</label>
                                        <input
                                            type="text"
                                            {...register('fullName', { required: 'Este campo es requerido' })}
                                            className={errors.fullName ? 'error' : ''}
                                        />
                                        {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Email / Usuario</label>
                                        <input
                                            type="text"
                                            {...register('email', { required: 'Este campo es requerido' })}
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && <span className="error-message">{errors.email.message}</span>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        {...register('address', { required: 'Dirección es requerida' })}
                                        className={errors.address ? 'error' : ''}
                                    />
                                    {errors.address && <span className="error-message">{errors.address.message}</span>}
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ciudad</label>
                                        <input
                                            type="text"
                                            {...register('city', { required: 'Ciudad es requerida' })}
                                            className={errors.city ? 'error' : ''}
                                        />
                                        {errors.city && <span className="error-message">{errors.city.message}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Código Postal</label>
                                        <input
                                            type="text"
                                            {...register('zipCode', { required: 'Código postal es requerido' })}
                                            className={errors.zipCode ? 'error' : ''}
                                        />
                                        {errors.zipCode && <span className="error-message">{errors.zipCode.message}</span>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        {...register('phone', { required: 'Teléfono es requerido' })}
                                        className={errors.phone ? 'error' : ''}
                                    />
                                    {errors.phone && <span className="error-message">{errors.phone.message}</span>}
                                </div>
                            </section>
                        )}

                        {/* Payment Method */}
                        <section className="checkout-section">
                            <h2 className="section-title">Método de Pago</h2>
                            <div className="payment-options">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        value="mercadopago"
                                        checked={paymentMethod === 'mercadopago'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>MercadoPago</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        value="credit"
                                        checked={paymentMethod === 'credit'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Tarjeta de Crédito</span>
                                </label>
                            </div>

                            {paymentMethod === 'credit' && (
                                <div className="credit-card-form">
                                    <div className="form-group">
                                        <label>Número de Tarjeta</label>
                                        <input
                                            type="text"
                                            {...register('cardNumber', { required: 'Número de tarjeta requerido' })}
                                            placeholder="1234 5678 9012 3456"
                                            className={errors.cardNumber ? 'error' : ''}
                                        />
                                        {errors.cardNumber && <span className="error-message">{errors.cardNumber.message}</span>}
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Fecha de Expiración</label>
                                            <input
                                                type="text"
                                                {...register('expiry', { required: 'Fecha requerida' })}
                                                placeholder="MM/YY"
                                                className={errors.expiry ? 'error' : ''}
                                            />
                                            {errors.expiry && <span className="error-message">{errors.expiry.message}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input
                                                type="text"
                                                {...register('cvv', { required: 'CVV requerido' })}
                                                placeholder="123"
                                                className={errors.cvv ? 'error' : ''}
                                            />
                                            {errors.cvv && <span className="error-message">{errors.cvv.message}</span>}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Cuotas</label>
                                        <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                                            <option value={1}>1 cuota</option>
                                            <option value={3}>3 cuotas</option>
                                            <option value={6}>6 cuotas</option>
                                            <option value={12}>12 cuotas</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </section>

                        <button type="submit" className="pay-now-btn">
                            {user ? `Pagar $${finalTotal.toLocaleString()}` : "Inicia Sesión para Pagar"}
                        </button>
                    </form>
                </div>

                {/* Right Column - Order Summary */}
                <div className="checkout-right">
                    <section className="order-summary">
                        <h2 className="section-title">Resumen del Pedido</h2>

                        <div className="order-items">
                            {cart.length === 0 ? (
                                <p className="empty-cart">Tu carrito está vacío.</p>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={item?.id ?? `${item.nombre}-${idx}`} className="order-item">
                                        <img src={item.imagen} alt={item.nombre} className="order-item-image" />
                                        <div className="order-item-details">
                                            <h4 className="order-item-name">{String(item.nombre)}</h4>
                                            <span className="order-item-price">${Number(item.precio || 0).toLocaleString()} CLP</span>
                                            
                                            {!item.fromBackend && isNaN(Number(item.id)) && (
                                                <small style={{color: 'orange', fontSize: '0.75rem'}}>*Item Demo (No se procesará)</small>
                                            )}

                                            <div className="order-item-controls">
                                                <button onClick={() => decreaseQuantity(idx)} className="qty-btn">-</button>
                                                <span className="qty">{Number(item.cantidad) || 0}</span>
                                                <button onClick={() => increaseQuantity(idx)} className="qty-btn">+</button>
                                                <button onClick={() => removeFromCart(idx)} className="remove-btn">🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="promo-code">
                            <input
                                type="text"
                                placeholder="Código de descuento"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <button className="apply-promo">Aplicar</button>
                        </div>

                        <div className="order-breakdown">
                            <div className="breakdown-item">
                                <span>Subtotal</span>
                                <span>${total.toLocaleString()} CLP</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Envío</span>
                                <span>${shipping.toLocaleString()} CLP</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Impuestos (19%)</span>
                                <span>${taxes.toLocaleString()} CLP</span>
                            </div>
                            <div className="breakdown-total">
                                <span>Total</span>
                                <span>${finalTotal.toLocaleString()} CLP</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default DetalleCompra;