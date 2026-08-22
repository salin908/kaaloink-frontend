import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Calendar } from 'lucide-react';

export default function Navbar({ cartCount, onOpenCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Artists', path: '/artists' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Classes', path: '/classes' },
    { name: 'Shop', path: '/shop' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="h-20 sm:h-24 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="group flex items-center focus:outline-none shrink-0 pr-4 -ml-3 sm:-ml-6" aria-label="Kaalo Ink Home">
            <img
              src="/images/logo.png"
              alt="Kaalo Ink Logo"
              className="h-16 sm:h-20 max-h-full w-auto object-contain scale-110 sm:scale-120 origin-left group-hover:scale-125 transition-transform duration-300 drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation Links (Visible on 1024px+ screens) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
            <ul className="flex items-center gap-6 xl:gap-10 uppercase tracking-[3px] xl:tracking-[4px] text-xs xl:text-sm font-nav">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`relative py-1 transition duration-300 ${
                        active ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {link.name}
                      <span
                        className={`absolute left-0 -bottom-1 h-[1px] bg-white transition-all duration-300 ${
                          active ? 'w-full' : 'w-0 hover:w-full'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Action Buttons: Cart, Book Now */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Cart Icon Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-gray-300 hover:text-white transition focus:outline-none"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black font-nav text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Book Now Button */}
            <Link
              to="/booking"
              className="hidden lg:inline-flex items-center gap-2 border border-white px-5 xl:px-6 py-2.5 uppercase tracking-[2px] xl:tracking-[3px] font-nav text-xs transition duration-300 hover:bg-white hover:text-black font-medium"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Now</span>
            </Link>

            {/* Mobile Hamburger Toggle Button (Visible under 1024px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu (Visible under 1024px for iPad Mini, iPad Air, Mobile) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bg-black/95 border-b border-white/10 backdrop-blur-xl px-6 py-8 transition-all duration-300">
          <nav className="flex flex-col space-y-6">
            <ul className="space-y-4 uppercase tracking-[4px] font-nav text-sm text-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 ${
                      isActive(link.path) ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center border border-white py-3 uppercase tracking-[3px] font-nav text-xs bg-white text-black font-semibold block"
            >
              Book Appointment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
