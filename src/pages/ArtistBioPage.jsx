import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { artistsData as fallbackArtists } from '../data/artistsData';
import LightboxModal from '../components/LightboxModal';
import { API_BASE_URL, getImageUrl } from '../config/api';

export default function ArtistBioPage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const raw = (slug || '').trim();
    const normalized = raw.toLowerCase().replace(/\s+/g, '-');
    const nameClean = raw.toLowerCase().replace(/-/g, ' ');

    const local = fallbackArtists.find((a) =>
      a.slug.toLowerCase() === normalized ||
      a.name.toLowerCase() === nameClean ||
      a.name.toLowerCase() === raw.toLowerCase()
    );
    setArtist(local || fallbackArtists[0]);

    fetch(`${API_BASE_URL}/artists/${encodeURIComponent(raw)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setArtist({
            ...data,
            portfolio: Array.isArray(data.portfolio) ? data.portfolio.map(p => ({
              id: p.id,
              title: p.title || 'Tattoo Work',
              caption: p.caption || '',
              image: getImageUrl(typeof p === 'string' ? p : (p.imageUrl || p.image_url || p.image || '')),
              isPinned: p.isPinned
            })) : []
          });
        }
      })
      .catch(err => console.log('Using fallback artist bio:', err));
  }, [slug]);

  if (!artist) {
    return (
      <div className="min-h-screen text-white font-body pt-36 pb-24 text-center">
        <h2 className="font-heading text-2xl font-bold uppercase mb-4">Artist Not Found</h2>
        <Link to="/artists" className="font-nav text-xs uppercase border border-white px-6 py-3 inline-block font-semibold">
          Back to All Artists
        </Link>
      </div>
    );
  }

  const profileSrc = getImageUrl(artist.profileImage);
  const portfolioList = artist.portfolio || [];
  const totalPages = Math.ceil(portfolioList.length / itemsPerPage);
  const paginatedPortfolio = portfolioList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-body pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Back button */}
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 font-nav text-xs uppercase tracking-[2px] text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Artists</span>
        </Link>

        {/* Artist Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20">
          <div className="lg:col-span-5 border border-white/20 bg-zinc-950 p-2 overflow-hidden">
            <img
              src={profileSrc}
              alt={artist.name}
              className="w-full h-auto aspect-[3/4] object-cover"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <p className="font-nav text-xs tracking-[4px] uppercase text-gray-400">
              Resident Artist Profile
            </p>
            <h1 className="font-heading text-4xl sm:text-6xl tracking-[3px] font-bold text-white">
              {artist.name}
            </h1>
            <p className="font-nav text-xs sm:text-sm tracking-[3px] uppercase text-gray-300 border-l-2 border-white pl-4">
              {artist.title}
            </p>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-body">
              {(artist.longBio || artist.bio || '').replace(/\s*—\s*/g, ', ')}
            </p>

            <div className="flex flex-wrap gap-4 pt-4 font-nav text-xs uppercase tracking-[2px]">
              <a
                href={artist.instagram}
                target="_blank"
                rel="noreferrer"
                className="border border-white/30 hover:border-white px-5 py-3 flex items-center gap-2 transition text-gray-200"
              >
                <Camera className="w-4 h-4" />
                <span>{artist.handle || `@${(artist.name || '').toLowerCase().replace(/\s+/g, '')}`}</span>
              </a>

              <Link
                to={`/booking?artist=${encodeURIComponent(artist.name || '')}`}
                className="border border-white bg-white text-black font-semibold px-6 py-3 hover:bg-gray-200 transition flex items-center gap-2"
              >
                <span>Book Appointment with {(artist.name || 'Artist').split(' ')[0]}</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Portfolio Showcase Grid */}
        <div className="border-t border-white/10 pt-16">
          <div className="mb-10 text-center">
            <p className="uppercase tracking-[8px] text-gray-400 text-xs mb-2">
              Portfolio
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl tracking-[3px] font-bold text-white">
              SELECTED TATTOO WORKS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPortfolio.map((work, idx) => {
              const workImg = getImageUrl(typeof work === 'string' ? work : (work.image || work.imageUrl || work.image_url || ''));
              return (
                <div
                  key={work.id || idx}
                  onClick={() => setSelectedImage({
                    title: work.title || `${artist.name || 'Artist'} Tattoo Work`,
                    caption: work.caption || `Custom tattoo artwork by ${artist.name || 'Artist'} at Kaalo Ink Studio.`,
                    image: workImg
                  })}
                  className="group border border-white/15 hover:border-white/50 bg-black/60 overflow-hidden relative cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={workImg}
                      alt={work.title || artist.name || 'Tattoo Work'}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                    />
                  {work.isPinned && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-black font-nav text-[10px] font-bold px-2.5 py-1 rounded-xs tracking-[1.5px] uppercase shadow-lg z-10">
                      📌 Featured Work
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 p-6 flex flex-col justify-end">
                  <p className="font-heading text-base font-bold tracking-[1px] text-white">
                    {work.title}
                  </p>
                  <p className="font-nav text-[10px] tracking-[2px] uppercase text-gray-300 mt-1">
                    Click to view details
                  </p>
                </div>
              </div>
            );
          })}
          </div>

          {/* PORTFOLIO PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/15 font-nav text-xs uppercase tracking-[2px]">
              <p className="text-gray-400">
                Showing Page <span className="text-white font-bold">{currentPage}</span> of{' '}
                <span className="text-white font-bold">{totalPages}</span> ({portfolioList.length} portfolio works)
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
      </div>

      <LightboxModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage?.image}
        title={selectedImage?.title}
        artist={artist}
      />
    </div>
  );
}
