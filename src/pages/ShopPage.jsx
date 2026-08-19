import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { productsData as fallbackProducts, productCategories as fallbackCategories } from '../data/productsData';
import { API_BASE_URL, getImageUrl } from '../config/api';
import LightboxModal from '../components/LightboxModal';

// Module level cache to eliminate state re-fetch flash when navigating between pages
let cachedProducts = null;
let cachedCategories = null;

export default function ShopPage({ onAddToCart }) {
  const [products, setProducts] = useState(cachedProducts || []);
  const [categories, setCategories] = useState(cachedCategories || fallbackCategories);
  const [isLoading, setIsLoading] = useState(!cachedProducts);
  const [activeCategory, setActiveCategory] = useState('All');
  const [addedItemIds, setAddedItemIds] = useState([]);
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    let isMounted = true;

    // Check eSewa payment return callback URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('orderId');

    if (paymentStatus === 'success' && orderId) {
      fetch(`${API_BASE_URL}/orders/esewa-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
        .then(res => res.json())
        .then(data => {
          if (isMounted) {
            setPaymentNotice({
              type: 'success',
              message: `Payment successful! Order ${orderId} confirmed.`
            });
          }
        })
        .catch(err => console.error('Verification error:', err));
    } else if (paymentStatus === 'failed') {
      if (isMounted) {
        setPaymentNotice({
          type: 'error',
          message: 'Payment was cancelled or failed. Please try again.'
        });
      }
    }

    fetch(`${API_BASE_URL}/products/categories`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          cachedCategories = data;
          setCategories(data);
        }
      })
      .catch(err => console.log('Using fallback categories:', err));

    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          cachedProducts = data;
          setProducts(data);
        }
        if (isMounted) setIsLoading(false);
      })
      .catch(err => {
        console.log('Using fallback products:', err);
        if (isMounted) {
          setProducts(fallbackProducts);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdd = (product) => {
    if (product.inStock === false) return;
    onAddToCart(product);
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

  // 12-Item Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-white font-body pt-28 pb-24 bg-transparent">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center mb-16">
        <p className="uppercase tracking-[8px] text-gray-300 text-xs sm:text-sm mb-3">
          Studio Merchandise & Prints
        </p>

        <h1 className="font-heading text-4xl sm:text-6xl tracking-[4px] font-semibold text-white mb-6">
          OFFICIAL MERCH STORE
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed tracking-[1.5px] font-body">
          Original artwork prints, custom bookmarks, apparel, and professional tattoo aftercare products from Kaalo Ink Studio.
        </p>

        {paymentNotice && (
          <div className={`mt-6 max-w-xl mx-auto p-4 border font-nav text-xs tracking-[1px] uppercase rounded-xs ${
            paymentNotice.type === 'success' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-red-950/80 border-red-500 text-red-300'
          }`}>
            {paymentNotice.message}
          </div>
        )}
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-12">
        <div className="flex justify-center flex-wrap gap-3 font-nav text-xs tracking-[2px] uppercase">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 border transition duration-300 ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'border-white bg-white text-black font-bold'
                  : 'border-white/20 text-gray-400 hover:border-white/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="border border-white/10 bg-black/40 p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-zinc-900/80 w-full" />
                <div className="h-4 bg-zinc-800/80 w-3/4" />
                <div className="h-3 bg-zinc-800/60 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-black/60 font-nav text-sm text-gray-400">
            No merchandise products found in "{activeCategory}" category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProducts.map((product) => {
              const isJustAdded = addedItemIds.includes(product.id);
              const imgSrc = getImageUrl(product.image);

              return (
                <div
                  key={product.id}
                  className="border border-white/15 hover:border-white/50 bg-black/60 backdrop-blur-sm transition-all duration-400 ease-out group flex flex-col h-full overflow-hidden rounded-none hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                >
                  {/* GALLERY STYLE FULL FIT PRODUCT IMAGE CONTAINER */}
                  <div
                    onClick={() => setSelectedImage({
                      image: imgSrc,
                      title: product.name,
                      caption: `${product.category} • NPR ${parseFloat(product.price).toLocaleString()} - ${product.description || ''}`,
                      productObj: { ...product, image: imgSrc }
                    })}
                    className="aspect-square relative cursor-pointer overflow-hidden border-b border-white/[0.08] bg-black/60"
                    title="Click to view high-res product photo"
                  >
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${product.inStock === false ? 'opacity-40 grayscale' : ''}`}
                    />

                    {/* CATEGORY TAG BADGE */}
                    <span className="absolute top-4 left-4 font-nav text-[10px] tracking-[2.5px] uppercase bg-black/50 backdrop-blur-md px-3 py-1 border border-white/10 text-gray-300 z-10 rounded-none">
                      {product.category}
                    </span>

                    {product.inStock === false ? (
                      <span className="absolute top-4 right-4 font-nav text-[10px] tracking-[2px] uppercase bg-red-950/80 backdrop-blur-md border border-red-500/60 text-red-300 px-3 py-1 font-semibold shadow-lg z-10 rounded-none">
                        Out of Stock
                      </span>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white font-nav text-xs font-semibold gap-1.5 uppercase backdrop-blur-[2px] z-20">
                        <ZoomIn className="w-4 h-4" />
                        <span>View Photo</span>
                      </div>
                    )}
                  </div>

                  {/* TEXT & PRICE DETAILS AREA */}
                  <div className="bg-transparent p-6 flex flex-col flex-1 justify-between space-y-5">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-white tracking-[0.5px] uppercase mb-2 group-hover:text-amber-100/90 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed font-body line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
                      <div>
                        <span className="font-nav text-[9px] font-medium tracking-[2.5px] text-gray-500 uppercase block mb-0.5">Price</span>
                        <span className="font-nav text-base sm:text-lg font-bold tracking-[0.5px] text-[#e6d8c3]">
                          NPR {parseFloat(product.price).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => product.inStock !== false && handleAdd({ ...product, image: imgSrc })}
                        disabled={product.inStock === false}
                        className={`font-nav text-xs tracking-[2px] uppercase px-5 py-2.5 font-semibold transition-all duration-300 flex items-center gap-2 border rounded-none ${
                          product.inStock === false
                            ? 'bg-zinc-900 text-gray-500 border-white/10 cursor-not-allowed'
                            : isJustAdded
                            ? 'bg-emerald-500 text-black border-emerald-500'
                            : 'border-white/30 bg-transparent text-white hover:bg-white hover:text-black hover:border-white cursor-pointer'
                        }`}
                      >
                        {product.inStock === false ? (
                          <span>Out of Stock</span>
                        ) : isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 12-ITEM PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/15 font-nav text-xs uppercase tracking-[2px]">
            <span className="text-gray-400">
              Showing Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredProducts.length} items)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 border border-white/20 hover:border-white disabled:opacity-30 disabled:hover:border-white/20 transition rounded-xs flex items-center gap-1 text-white"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 border text-xs font-bold transition rounded-xs flex items-center justify-center ${
                      currentPage === pageNum
                        ? 'border-white bg-white text-black'
                        : 'border-white/20 text-gray-400 hover:border-white hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 border border-white/20 hover:border-white disabled:opacity-30 disabled:hover:border-white/20 transition rounded-xs flex items-center gap-1 text-white"
                aria-label="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL FOR SHOP PRODUCT PHOTOS */}
      <LightboxModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage?.image}
        title={selectedImage?.title}
        caption={selectedImage?.caption}
        type="shop"
        item={selectedImage?.productObj}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
