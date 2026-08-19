import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryData as fallbackGallery } from '../data/galleryData';
import LightboxModal from '../components/LightboxModal';
import { API_BASE_URL, getImageUrl } from '../config/api';

// Module level cache to eliminate state re-fetch flash when navigating between pages
let cachedGallery = null;

export default function GalleryPage() {
  const [gallery, setGallery] = useState(cachedGallery || []);
  const [isLoading, setIsLoading] = useState(!cachedGallery);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE_URL}/gallery`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          cachedGallery = data;
          setGallery(data);
        }
        if (isMounted) setIsLoading(false);
      })
      .catch((err) => {
        console.log('Using local fallback gallery data:', err);
        if (isMounted) {
          setGallery(fallbackGallery);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.ceil(gallery.length / itemsPerPage);
  const paginatedGallery = gallery.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-body pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="uppercase tracking-[8px] text-gray-400 text-xs sm:text-sm mb-3">
            Our Portfolio
          </p>
          <h1 className="font-heading text-4xl sm:text-7xl tracking-[4px] font-semibold mb-6">
            KAALO INK IN MOTION
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed tracking-[2px]">
            Explore our studio portfolio. Every piece is crafted freehand or custom designed for our clients in Dharan, Nepal.
          </p>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="aspect-square bg-zinc-900/80 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedGallery.map((item) => {
            const imgSrc = getImageUrl(item.image);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedImage({ ...item, image: imgSrc })}
                className="group border border-white/15 hover:border-white/50 bg-black/60 backdrop-blur-sm overflow-hidden relative cursor-pointer"
              >
                <div className="aspect-square">
                  <img
                    src={imgSrc}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 p-6 flex flex-col justify-end">
                  {item.category && (
                    <p className="font-nav text-[10px] tracking-[3px] uppercase text-gray-400 mb-1">
                      {item.category}
                    </p>
                  )}
                  <h4 className="font-heading text-lg font-bold tracking-[1px] text-white uppercase">
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-gray-300 mt-1 font-body leading-relaxed line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-white/15 font-nav text-xs uppercase tracking-[2px]">
            <p className="text-gray-400">
              Showing Page <span className="text-white font-bold">{currentPage}</span> of{' '}
              <span className="text-white font-bold">{totalPages}</span> ({gallery.length} total artworks)
            </p>

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

      <LightboxModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage?.image}
        title={selectedImage?.title}
        caption={selectedImage?.caption}
        type="gallery"
      />
    </div>
  );
}
