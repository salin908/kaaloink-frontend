import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="backdrop-blur border-t border-white/10 text-white font-body relative z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Explore */}
          <div>
            <h3 className="font-nav text-xs sm:text-sm tracking-[4px] uppercase mb-6 font-medium text-gray-200">
              Explore
            </h3>
            <ul className="space-y-3 text-gray-400 font-nav text-xs sm:text-sm tracking-[3px] uppercase">
              <li>
                <Link to="/" className="hover:text-white transition duration-300">Home</Link>
              </li>
              <li>
                <Link to="/artists" className="hover:text-white transition duration-300">Artists</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition duration-300">Gallery</Link>
              </li>
              <li>
                <Link to="/classes" className="hover:text-white transition duration-300">Classes</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition duration-300">Shop</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-nav text-xs sm:text-sm tracking-[4px] uppercase mb-6 font-medium text-gray-200">
              Contact Us
            </h3>
            <ul className="space-y-3 text-gray-400 font-nav text-xs sm:text-sm tracking-[2px] uppercase">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Dharan, Nepal</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-1">
                  <span>9716585794</span>
                  <span>9810444548</span>
                  <span>9822531634</span>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span>kaaloink@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-1">
                  <a
                    href="https://wa.me/9779716585794"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition duration-300 text-green-400"
                  >
                    WhatsApp: 9716585794
                  </a>
                  <a
                    href="https://wa.me/9779810444548"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition duration-300 text-green-400"
                  >
                    WhatsApp: 9810444548
                  </a>
                  <a
                    href="https://wa.me/9779822531634"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition duration-300 text-green-400"
                  >
                    WhatsApp: 9822531634
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="font-nav text-xs sm:text-sm tracking-[4px] uppercase mb-6 font-medium text-gray-200">
              Opening Hours
            </h3>
            <ul className="space-y-3 text-gray-400 font-nav text-xs sm:text-sm tracking-[2px] uppercase">
              <li>
                <span className="text-white font-medium">Mon, Wed – Sun</span>
                <br />
                <span className="text-gray-400 text-xs">10:00 AM – 9:00 PM</span>
              </li>
              <li>
                <span className="text-white font-medium">Tuesday</span>
                <br />
                <span className="text-red-400 text-xs font-semibold">Closed</span>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-nav text-xs sm:text-sm tracking-[4px] uppercase mb-6 font-medium text-gray-200">
              Follow Studio
            </h3>
            <ul className="space-y-3 text-gray-400 font-nav text-xs sm:text-sm tracking-[3px] uppercase">
              <li>
                <a
                  href="https://www.instagram.com/_kaalo.ink/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition duration-300 flex items-center gap-2"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61586935546978"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition duration-300"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="http://www.tiktok.com/@kaalo.ink.tattoo"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition duration-300"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/9779716585794"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition duration-300 text-emerald-400 font-medium"
                >
                  WhatsApp Direct
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="group focus:outline-none -ml-3 sm:-ml-6" aria-label="Kaalo Ink Home">
            <img
              src="/images/logo.png"
              alt="Kaalo Ink Logo"
              className="h-16 sm:h-20 w-auto object-contain scale-110 sm:scale-120 origin-left group-hover:scale-125 transition-transform duration-300 drop-shadow-lg"
            />
          </Link>
          <p className="text-gray-500 font-nav text-[11px] tracking-[2px] uppercase text-center">
            © {new Date().getFullYear()} Kaalo Ink Tattoo Studio. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
