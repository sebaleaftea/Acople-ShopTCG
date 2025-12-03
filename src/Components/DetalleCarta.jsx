import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../Api/axios";
import { getImageBySlug } from "../utils/imageMapper";
import { useCart } from "../contexts/useCart";
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
      console.log("Iniciando fetch para ID:", id);
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data) {
          setProduct(response.data);
        } else {
          setError("No se encontró la carta solicitada");
        }
      } catch (err) {
        console.log("Error fetch:", err);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
  };

  if (loading) {
    return (
      <main className="detalle-carta-container">
        <div className="detalle-carta-flex">
          <div className="detalle-carta-info-col">
            <div className="loading">Cargando...</div>
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
              No se encontró la carta solicitada
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
            <p><strong>Precio:</strong> ${Number(product.price).toLocaleString()}</p>
            <p><strong>Descripción:</strong> {product.description}</p>
            <p><strong>Stock:</strong> {isOutOfStock ? "Agotado" : `Disponible (${stockVal} unidades)`}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{
              backgroundColor: isOutOfStock ? '#ccc' : '#6a0dad',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {isOutOfStock ? 'Agotado' : 'Agregar al Carro'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default DetalleCarta;
