import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';

import HomePage from './pages/HomePage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistBioPage from './pages/ArtistBioPage';
import GalleryPage from './pages/GalleryPage';
import BookingPage from './pages/BookingPage';
import ClassesPage from './pages/ClassesPage';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';

// Scroll to top synchronously on route change before browser paint (prevents scroll flash)
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('kaalo_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('kaalo_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <Router>
      <ScrollToTop />
      <div
        className="min-h-screen bg-cover bg-center bg-fixed text-white flex flex-col font-body selection:bg-white selection:text-black relative"
        style={{ backgroundImage: "url('/images/hero1.jpg')" }}
      >
        {/* Dark Overlay Layer */}
        <div className="absolute inset-0 bg-black/60 min-h-full" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col min-h-screen flex-1">
          <Navbar
            cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/artists/:slug" element={<ArtistBioPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/shop" element={<ShopPage onAddToCart={handleAddToCart} />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>

          <Footer />

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onProceedToCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            onClearCart={handleClearCart}
          />
        </div>
      </div>
    </Router>
  );
}
