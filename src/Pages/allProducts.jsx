import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Filter from "../Components/Filter";
import CardPreview from "../Components/CardPreview";
import ProductPreview from "../Components/ProductPreview";
import { useProducts } from "../contexts/ProductContext"; // <-- 1. IMPORT
import '../styles/magicSingles.css';

const normalizeType = (t) => {
  const v = (t || '').toLowerCase();
  if (v === 'single' || v === 'singles') return 'single';
  if (v === 'accesorio' || v === 'accesorios' || v === 'accessory') return 'accesorio';
  if (v === 'all' || v === 'todos') return 'all';
  return 'all';
};

const AllProducts = () => {
  const { products, isLoading } = useProducts(); 
  
  const [filtered, setFiltered] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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
  }, [products]);

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
            {isLoading ? (
              <p>Cargando productos...</p>
            ) : (
              filtered.map(item => (
                item.productType === 'single' ? (
                  <CardPreview key={item.id} card={item} />
                ) : (
                  <ProductPreview key={item.id} product={item} />
                )
              ))
            )}
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