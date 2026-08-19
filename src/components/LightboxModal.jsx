import React from 'react';
import { X, ExternalLink, ShoppingBag, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LightboxModal({
  isOpen,
  onClose,
  image,
  title,
  caption,
  artist,
  type = 'gallery',
  item = null,
  onAddToCart = null,
  categoryTag = null,
  actionText = null,
  actionLink = null
}) {
  if (!isOpen || !image) return null;

  // Determine Tag Label
  const tagLabel = categoryTag || (
    type === 'shop' ? 'Studio Merchandise' :
    type === 'course' ? 'Academy Course' :
    type === 'admin' ? 'Studio Inspection' :
    'Kaalo Ink Portfolio'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-body flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative max-w-4xl w-full bg-zinc-950 border border-white/20 text-white rounded-none overflow-hidden shadow-2xl z-10 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full hover:bg-white hover:text-black transition z-20"
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 bg-black flex items-center justify-center p-4 min-h-[300px] sm:min-h-[450px]">
            <img
              src={image}
              alt={title || 'Kaalo Ink Studio'}
              className="max-h-[75vh] w-auto object-contain rounded-none"
            />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/15 bg-[#0a0a0a]">
            <div>
              <p className="font-nav text-[10px] tracking-[3px] uppercase text-gray-400 mb-2">
                {tagLabel}
              </p>
              <h3 className="font-heading text-xl font-bold tracking-[1px] mb-3 text-white uppercase">
                {title || 'Tattoo Artwork'}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-6 font-body">
                {caption || 'Every needle stroke is a promise kept to the skin.'}
              </p>

              {artist && (
                <div className="border-t border-white/10 pt-4">
                  <p className="font-nav text-xs text-gray-400 uppercase tracking-[1.5px]">Created By:</p>
                  <p className="font-heading text-base font-semibold text-white mt-0.5">{artist.name}</p>
                  <p className="font-nav text-xs text-gray-400 mt-1">{artist.title}</p>
                </div>
              )}
            </div>

            {/* DYNAMIC APPROPRIATE ACTION BUTTON AREA */}
            <div className="pt-6 border-t border-white/10">
              {type === 'shop' || onAddToCart ? (
                item && item.inStock === false ? (
                  <button
                    disabled
                    className="w-full bg-zinc-900 border border-white/10 text-gray-500 font-nav text-xs tracking-[2px] uppercase py-3 px-4 font-semibold cursor-not-allowed text-center"
                  >
                    Out of Stock
                  </button>
                ) : onAddToCart && item ? (
                  <button
                    onClick={() => {
                      onAddToCart(item);
                      onClose();
                    }}
                    className="w-full border border-white bg-white text-black font-nav text-xs tracking-[2px] uppercase py-3 px-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-300 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="w-full border border-white bg-white text-black font-nav text-xs tracking-[2px] uppercase py-3 px-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-300"
                  >
                    <span>Explore Shop</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )
              ) : type === 'course' ? (
                <Link
                  to="/classes"
                  onClick={onClose}
                  className="w-full border border-white bg-white text-black font-nav text-xs tracking-[2px] uppercase py-3 px-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-300"
                >
                  <span>Enroll in Class</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : type === 'admin' ? (
                <button
                  onClick={onClose}
                  className="w-full border border-white/30 text-white font-nav text-xs tracking-[2px] uppercase py-3 px-4 font-semibold hover:bg-white hover:text-black transition duration-300"
                >
                  Close Inspection
                </button>
              ) : type === 'gallery' || showActionButton === false ? (
                <button
                  onClick={onClose}
                  className="w-full border border-white/30 text-white font-nav text-xs tracking-[2px] uppercase py-3 px-4 font-semibold hover:bg-white hover:text-black transition duration-300"
                >
                  Close Preview
                </button>
              ) : (
                <Link
                  to={actionLink || (artist && artist.name ? `/booking?artist=${encodeURIComponent(artist.name)}` : '/booking')}
                  onClick={onClose}
                  className="w-full border border-white bg-white text-black font-nav text-xs tracking-[2px] uppercase py-3 px-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-300"
                >
                  <span>{actionText || 'Book Similar Tattoo'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
