import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, ArrowLeft, QrCode, Upload, CheckCircle, ZoomIn } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function CheckoutModal({ isOpen, onClose, cartItems, onClearCart }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dharan'
  });

  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [isQrLightboxOpen, setIsQrLightboxOpen] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProofFile(file);
      setPaymentProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentProofFile) {
      setErrorMessage('Please upload a screenshot or photo of your payment success receipt.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = new FormData();
      payload.append('customer', JSON.stringify(formData));
      payload.append('items', JSON.stringify(cartItems));
      payload.append('totalAmount', totalAmount);
      payload.append('paymentProof', paymentProofFile);

      const res = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        body: payload
      });

      const data = await res.json();

      if (res.ok) {
        onClearCart();
        setOrderConfirmed({
          orderId: data.orderId || `KI-ORDER-${Date.now()}`,
          customerName: formData.fullName,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}`,
          totalAmount
        });
      } else {
        setErrorMessage(data.error || 'Failed to submit order. Please check all fields.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage('Server connection error. Make sure backend is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setOrderConfirmed(null);
    setPaymentProofFile(null);
    setPaymentProofPreview(null);
    setErrorMessage('');
    setIsQrLightboxOpen(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-hidden cursor-pointer"
      onClick={handleModalClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-zinc-950 border border-white/20 rounded-sm shadow-2xl flex flex-col cursor-default overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 shrink-0 bg-zinc-950 flex justify-between items-center z-10">
          <button
            type="button"
            onClick={handleModalClose}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white font-nav uppercase tracking-[1px] transition duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-nav text-[10px] uppercase tracking-[1px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              Direct Transfer
            </span>
            <button
              onClick={handleModalClose}
              className="text-gray-400 hover:text-white transition duration-300 p-1"
              title="Close Checkout Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {orderConfirmed ? (
          /* SUCCESS SCREEN */
          <div className="p-6 sm:p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div>
              <p className="font-nav text-xs uppercase tracking-[3px] text-emerald-400 mb-1">
                Receipt Submitted Successfully
              </p>
              <h3 className="font-heading text-2xl sm:text-3xl tracking-[2px] font-bold text-white uppercase">
                ORDER {orderConfirmed.orderId}
              </h3>
              <p className="font-nav text-xs text-gray-400 mt-2 max-w-md mx-auto">
                Thank you <span className="text-white font-semibold">{orderConfirmed.customerName}</span>! Your order and payment receipt have been logged for verification by our studio manager.
              </p>
            </div>

            <div className="border border-white/10 bg-black/60 p-4 text-left font-nav text-xs space-y-2 rounded-xs">
              <p><span className="text-gray-400">Delivery Contact:</span> <span className="text-white font-medium">{orderConfirmed.phone}</span></p>
              <p><span className="text-gray-400">Address:</span> <span className="text-white font-medium">{orderConfirmed.address}</span></p>
              <p><span className="text-gray-400">Total Amount:</span> <span className="text-emerald-400 font-bold">NPR {orderConfirmed.totalAmount.toLocaleString()}</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/9779716585794?text=${encodeURIComponent(`Hi Kaalo Ink Studio! I submitted Order ${orderConfirmed.orderId} (NPR ${orderConfirmed.totalAmount}). Name: ${orderConfirmed.customerName}`)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-nav text-xs tracking-[2px] uppercase py-3.5 px-6 font-bold transition flex items-center justify-center gap-2"
              >
                <span>Confirm via WhatsApp</span>
              </a>

              <button
                onClick={handleModalClose}
                className="border border-white/20 text-gray-300 hover:text-white font-nav text-xs tracking-[2px] uppercase py-3.5 px-6 transition"
              >
                Close Store
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* SCROLLABLE BODY SECTION */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* SECTION TITLE */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/40 shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-lg sm:text-xl tracking-[1.5px] font-bold text-white uppercase">
                    Direct Bank QR Payment
                  </h3>
                  <p className="font-nav text-[11px] text-gray-400">
                    Scan QR with Mobile Banking App & Upload Payment Receipt
                  </p>
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="border border-white/10 bg-black/60 p-3.5 space-y-2 rounded-xs">
                <p className="font-nav text-[11px] uppercase tracking-[2px] text-gray-400 mb-1">
                  Order Summary ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items)
                </p>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs font-nav">
                    <span className="text-white truncate max-w-xs">{item.name} (x{item.quantity})</span>
                    <span className="text-gray-300">NPR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold text-xs sm:text-sm text-white font-nav">
                  <span>Total Amount to Transfer:</span>
                  <span className="text-emerald-400 font-mono">NPR {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* OFFICIAL BANK QR CODE DISPLAY WITH LIGHTBOX */}
              <div className="border border-amber-500/30 bg-amber-950/20 p-4 text-center space-y-2 rounded-xs">
                <p className="font-nav text-xs tracking-[1.5px] uppercase text-amber-300 font-bold">
                  1. Scan QR with Any Mobile Banking / Fonepay App
                </p>

                <div
                  onClick={() => setIsQrLightboxOpen(true)}
                  className="bg-white p-2.5 rounded-sm inline-block shadow-2xl mx-auto border border-white cursor-pointer group relative overflow-hidden"
                  title="Click to Expand QR Code Lightbox"
                >
                  <img
                    src="/images/QR_kaalo.png"
                    alt="Kaalo Ink Official Bank QR Code"
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain mx-auto group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white font-nav text-xs font-bold gap-1 uppercase">
                    <ZoomIn className="w-4 h-4" />
                    <span>Click to Expand</span>
                  </div>
                </div>
                <p className="font-nav text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-[1px]">
                  🔍 Click QR Image to Open Lightbox Full View
                </p>
              </div>

              {/* CUSTOMER INPUT FIELDS */}
              <div className="space-y-3 font-nav text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[1px] text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Suresh Shrestha"
                      className="w-full bg-black border border-white/20 focus:border-amber-400 p-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[1px] text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="98xxxxxxx"
                      className="w-full bg-black border border-white/20 focus:border-amber-400 p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[1px] text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="suresh@example.com"
                      className="w-full bg-black border border-white/20 focus:border-amber-400 p-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[1px] text-gray-300 mb-1">
                      City / Location *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Dharan"
                      className="w-full bg-black border border-white/20 focus:border-amber-400 p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[1px] text-gray-300 mb-1">
                    Delivery Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street name, Tole, Landmark..."
                    className="w-full bg-black border border-white/20 focus:border-amber-400 p-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* PAYMENT PROOF SCREENSHOT UPLOAD */}
                <div className="border border-white/20 bg-zinc-900 p-3.5 space-y-2 rounded-xs">
                  <label className="block text-[11px] uppercase tracking-[1px] text-amber-300 font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>2. Upload Payment Success Receipt / Screenshot *</span>
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer bg-black border border-white/20 p-2"
                  />

                  {paymentProofPreview && (
                    <div className="pt-2 text-center">
                      <p className="font-nav text-[10px] uppercase text-gray-400 mb-1">Receipt Preview:</p>
                      <img
                        src={paymentProofPreview}
                        alt="Payment Receipt Preview"
                        className="w-28 h-28 sm:w-32 sm:h-32 object-cover mx-auto border border-emerald-500 rounded shadow-lg"
                      />
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 border border-red-500/40 bg-red-950/30 text-red-300 font-nav text-xs">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>

            {/* FIXED STICKY MODAL FOOTER ACTION BUTTONS */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-zinc-950 shrink-0 flex flex-col sm:flex-row gap-3 z-10">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-1/3 border border-white/20 text-gray-300 hover:text-white font-nav text-xs tracking-[2px] uppercase py-3.5 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-2/3 bg-amber-400 hover:bg-amber-300 text-black font-nav text-xs tracking-[2px] uppercase py-3.5 font-bold transition duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Submitting Receipt & Order...</span>
                ) : (
                  <>
                    <span>Submit Order (NPR {totalAmount.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* LIGHTBOX FOR BANK QR CODE */}
      {isQrLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsQrLightboxOpen(false)}
        >
          <div
            className="relative bg-white p-6 rounded-md shadow-2xl max-w-sm w-full text-center border-4 border-amber-500"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQrLightboxOpen(false)}
              className="absolute top-2 right-2 text-black hover:text-red-600 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h4 className="font-heading text-lg font-bold text-black uppercase mb-2">
              Kaalo Ink Official Bank QR
            </h4>
            <p className="font-nav text-xs text-gray-600 mb-4 uppercase">
              Scan with Fonepay / Any Mobile Banking App
            </p>

            <img
              src="/images/QR_kaalo.png"
              alt="Kaalo Ink Official Bank QR Code Lightbox"
              className="w-72 h-72 object-contain mx-auto border border-gray-300 rounded"
            />

            <button
              onClick={() => setIsQrLightboxOpen(false)}
              className="mt-4 bg-black text-white font-nav text-xs uppercase px-6 py-2.5 font-bold hover:bg-gray-800 transition"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
