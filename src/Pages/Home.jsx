import React, { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/home.css";
import { useProducts } from "../contexts/ProductContext";
import magicIcon from "../assets/images/magic-icon.png";
import pokemonIcon from "../assets/images/pokemon-icon.png";
import yugiohIcon from "../assets/images/yugioh-icon.png";
import blogHoth from "../assets/images/blog-hoth.webp";
import blogSonic from "../assets/images/blog-sonic.webp";
import blogNinos from "../assets/images/blog-ninos.webp";
import Ticker from "../Components/Ticker";

const Home = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/all-products?query=${encodeURIComponent(term)}`);
  }, [q, navigate]);

  const { products, isLoading } = useProducts();

  const featuredProductSlugs = useMemo(() => [
    'black-lotus',
    'the-one-ring-scroll',
    'time-walk',
    'charizard-ex',
    'pikachu_illustrator',
    'mewtwo',
    'blue-eyes-dragon',
    'dark-magician'
  ], []);

  const featuredProducts = useMemo(() => {
    if (isLoading || !products.length) return [];
    const productMap = new Map(products.map(p => [p.slug, p]));
    return featuredProductSlugs.map(slug => productMap.get(slug)).filter(Boolean);
  }, [products, isLoading, featuredProductSlugs]);

  return (
    <main id="contenido" tabIndex="-1">
      {/* Pantalla 1: HOME / LANDING */}
      <section id="home" className="screen" aria-labelledby="home-title">
        <h2 id="home-title">Bienvenido</h2>
        <p className="homepage-tagline">Libera el poder de tus cartas raras, Forja mazos imparables.</p>

        {/* Buscador de cartas y accesorios */}
        <form aria-label="Buscador de cartas" data-screen="home" onSubmit={onSearchSubmit} className="home-search-form">
          <label htmlFor="q">¿Qué carta o accesorio buscas hoy?</label>
          <input
            id="q"
            name="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Black Lotus, Charizard, dados, protectores..."
          />
          <button type="submit">Buscar</button>
        </form>

        {/* Cartas destacadas - efecto ticker */}
        <section aria-labelledby="home-destacados-title">
          <h3 id="home-destacados-title">Cartas destacadas de hoy</h3>
          <Ticker ariaLabel="Cartas destacadas de hoy">
            {isLoading ? (
              <li><p>Cargando cartas...</p></li>
            ) : (
              featuredProducts.map(card => (
                <li key={card.id} className="card-tcg">
                  <img src={card.imagen} alt={`${card.game}: ${card.nombre}`} className="card-img" />
                  <div className="card-content">
                    <div className="card-info">
                      <div className="card-title">{card.nombre}</div>
                      <div className="card-meta">{card.game}</div>
                      <div className="card-desc">{card.descripcion}</div>
                    </div>
                    <Link to={`/detalle-carta/${card.slug}`} className="card-link">Ver detalle</Link>
                  </div>
                </li>
              ))
            )}
          </Ticker>
        </section>
      </section>

      {/* Pantalla 2: Singles */}
      <section id="singles" className="screen" aria-labelledby="singles-title">
        <h2 id="singles-title">Compra de Singles</h2>
        <div className="tcg-icons">
          <Link to="/tienda?productType=single&game=magic" aria-label="Magic: The Gathering">
            <img src={magicIcon} alt="Magic: The Gathering" />
          </Link>
          <Link to="/tienda?productType=single&game=pokemon" aria-label="Pokémon">
            <img src={pokemonIcon} alt="Pokémon" />
          </Link>
          <Link to="/tienda?productType=single&game=yugioh" aria-label="Yu-Gi-Oh!">
            <img src={yugiohIcon} alt="Yu-Gi-Oh!" />
          </Link>
        </div>
      </section>

      {/* Pantalla 3: Blog */}
      <section id="blog" className="screen" aria-labelledby="blog-title">
        <div className="blog-header">
          <h2 id="blog-title" className="blog-title">Blog TCG</h2>
          <p className="blog-subtitle">Descubre las últimas noticias, consejos y reseñas del mundo de los TCG</p>
          <div className="blog-divider"></div>
        </div>

        <div className="blog-section">
          <h3 className="blog-section-title">Últimas Publicaciones</h3>
          <div className="blog-grid">
            <article className="blog-card">
              <img src={blogHoth} alt="Hoth" className="blog-card-image" />
              <div className="blog-card-content">
                <h4 className="blog-card-title">Hoth: La Nueva Expansión de Star Wars Unlimited</h4>
                <p className="blog-card-desc">Explora las nuevas cartas y estrategias de la expansión Hoth en Star Wars Unlimited. Análisis detallado de las cartas más poderosas.</p>
                <Link to="/blog/hoth-expansion" className="blog-card-cta">Leer más</Link>
              </div>
            </article>

            <article className="blog-card">
              <img src={blogSonic} alt="Sonic" className="blog-card-image" />
              <div className="blog-card-content">
                <h4 className="blog-card-title">Sonic Boom: Estrategias Avanzadas</h4>
                <p className="blog-card-desc">Descubre cómo construir mazos competitivos con las cartas de Sonic Boom. Consejos para principiantes y avanzados.</p>
                <Link to="/blog/sonic-boom-strategies" className="blog-card-cta">Leer más</Link>
              </div>
            </article>

            <article className="blog-card">
              <img src={blogNinos} alt="Niños" className="blog-card-image" />
              <div className="blog-card-content">
                <h4 className="blog-card-title">TCG para Niños: Introducción Amigable</h4>
                <p className="blog-card-desc">Guía completa para introducir a los niños al mundo de los TCG. Juegos divertidos y educativos para todas las edades.</p>
                <Link to="/blog/tcg-for-kids" className="blog-card-cta">Leer más</Link>
              </div>
            </article>
          </div>
        </div>

        <div className="tips-section">
          <h3 className="tips-title">Consejos Rápidos</h3>
          <ul className="tips-list">
            <li className="tips-item">
              <span className="tips-item-icon">💡</span>
              <p className="tips-item-text">Mantén tus cartas en buenas condiciones para preservar su valor.</p>
            </li>
            <li className="tips-item">
              <span className="tips-item-icon">🎯</span>
              <p className="tips-item-text">Estudia las reglas antes de tu primer torneo para evitar sorpresas.</p>
            </li>
            <li className="tips-item">
              <span className="tips-item-icon">🔄</span>
              <p className="tips-item-text">Intercambia cartas con amigos para completar tu colección sin gastar mucho.</p>
            </li>
            <li className="tips-item">
              <span className="tips-item-icon">📚</span>
              <p className="tips-item-text">Lee reseñas y guías en línea para mejorar tus estrategias de juego.</p>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default Home;
