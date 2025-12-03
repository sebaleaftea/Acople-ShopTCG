import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/useCart";

const ProductPreview = (props) => {
  const { addToCart } = useCart();

  const item = props.product || props.producto || {};

  // Normalización de datos
  const nombre = item.nombre || item.name || "Sin nombre";
  const imagen = item.imagen || item.image || "https://placehold.co/300x400?text=No+Image";
  const precio = Number(item.precio ?? item.price ?? 0);
  const categoria = item.category || item.categoria || (item.productType === 'accesorio' ? (item.category || 'accesorio') : undefined);
  const stock = item.stock || 0;
  const isOutOfStock = stock <= 0;

  // Lógica visual de descuentos
  const hasDiscount = categoria && (categoria === 'dados' || categoria === 'portamazos');
  const discountPercent = hasDiscount ? 15 : 0;
  const oldPrice = hasDiscount ? Math.round(precio * 1.18) : null;

  const handleAddToCart = () => {
    // CORRECCIÓN: Enviamos el objeto 'item' completo
    // El contexto se encargará de extraer el ID y validar si es backend
    addToCart(item);
  };

  const isAccessory = (item.productType || item.type) === 'accesorio' || (!!categoria && categoria !== 'single');
  const categoryClass = categoria ? `card--cat-${categoria}` : '';

  return (
    <article className={`card ${isAccessory ? 'card--accessory' : ''} ${categoryClass} ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {hasDiscount && <div className="discount-badge">Save {discountPercent}%</div>}
      <Link
        to={`/detalle-carta/${item.id}`}
        className="card-link"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="card-media">
          <img src={imagen} alt={nombre} loading="lazy" decoding="async" />
        </div>
        <h3>{nombre}</h3>
      </Link>
      {categoria && <p>Categoría: {categoria}</p>}
      <div className="price">
        <span className="current">${precio.toLocaleString()}</span>
        {oldPrice && <span className="old">${oldPrice.toLocaleString()}</span>}
      </div>
      <div className="stars">★★★★☆</div>
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={isOutOfStock ? 'btn-disabled' : ''}
      >
        {isOutOfStock ? 'Agotado' : 'Add to Cart'}
      </button>
    </article>
  );
};

export default ProductPreview;