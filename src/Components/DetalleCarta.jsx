import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../Api/axios";
import { getImageBySlug } from "../utils/imageMapper";
import { useCart } from "../contexts/CartContext";
import "../styles/detalle-carta.css";

const DetalleCarta = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(err.response?.status === 404 ? "Producto no encontrado en el inventario" : "Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        nombre: product.name,
        precio: product.price,
        imagen: product.image || getImageBySlug(product.slug),
        fromBackend: true
      });
    }
  };

  if (loading) {
    return (
      <main className="detalle-carta-container">
        <div className="detalle-carta-flex">
          <div className="detalle-carta-info-col">
            <div className="loading">Cargando detalles...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="detalle-carta-container">
        <div className="detalle-carta-flex">
          <div className="detalle-carta-info-col">
            <div className="detalle-carta-error">
              {error}
              <br />
              <button onClick={() => window.history.back()}>Volver</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="detalle-carta-container">
        <div className="detalle-carta-flex">
          <div className="detalle-carta-info-col">
            <div className="detalle-carta-error">
              Producto no encontrado.
            </div>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl = product.image || getImageBySlug(product.slug);
  const stockVal = Number(product.stock || 0);
  const isOutOfStock = stockVal <= 0;

  return (
    <main className="detalle-carta-container">
      <div className="detalle-carta-flex">
        <div className="detalle-carta-img-col">
          <img
            src={imageUrl}
            alt={product.name}
            className="detalle-carta-img"
          />
        </div>
        <div className="detalle-carta-info-col">
          <h1 className="detalle-carta-nombre">{product.name}</h1>
          <div className="detalle-carta-info-list">
            <p><strong>Juego:</strong> {product.game?.name || '-'}</p>
            <p><strong>Categoría:</strong> {product.category?.name || '-'}</p>
            <p><strong>Rareza:</strong> {product.rarity || '-'}</p>
            <p><strong>Precio:</strong> ${Number(product.price).toLocaleString()}</p>
            <p><strong>N° Coleccionista:</strong> {product.collection || '-'}</p>
            <p><strong>Stock:</strong> {isOutOfStock ? <span style={{ color: 'red' }}>AGOTADO</span> : <span style={{ color: 'green' }}>Disponible ({stockVal} un.)</span>}</p>
          </div>
          <div className="detalle-carta-descripcion">
            <p>{product.description}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
          >
            {isOutOfStock ? 'Agotado' : 'Agregar al Carro'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default DetalleCarta;
