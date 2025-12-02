import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../Api/axios';
import { getImageBySlug } from '../utils/imageMapper';

// 1. Create the Context
const ProductContext = createContext();

// 2. Create a custom hook for easy consumption
export const useProducts = () => useContext(ProductContext);

// 3. Create the Provider component
export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndProcessProducts = async () => {
            try {
                // Fetch raw data from the Spring Boot backend
                const response = await api.get('/products');
                const backendProducts = response.data || [];

                // Normalize the backend data to match the frontend's expected structure
                const processedProducts = backendProducts.map(p => ({
                    id: p.id,
                    nombre: p.name,
                    slug: p.slug,
                    precio: p.price,
                    stock: p.stock,
                    descripcion: p.description,
                    // Use the existing imageMapper to get the correct local image
                    imagen: getImageBySlug(p.slug),
                    // Standardize productType and game fields
                    productType: (p.game && p.game !== 'accesorio') ? 'single' : 'accesorio',
                    game: p.game || 'accesorio',
                    category: p.category || 'General',
                    // Add a flag for reference, though it's no longer strictly needed
                    isBackend: true 
                }));

                setProducts(processedProducts);
            } catch (err) {
                console.error("Error fetching or processing products:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndProcessProducts();
    }, []); // Empty dependency array ensures this runs only once on app load

    // The value provided to consuming components
    const value = {
        products,
        isLoading,
        error
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
