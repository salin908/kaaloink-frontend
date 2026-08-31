import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Calendar, MessageCircle, Upload, CheckCircle, Clock } from 'lucide-react';
import { artistsData } from '../data/artistsData';
import { API_BASE_URL } from '../config/api';
import SEO from '../components/SEO';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    service: 'New Tattoo',
    artist: 'Any Available',
    date: '',
    time: '',
    description: '',
  });

  useEffect(() => {
    const requestedArtist = searchParams.get('artist') || location.state?.artist;
    if (requestedArtist) {
      const matched = artistsData.find(a =>
        a.name.toLowerCase().includes(requestedArtist.toLowerCase()) ||
        requestedArtist.toLowerCase().includes(a.name.toLowerCase())
      );
      if (matched) {
        setFormData(prev => ({ ...prev, artist: matched.name }));
      } else {
        setFormData(prev => ({ ...prev, artist: requestedArtist }));
      }
    }
  }, [searchParams, location]);

  const [previewImage, setPreviewImage] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReferenceFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const generateWhatsAppUrl = () => {
    const text =
      `*NEW TATTOO BOOKING REQUEST*\n\n` +
      `*Name:* ${formData.firstName} ${formData.lastName}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Email:* ${formData.email}\n` +
      `*Service:* ${formData.service}\n` +
      `*Preferred Artist:* ${formData.artist}\n` +
      `*Date:* ${formData.date}\n` +
      `*Time:* ${formData.time}\n` +
      `*Tattoo Idea / Description:*\n${formData.description}\n\n` +
      `_Sent via Kaalo Ink Website_`;

    return `https://wa.me/9779716585794?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('phone', formData.phone);
    data.append('email', formData.email);
    data.append('service', formData.service);
    data.append('artist', formData.artist);
    data.append('preferredDate', formData.date);
    data.append('preferredTime', formData.time);
    data.append('description', formData.description);

    if (referenceFile) {
      data.append('referenceImage', referenceFile);
    } else {
      const fileInput = document.getElementById('reference-upload');
      if (fileInput && fileInput.files[0]) {
        data.append('referenceImage', fileInput.files[0]);
      }
    }

    try {
      await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        body: data
      });
    } catch (err) {
      console.log('Saved to local storage fallback:', err);
    }

    // Local storage fallback for seamless offline resilience
    const existingBookings = JSON.parse(localStorage.getItem('kaalo_bookings') || '[]');
    const newBooking = {
      id: `BK-${Date.now()}`,
      ...formData,
      status: 'Pending',
      createdAt: new Date().toLocaleString()
    };
    localStorage.setItem('kaalo_bookings', JSON.stringify([newBooking, ...existingBookings]));

    setSubmitted(true);

    // Open WhatsApp after brief delay
    setTimeout(() => {
      window.open(generateWhatsAppUrl(), '_blank');
    }, 600);
  };

  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const availableTimeSlots = [
    '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
    '08:00 PM', '08:30 PM', '09:00 PM'
  ];

  return (
    <div className="min-h-screen bg-transparent text-white font-body pt-32 pb-24">
      <SEO
        title="Book Tattoo Appointment"
        description="Book a custom tattoo consultation or appointment with resident masters at Kaalo Ink Tattoo Studio in Dharan, Nepal."
        path="/booking"
      />
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* HERO HEADER */}
        <div className="text-center mb-16">
          <p className="uppercase tracking-[8px] text-gray-400 text-xs sm:text-sm mb-3">
            Reserve Your Session
          </p>
          <h1 className="font-heading text-4xl sm:text-7xl tracking-[4px] font-semibold mb-6">
            BOOK APPOINTMENT
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 text-sm sm:text-base leading-relaxed tracking-[1px]">
            Fill out the consultation form below. Submitting will register your request in our database and open WhatsApp for instant slot confirmation.
          </p>
        </div>

        {/* BOOKING FORM */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="border border-white/15 bg-black/60 backdrop-blur-md p-8 sm:p-12 space-y-6 rounded-sm shadow-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sandesh"
                  className="w-full bg-black/50 border border-white/20 focus:border-white outline-none px-4 py-3 text-white placeholder-gray-600 transition duration-300"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Limbu"
                  className="w-full bg-black/50 border border-white/20 focus:border-white outline-none px-4 py-3 text-white placeholder-gray-600 transition duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="98XXXXXXXX"
                  className="w-full bg-black/50 border border-white/20 focus:border-white outline-none px-4 py-3 text-white placeholder-gray-600 transition duration-300"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@email.com"
                  className="w-full bg-black/50 border border-white/20 focus:border-white outline-none px-4 py-3 text-white placeholder-gray-600 transition duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="service" className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                  Service Preferred *
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/20 focus:border-white outline-none px-4 py-3 text-white transition duration-300 h-[48px] min-h-[48px] text-xs sm:text-sm rounded-none appearance-none cursor-pointer"
                >
                  <option value="New Tattoo">New Custom Tattoo</option>
                  <option value="Cover Up">Tattoo Cover Up</option>
                  <option value="Touch Up">Tattoo Touch Up</option>
                  <option value="Consultation">Free Studio Consultation</option>
                </select>
              </div>

              <div>
                <label htmlFor="artist" className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                  Preferred Artist
                </label>
                <select
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/20 focus:border-white outline-none px-4 py-3 text-white transition duration-300 h-[48px] min-h-[48px] text-xs sm:text-sm rounded-none appearance-none cursor-pointer"
                >
                  <option value="Any Available">Any Available Artist</option>
                  {artistsData.map((artist) => (
                    <option key={artist.id} value={artist.name}>
                      {artist.name} ({artist.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2 h-5">
                  <label htmlFor="date" className="font-nav text-xs tracking-[2px] uppercase text-gray-300">
                    Preferred Date *
                  </label>
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  min={todayDateStr}
                  max={maxDateStr}
                  autoComplete="off"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/20 focus:border-white outline-none px-4 py-3 text-white transition duration-300 h-[48px] min-h-[48px] text-xs sm:text-sm rounded-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 h-5">
                  <label htmlFor="time" className="font-nav text-xs tracking-[2px] uppercase text-gray-300">
                    Preferred Time *
                  </label>
                  <span className="text-[10px] text-gray-400 font-nav tracking-[1px] uppercase hidden sm:inline-block">
                    10:00 AM – 9:00 PM
                  </span>
                </div>
                <select
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/20 focus:border-white outline-none px-4 py-3 text-white transition duration-300 h-[48px] min-h-[48px] text-xs sm:text-sm rounded-none appearance-none cursor-pointer"
                >
                  <option value="">Select Appointment Slot...</option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                Tattoo Idea / Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Specify tattoo concept, body placement (e.g. forearm, chest, leg), size (e.g. 5x5 inches), and preferred style..."
                className="w-full bg-black/50 border border-white/20 focus:border-white outline-none px-4 py-3 text-white placeholder-gray-600 transition duration-300 resize-none"
              />
            </div>

            <div>
              <label className="block font-nav text-xs tracking-[2px] uppercase text-gray-300 mb-2">
                Reference Image (Optional)
              </label>
              <div className="border border-dashed border-white/30 p-6 text-center bg-black/40 hover:border-white/60 transition cursor-pointer relative">
                <input
                  type="file"
                  id="reference-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 stroke-[1]" />
                <p className="font-nav text-xs uppercase tracking-[1px] text-gray-300">
                  Click or drag photo here to preview
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Supports PNG, JPG, WEBP reference sketches
                </p>
              </div>

              {previewImage && (
                <div className="mt-4 flex items-center gap-4 border border-white/20 p-2 bg-black">
                  <img src={previewImage} alt="Reference preview" className="w-16 h-16 object-cover border border-white/10" />
                  <span className="font-nav text-xs text-emerald-400">Reference Image Attached</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full font-nav text-sm tracking-[3px] uppercase border border-white bg-white text-black py-4 hover:bg-gray-200 transition duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Submit Booking & Open WhatsApp</span>
            </button>

            <p className="text-center text-xs text-gray-500 tracking-[1px] font-nav">
              Submitting sends your session details to the studio dashboard and pre-fills WhatsApp for instant confirmation.
            </p>
          </form>
        ) : (
          <div className="border border-white/20 bg-zinc-950 p-8 sm:p-12 text-center rounded-sm space-y-6">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto stroke-[1.5]" />
            <h2 className="font-heading text-3xl tracking-[3px] font-bold text-white uppercase">
              Booking Request Received!
            </h2>
            <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
              Your appointment request has been logged on the studio dashboard. WhatsApp has opened in a new tab so you can chat directly with our studio team.
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-nav text-xs tracking-[2px] uppercase px-6 py-3 font-semibold inline-flex items-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Re-open WhatsApp Chat</span>
              </a>

              <button
                onClick={() => setSubmitted(false)}
                className="border border-white/40 text-gray-300 hover:text-white font-nav text-xs tracking-[2px] uppercase px-6 py-3 font-medium transition"
              >
                New Booking Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
