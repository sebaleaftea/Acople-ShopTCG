import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/useCart";

const CardPreview = ({ card }) => {
  const { addToCart } = useCart();
  
  // Normalización de datos para visualización
  const nombre = card.nombre || card.name || "Sin nombre";
  const imagen = card.imagen || card.image || "https://placehold.co/300x400?text=No+Image";
  const precio = Number(card.precio || card.price || 0);
  const rareza = card.rareza || card.rarity || "-";
  const edicion = card.edicion || card.edition || "-";
  const stock = card.stock || 0;
  const isOutOfStock = stock <= 0;

  // Lógica visual de descuentos
  const hasDiscount = card.id && (String(card.id).includes('black') || String(card.id).includes('blue'));
  const discountPercent = hasDiscount ? 20 : 0;
  const oldPrice = hasDiscount ? Math.round(precio * 1.25) : null;

  const handleAddToCart = () => {
    // CORRECCIÓN: Enviamos el objeto 'card' completo al contexto
    // Esto asegura que el ID, el precio y el nombre lleguen juntos
    addToCart(card); 
  };

  return (
    <article className={`card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {hasDiscount && <div className="discount-badge">Save {discountPercent}%</div>}
      <Link
        to={`/detalle-carta/${card.id}`}
        className="card-link"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="card-media">
          <img src={imagen} alt={nombre} loading="lazy" decoding="async" />
        </div>
        <h3>{nombre}</h3>
      </Link>
      <p>Edición: {edicion}</p>
      <p>Rareza: {rareza}</p>
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

export default CardPreview;