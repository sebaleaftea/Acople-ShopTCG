
import AppNavbar from "./Components/navbar.jsx";
import AppFooter from "./Components/footer.jsx";
import MiniCart from "./Components/MiniCart.jsx";
import LoadingOverlay from "./Components/LoadingOverlay.jsx";
import './styles/theme.css';
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import { LoadingProvider } from "./contexts/LoadingContext.jsx";
import { ProductProvider } from "./contexts/ProductContext.jsx";

export default function App() {
  return (
    <LoadingProvider>
      <ProductProvider>
        <CartProvider>
          <BrowserRouter>
            <AppNavbar />
            {/* Overlay global de carga */}
            <LoadingOverlay />
            {/* Aquí van las rutas principales */}
            <AppRouter />
            {/* MiniCarrito global para todas las rutas */}
            <MiniCart />
            <AppFooter />
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </LoadingProvider>
  );
}
