import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../Api/axios";
import { getImageBySlug } from "../utils/imageMapper";
import { useCart } from "../contexts/useCart";
import CardPreview from "./CardPreview";
import ProductPreview from "./ProductPreview";
import "../styles/detalle-carta.css";

const DetalleCarta = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
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

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      try {
        const response = await api.get('/products');
        const allProducts = response.data;
        let related = [];
        if (product.productType === 'single') {
          related = allProducts.filter(p => p.productType === 'single' && p.game === product.game && p.id !== product.id);
        } else {
          related = allProducts.filter(p => p.category === product.category && p.id !== product.id);
        }
        setRelatedProducts(related.slice(0, 4));
      } catch (err) {
        console.log("Error fetching related products:", err);
      }
    };

    fetchRelatedProducts();
  }, [product]);

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
          <p className="detalle-carta-precio">${Number(product.price).toLocaleString()}</p>
          <span className={`detalle-carta-stock-badge ${isOutOfStock ? 'agotado' : 'disponible'}`}>
            {isOutOfStock ? 'Agotado' : `Disponible (${stockVal} unidades)`}
          </span>
          <div className="detalle-carta-detalles">
            {product.productType === 'single' && (
              <>
                <div className="detalle-carta-detalle-item">
                  <i className="fas fa-dice"></i>
                  <span><strong>Juego:</strong> {product.game}</span>
                </div>
                <div className="detalle-carta-detalle-item">
                  <i className="fas fa-tag"></i>
                  <span><strong>Categoría:</strong> {product.rarity}</span>
                </div>
                <div className="detalle-carta-detalle-item">
                  <i className="fas fa-calendar"></i>
                  <span><strong>Edición:</strong> {product.edition}</span>
                </div>
              </>
            )}
            {product.productType === 'accesorio' && (
              <div className="detalle-carta-detalle-item">
                <i className="fas fa-cubes"></i>
                <span><strong>Categoría:</strong> {product.category}</span>
              </div>
            )}
          </div>
          <p className="detalle-carta-descripcion">{product.description}</p>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`detalle-carta-cta-btn ${isOutOfStock ? 'disabled' : ''}`}
          >
            {isOutOfStock ? 'Agotado' : 'Agregar al Carro'}
          </button>
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <section className="detalle-carta-related">
          <h2 className="detalle-carta-related-title">También te podría interesar</h2>
          <div className="detalle-carta-related-grid">
            {relatedProducts.map((relatedProduct) => (
              relatedProduct.productType === 'single' ? (
                <CardPreview key={relatedProduct.id} card={relatedProduct} />
              ) : (
                <ProductPreview key={relatedProduct.id} product={relatedProduct} />
              )
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default DetalleCarta;
