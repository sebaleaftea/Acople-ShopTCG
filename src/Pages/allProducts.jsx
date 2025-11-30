import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Filter from "../Components/Filter";
import CardPreview from "../Components/CardPreview";
import ProductPreview from "../Components/ProductPreview";
import api from "../api/axios";
import '../styles/magicSingles.css';

// 1. Importamos los datos estáticos para usarlos como respaldo/demo
import { allProducts as staticProducts } from "../data/products";

const normalizeType = (t) => {
  const v = (t || '').toLowerCase();
  if (v === 'single' || v === 'singles') return 'single';
  if (v === 'accesorio' || v === 'accesorios' || v === 'accessory') return 'accesorio';
  if (v === 'all' || v === 'todos') return 'all';
  return 'all';
};

const AllProducts = () => {
  // 2. Inicializamos el estado CON los productos estáticos
  const [products, setProducts] = useState(staticProducts);
  const [filtered, setFiltered] = useState(staticProducts);
  
  const [isLoading, setIsLoading] = useState(true); 
  const [showFilters, setShowFilters] = useState(false);
  
  // CORRECCIÓN 1: Quitamos setSearchParams que no se usaba
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      // No activamos loading aquí para no ocultar los estáticos
      try {
        const response = await api.get('/products?limit=100&isActive=true');
        
        const backendProducts = response.data.data.products.map(p => ({
          id: p._id,
          nombre: p.name,
          precio: p.price,
          stock: p.stock,
          descripcion: p.description,
          imagen: p.images && p.images.length > 0 ? p.images[0].url : "https://placehold.co/300x400?text=Sin+Imagen",
          
          // Datos ficticios de compatibilidad
          productType: 'single', 
          game: 'magic', 
          category: 'general',
          rareza: 'Rara',
          edicion: 'Core Set',
          isBackend: true 
        }));

        const combinedProducts = [...backendProducts, ...staticProducts];
        setProducts(combinedProducts);
        
      } catch (error) {
        console.error("Error conectando con API, mostrando solo estáticos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // CORRECCIÓN 2: Envolvemos handleFilter en useCallback
  const handleFilter = useCallback((filters) => {
    let items = products.slice();

    const t = normalizeType(filters.productType || 'all');
    if (t !== 'all') {
      items = items.filter(i => (i.productType || '').toLowerCase() === t);
    }

    if (filters.game && filters.game !== 'all') {
      const g = (filters.game || '').toLowerCase();
      items = items.filter(i => (i.game || '').toLowerCase() === g);
    }

    if (filters.category && filters.category !== 'all') {
      const c = (filters.category || '').toLowerCase();
      items = items.filter(i => (i.category || '').toLowerCase() === c);
    }

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      items = items.filter(i => Number(i.precio) >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      items = items.filter(i => Number(i.precio) <= Number(filters.maxPrice));
    }
    
    if (filters.query) {
      const q = filters.query.toLowerCase();
      items = items.filter(i => (i.nombre || '').toLowerCase().includes(q));
    }

    if (filters.priceOrder === 'asc') {
      items.sort((a, b) => a.precio - b.precio);
    } else if (filters.priceOrder === 'desc') {
      items.sort((a, b) => b.precio - a.precio);
    }

    setFiltered(items);
  }, [products]); // Se recrea solo si cambian los productos

  const urlFilters = useMemo(() => {
    return {
      productType: searchParams.get('productType') || 'all',
      game: searchParams.get('game') || 'all',
      category: searchParams.get('category') || 'all',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      priceOrder: searchParams.get('priceOrder') || '',
      query: searchParams.get('query') || '',
    };
  }, [searchParams]);

  // CORRECCIÓN 3: Agregamos handleFilter a las dependencias
  useEffect(() => {
    handleFilter(urlFilters);
  }, [urlFilters, handleFilter]);

  return (
    <div>
      <header>
        <h2>Todos los Productos</h2>
      </header>
      <main className="page-singles">
        <aside className="filter-sidebar filters">
          <Filter onFilter={handleFilter} mode="all" showSearch={true} />
        </aside>
        <section className="results">
          <button
            className="mobile-filter-toggle"
            onClick={() => setShowFilters(true)}
          >
            Mostrar Filtros
          </button>
          
          <h2>Resultados ({filtered.length})</h2>
          
          <div className="cards-grid">
            {filtered.map(item => (
              item.productType === 'single' ? (
                <CardPreview key={item.id} card={item} />
              ) : (
                <ProductPreview key={item.id} product={item} />
              )
            ))}
          </div>

          {filtered.length === 0 && !isLoading && (
             <p style={{textAlign: 'center', width: '100%'}}>No se encontraron productos.</p>
          )}
        </section>
      </main>

      {showFilters && (
        <div className="mobile-filter-modal-overlay" onClick={() => setShowFilters(false)}>
          <div className="mobile-filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-filter-header">
              <h3>Filtros</h3>
              <button className="mobile-filter-close" onClick={() => setShowFilters(false)}>✕</button>
            </div>
            <div className="mobile-filter-content">
              <Filter onFilter={handleFilter} mode="all" showSearch={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;