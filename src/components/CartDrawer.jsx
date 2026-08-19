import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-body">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-white/15 text-white p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gray-300" />
                <h2 className="font-heading text-lg tracking-[2px] font-semibold uppercase">
                  Your Cart ({cartItems.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition p-1"
                aria-label="Close Cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="mt-6 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-nav">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-[1] text-gray-600 mb-3" />
                  <p className="text-sm tracking-[1px] uppercase">Your cart is empty</p>
                  <p className="text-xs text-gray-500 mt-1">Explore our studio shop merchandise.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-black/60 border border-white/10 rounded-sm items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-nav text-xs tracking-[1px] font-medium text-white truncate">
                        {item.name}
                      </h4>
                      <p className="font-nav text-xs text-gray-400 mt-1">
                        NPR {item.price.toLocaleString()}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 border border-white/20 text-xs flex items-center justify-center hover:bg-white hover:text-black transition"
                        >
                          -
                        </button>
                        <span className="font-nav text-xs px-2">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 border border-white/20 text-xs flex items-center justify-center hover:bg-white hover:text-black transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-500 hover:text-red-400 p-1 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer & Checkout Trigger */}
          {cartItems.length > 0 && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className="font-nav text-xs uppercase tracking-[2px] text-gray-400">Subtotal</span>
                <span className="font-nav text-base font-semibold tracking-[1px] text-white">
                  NPR {subtotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full bg-white text-black font-nav text-xs tracking-[3px] uppercase py-4 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-300"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-gray-500 text-center mt-3 font-nav">
                Secure checkout with eSewa or Cash on Delivery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
