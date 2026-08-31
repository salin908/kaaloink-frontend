import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Phone, MessageCircle } from 'lucide-react';
import { artistsData as fallbackArtists } from '../data/artistsData';
import { galleryData as fallbackGallery } from '../data/galleryData';
import FAQAccordion from '../components/FAQAccordion';
import LightboxModal from '../components/LightboxModal';
import SEO from '../components/SEO';
import { API_BASE_URL, getImageUrl } from '../config/api';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function HomePage() {
  const [artists, setArtists] = useState(fallbackArtists);
  const [gallery, setGallery] = useState(fallbackGallery);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/artists`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setArtists(data);
        }
      })
      .catch(err => console.log('Using local fallback artists:', err));

    fetch(`${API_BASE_URL}/gallery`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGallery(data);
        }
      })
      .catch(err => console.log('Using local fallback gallery:', err));
  }, []);

  return (
    <div className="min-h-screen text-white font-body bg-transparent">
      <SEO
        title="Custom Tattoo Art & Academy"
        description="Kaalo Ink is a premier custom tattoo studio and academy located in Dharan, Nepal. Specializing in Japanese traditional, oriental, fine line, dark surrealism tattoos, and professional training."
        path="/"
      />
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="text-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6 animate-sentence animate-sentence-delay-1">
            <img src="/images/logo.png" alt="Kaalo Ink Emblem" className="w-10 sm:w-12 h-10 sm:h-12 object-contain opacity-90 drop-shadow-lg" />
            <p className="uppercase tracking-[8px] text-gray-300 text-xs sm:text-sm font-nav">
              Tattoo Studio • Dharan, Nepal
            </p>
          </div>

          <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl leading-tight tracking-[4px] font-semibold mb-8 animate-sentence animate-sentence-delay-2 gold-text-shimmer">
            WHERE ART
            <br />
            MEETS SKIN
          </h1>

          <p className="max-w-2xl mx-auto text-gray-200 text-base sm:text-lg leading-8 tracking-[5px] font-body mb-12 animate-sentence animate-sentence-delay-3">
            Transform your ideas into timeless tattoos crafted by experienced artists in a professional and hygienic studio.
          </p>

          <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap font-nav text-xs sm:text-sm uppercase tracking-[3px] animate-sentence animate-sentence-delay-4">
            <Link
              to="/booking"
              className="w-full sm:w-auto px-8 py-4 border border-white bg-black/40 hover:bg-white hover:text-black text-white font-semibold transition duration-300 text-center min-w-[210px]"
            >
              Book Appointment
            </Link>

            <Link
              to="/gallery"
              className="w-full sm:w-auto px-8 py-4 border border-white bg-black/40 hover:bg-white hover:text-black text-white font-semibold transition duration-300 text-center min-w-[210px]"
            >
              Explore Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STUDIO HIGHLIGHTS (Seamless Overlay) */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-white/15 bg-black/60 backdrop-blur-sm text-center group hover:border-white/50 hover:scale-105 transition-all duration-300 transform">
              <ShieldCheck className="w-10 h-10 text-white mx-auto mb-4 stroke-[1.2]" />
              <h3 className="font-heading text-lg tracking-[2px] mb-2 uppercase text-white font-bold">
                100% Sterile & Hygienic
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Hospital grade sterilization, single use disposable cartridges, and premium organic inks for optimal healing.
              </p>
            </div>

            <div className="p-8 border border-white/15 bg-black/60 backdrop-blur-sm text-center group hover:border-white/50 hover:scale-105 transition-all duration-300 transform">
              <Sparkles className="w-10 h-10 text-white mx-auto mb-4 stroke-[1.2]" />
              <h3 className="font-heading text-lg tracking-[2px] mb-2 uppercase text-white font-bold">
                Freehand & Custom Art
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Specialists in freehand Japanese traditional, oriental, blackwork, dark surrealism, and delicate fine line needlework.
              </p>
            </div>

            <div className="p-8 border border-white/15 bg-black/60 backdrop-blur-sm text-center group hover:border-white/50 hover:scale-105 transition-all duration-300 transform">
              <HeartHandshake className="w-10 h-10 text-white mx-auto mb-4 stroke-[1.2]" />
              <h3 className="font-heading text-lg tracking-[2px] mb-2 uppercase text-white font-bold">
                Personalized Consultations
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Work directly with resident artists to design custom pieces tailored perfectly to your body anatomy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RESIDENT ARTISTS SECTION (DYNAMIC FROM API) */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 bg-transparent">
        <div className="text-center mb-16">
          <p className="uppercase tracking-[8px] text-gray-300 text-xs sm:text-sm mb-3">
            Meet The Masters
          </p>
          <h2 className="font-heading text-4xl sm:text-6xl tracking-[4px] font-semibold text-white">
            OUR RESIDENT ARTISTS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => {
            const profileSrc = getImageUrl(artist.profileImage);

            return (
              <div
                key={artist.id}
                className="border border-white/15 hover:border-white/50 bg-black/60 backdrop-blur-sm transition-all duration-300 group flex flex-col h-full overflow-hidden"
              >
                <div className="aspect-[3/4] bg-neutral-950 overflow-hidden relative">
                  <Link to={`/artists/${artist.slug}`} className="block w-full h-full">
                    <img
                      src={profileSrc}
                      alt={artist.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                    />
                  </Link>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <p className="font-nav text-[10px] tracking-[3px] uppercase text-gray-400 mb-2">
                    {artist.title}
                  </p>
                  <h3 className="font-heading text-2xl tracking-[1px] mb-3 text-white font-bold">
                    {artist.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                    {artist.bio ? artist.bio.replace(/\s*—\s*/g, ', ') : ''}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <a
                        href={artist.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-white transition duration-300 flex items-center gap-1.5 font-nav text-xs truncate max-w-full"
                        aria-label={`${artist.name} Instagram`}
                      >
                        <InstagramIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{artist.handle || `@${artist.name.toLowerCase().replace(/\s+/g, '')}`}</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/artists/${artist.slug}`}
                        className="font-nav text-[10px] sm:text-[11px] tracking-[1.5px] uppercase border border-white/40 py-2.5 px-1 text-center hover:bg-white hover:text-black transition duration-300 font-medium block truncate"
                      >
                        Bio
                      </Link>
                      <Link
                        to="/booking"
                        className="font-nav text-[10px] sm:text-[11px] tracking-[1.5px] uppercase border border-white/40 py-2.5 px-1 text-center hover:bg-white hover:text-black transition duration-300 font-medium block truncate"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CUSTOM WALL PAINTINGS & MURALS SECTION */}
      <section className="py-20 bg-transparent border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="border border-white/20 bg-black/70 backdrop-blur-md p-8 sm:p-14 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="font-nav text-xs tracking-[4px] uppercase text-[#e6d8c3] font-semibold block">
                  Studio Artistry Services • Murals & Interior Artwork
                </span>

                <h2 className="font-heading text-3xl sm:text-5xl font-semibold tracking-[3px] text-white">
                  WE ARE AVAILABLE FOR WALL PAINTINGS
                </h2>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-body max-w-2xl">
                  Transform your commercial establishment, studio, café, or private space with custom wall paintings and large-scale murals by Kaalo Ink artists. Contact us directly on any of our studio phone lines:
                </p>

                <div className="flex flex-wrap items-center gap-3 font-nav text-xs uppercase tracking-[2px]">
                  <div className="border border-white/30 px-4 py-2.5 bg-black/50 text-white font-semibold flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>9716585794</span>
                  </div>

                  <div className="border border-white/30 px-4 py-2.5 bg-black/50 text-white font-semibold flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>9810444548</span>
                  </div>

                  <div className="border border-white/30 px-4 py-2.5 bg-black/50 text-white font-semibold flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>9822531634</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 border border-white/15 bg-zinc-950/90 text-center space-y-4">
                <p className="font-heading text-lg font-bold tracking-[2px] uppercase text-white">
                  Custom Wall Painting Inquiry
                </p>
                <p className="text-xs text-gray-400 font-body leading-relaxed">
                  Send us your wall dimensions, concept ideas, or photo of the space directly on WhatsApp to get a quote.
                </p>
                <a
                  href="https://wa.me/9779716585794"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 font-nav text-xs tracking-[2px] uppercase font-bold hover:bg-emerald-500 hover:text-black transition duration-300 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SELECTED TATTOO WORKS GALLERY (DYNAMIC FROM API) */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="uppercase tracking-[8px] text-gray-300 text-xs sm:text-sm mb-3">
                Selected Works
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl tracking-[4px] font-semibold text-white">
                KAALO INK IN MOTION
              </h2>
            </div>

            <Link
              to="/gallery"
              className="border border-white/40 px-6 py-3 uppercase tracking-[3px] font-nav text-xs hover:border-white transition duration-300 flex items-center gap-2"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.slice(0, 6).map((item) => {
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
                      <p className="font-nav text-[10px] tracking-[3px] uppercase text-gray-400">
                        {item.category}
                      </p>
                    )}
                    <h4 className="font-heading text-lg font-bold tracking-[1px] text-white">
                      {item.title}
                    </h4>
                    {item.caption && (
                      <p className="text-xs text-gray-300 mt-1 font-body">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. STUDIO CRAFTSMANSHIP & PROCESS TIMELINE */}
      <section className="py-24 bg-transparent border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="uppercase tracking-[8px] text-gray-400 text-xs sm:text-sm mb-3 font-nav">
              The Tattoo Journey
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl tracking-[4px] font-semibold text-white mb-6">
              FROM CONCEPT TO HEALED INK
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed tracking-[1px] font-body">
              Every piece crafted at Kaalo Ink follows a rigorous three-phase studio process to ensure absolute aesthetic perfection and seamless healing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="border border-white/15 bg-black/60 backdrop-blur-sm p-8 text-left relative group hover:border-white/50 transition duration-300">
              <span className="font-heading text-5xl text-white/20 font-bold block mb-4 group-hover:text-white/40 transition">01</span>
              <h3 className="font-heading text-xl tracking-[2px] font-bold text-white mb-3 uppercase">
                Consultation & Freehand Design
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-body">
                Collaborate directly with our resident masters. We sketch freehand motifs directly onto your skin to harmonize with your body anatomy.
              </p>
            </div>

            <div className="border border-white/15 bg-black/60 backdrop-blur-sm p-8 text-left relative group hover:border-white/50 transition duration-300">
              <span className="font-heading text-5xl text-white/20 font-bold block mb-4 group-hover:text-white/40 transition">02</span>
              <h3 className="font-heading text-xl tracking-[2px] font-bold text-white mb-3 uppercase">
                Hospital Grade Sterilization
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-body">
                Executed in a medical-grade hygienic environment using single-use disposable needles, premium organic pigments, and gentle skin prep.
              </p>
            </div>

            <div className="border border-white/15 bg-black/60 backdrop-blur-sm p-8 text-left relative group hover:border-white/50 transition duration-300">
              <span className="font-heading text-5xl text-white/20 font-bold block mb-4 group-hover:text-white/40 transition">03</span>
              <h3 className="font-heading text-xl tracking-[2px] font-bold text-white mb-3 uppercase">
                Aftercare & Healing Support
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-body">
                Receive our natural studio soothing balm, detailed healing protocols, and continuous follow-up check-ins until your tattoo is 100% healed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. KAALO ACADEMY BANNER */}
      <section className="py-20 bg-transparent border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="border border-white/20 bg-black/70 backdrop-blur-md p-10 sm:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <span className="font-nav text-xs tracking-[4px] uppercase text-gray-400 block">
                Educational Program • Dharan, Nepal
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-semibold tracking-[3px] text-white">
                KAALO TATTOO ACADEMY
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-body">
                Master needle control, hygiene standards, dark artwork fundamentals, and freehand stenciling under the direct mentorship of resident artists.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto font-nav text-xs uppercase tracking-[2px]">
              <Link
                to="/classes"
                className="px-8 py-4 border border-white bg-white text-black font-semibold hover:bg-gray-200 transition text-center min-w-[200px]"
              >
                View Courses
              </Link>
              <Link
                to="/classes?enroll=basic"
                className="px-8 py-4 border border-white/40 bg-transparent text-white font-semibold hover:border-white transition text-center min-w-[200px]"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS SECTION */}
      <FAQAccordion />

      {/* LIGHTBOX MODAL */}
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
