import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { artistsData as fallbackArtists } from '../data/artistsData';
import { API_BASE_URL, getImageUrl } from '../config/api';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function ArtistsPage() {
  const [artists, setArtists] = useState(fallbackArtists);

  useEffect(() => {
    fetch(`${API_BASE_URL}/artists`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setArtists(data);
      })
      .catch(err => console.log('Using fallback artists data:', err));
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white font-body pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="uppercase tracking-[8px] text-gray-400 text-xs sm:text-sm mb-3">
            Resident Tattoo Artists
          </p>
          <h1 className="font-heading text-4xl sm:text-7xl tracking-[4px] font-semibold mb-6">
            OUR ARTISTS
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed tracking-[2px] font-body">
            Each resident artist at Kaalo Ink brings a distinct style, from traditional oriental and bold blackwork to micro realism and delicate fine line pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {artists.map((artist) => {
            const profileSrc = getImageUrl(artist.profileImage);
            return (
              <div
                key={artist.id}
                className="border border-white/15 hover:border-white/50 bg-black/60 backdrop-blur-sm transition-all duration-300 group flex flex-col h-full"
              >
                <div className="aspect-[3/4] bg-neutral-900 overflow-hidden relative">
                  <Link to={`/artists/${artist.slug}`} className="block w-full h-full">
                    <img
                      src={profileSrc}
                      alt={artist.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                    />
                  </Link>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <p className="font-nav text-[10px] tracking-[3px] uppercase text-gray-400 mb-2">
                    {artist.title}
                  </p>
                  <h2 className="font-heading text-2xl tracking-[1px] mb-3 text-white">
                    {artist.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                    {artist.bio ? artist.bio.replace(/\s*—\s*/g, ', ') : ''}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <a
                      href={artist.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-white transition duration-300 flex items-center gap-1.5 font-nav text-xs"
                    >
                      <InstagramIcon className="w-4 h-4" />
                      <span>{artist.handle}</span>
                    </a>

                    <div className="flex gap-2">
                      <Link
                        to={`/artists/${artist.slug}`}
                        className="font-nav text-[11px] tracking-[2px] uppercase border border-white/40 px-3.5 py-1.5 hover:bg-white hover:text-black transition duration-300 font-medium"
                      >
                        Bio & Work
                      </Link>
                      <Link
                        to={`/booking?artist=${encodeURIComponent(artist.name)}`}
                        className="font-nav text-[11px] tracking-[2px] uppercase border border-white/40 px-3.5 py-1.5 hover:bg-white hover:text-black transition duration-300 font-medium flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Book</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
