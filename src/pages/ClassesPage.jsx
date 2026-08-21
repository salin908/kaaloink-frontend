import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../config/api';

const basicFeatures = [
  'Machine & equipment setup',
  'Hygiene & sanitation',
  'Sketching & stencil fundamentals',
  'Line work & basic shading',
  'Tattoo placement & aftercare',
  'Small tattoo practice & execution'
];

const advancedFeatures = [
  'Advanced shading & line work',
  'High-level sketching & custom designs',
  'Realism & detailed blackwork',
  'Large-scale tattoo composition',
  'Cover-ups & correction techniques',
  'Client consultation & studio operations'
];

const fallbackCourses = [
  {
    id: 1,
    slug: 'basic',
    title: 'Basic Tattoo Course',
    duration: '3 Months · 2 Hrs/Day',
    price: 'NPR 15,000',
    image: '/images/basic.jpg',
    features: basicFeatures
  },
  {
    id: 2,
    slug: 'advanced',
    title: 'Advanced Masterclass',
    duration: '6 Months · 2 Hrs/Day',
    price: 'NPR 35,000',
    image: '/images/advanced.jpg',
    features: advancedFeatures
  }
];

export default function ClassesPage() {
  const [courses, setCourses] = useState(fallbackCourses);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: ''
  });
  const [enrollSubmitted, setEnrollSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/courses`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map(c => {
            const isBasic = c.slug === 'basic' || c.title.toLowerCase().includes('basic');
            return {
              ...c,
              title: isBasic ? 'Basic Tattoo Course' : 'Advanced Masterclass',
              features: isBasic ? basicFeatures : advancedFeatures
            };
          });
          setCourses(enriched);
        }
      })
      .catch(err => console.log('Using local fallback courses:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const enrollParam = params.get('enroll');
    if (enrollParam && courses.length > 0) {
      const match = courses.find(c => c.slug === enrollParam || c.title.toLowerCase().includes(enrollParam.toLowerCase())) || courses[0];
      if (match) {
        setSelectedCourse(match);
      }
    }
  }, [courses]);

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API_BASE_URL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: enrollForm.fullName,
          phone: enrollForm.phone,
          email: enrollForm.email,
          courseTitle: selectedCourse.title,
          message: enrollForm.message
        })
      });
    } catch (err) {
      console.log('Saved to local storage fallback:', err);
    }

    const existingEnrollments = JSON.parse(localStorage.getItem('kaalo_enrollments') || '[]');
    localStorage.setItem('kaalo_enrollments', JSON.stringify([
      ...existingEnrollments,
      {
        id: Date.now(),
        ...enrollForm,
        courseTitle: selectedCourse.title,
        date: new Date().toLocaleDateString()
      }
    ]));

    setEnrollSubmitted(true);
    setEnrollForm({ fullName: '', phone: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-body pt-32 pb-24">
      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-8 mb-20 text-center">
        <p className="uppercase tracking-[8px] text-gray-400 text-sm mb-3 font-nav">
          Kaalo Ink Academy
        </p>

        <h1 className="font-heading text-5xl sm:text-7xl tracking-[4px] font-semibold mb-6">
          TATTOO ACADEMY CLASSES
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed tracking-[1.5px] font-body">
          Learn tattoo artistry from practicing studio professionals in Dharan. Hands on machine practice, hygiene standards, and career guidance.
        </p>
      </div>

      {/* COURSE CARDS GRID */}
      <div className="max-w-6xl mx-auto px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {courses.map((course) => {
            const imgSrc = getImageUrl(course.imageUrl || course.image);

            return (
              <div
                key={course.id}
                className="border border-white/15 hover:border-white/50 bg-black/60 backdrop-blur-sm transition-all duration-400 ease-out group flex flex-col justify-between overflow-hidden rounded-none hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
              >
                <div className="aspect-square overflow-hidden relative w-full bg-black/60 border-b border-white/[0.08]">
                  <img
                    src={imgSrc}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 block"
                  />
                </div>

                <div className="bg-transparent p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="font-nav text-[9px] font-medium tracking-[2.5px] uppercase text-gray-500 block mb-2">
                      {course.duration}
                    </span>

                    <h3 className="font-heading text-xl sm:text-2xl font-semibold text-white tracking-[0.5px] uppercase mb-3 group-hover:text-amber-100/90 transition-colors duration-300">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed font-body">
                        {course.description}
                      </p>
                    )}

                    {Array.isArray(course.features) && course.features.length > 0 && (
                      <ul className="text-xs text-gray-300 leading-relaxed mb-6 space-y-2 font-body">
                        {course.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e6d8c3] shrink-0"></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] gap-4">
                    <div>
                      <span className="font-nav text-[9px] font-medium tracking-[2.5px] text-gray-500 uppercase block mb-0.5">Course Fee</span>
                      <span className="font-nav text-base sm:text-lg font-bold tracking-[0.5px] text-[#e6d8c3]">
                        {course.price}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setEnrollSubmitted(false);
                      }}
                      className="font-nav text-xs tracking-[2px] uppercase px-5 py-2.5 font-semibold transition-all duration-300 border border-white/30 bg-transparent text-white hover:bg-white hover:text-black hover:border-white rounded-none cursor-pointer"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHAT'S INCLUDED SECTION */}
      <div className="max-w-4xl mx-auto px-8 pb-28 text-center">
        <h3 className="font-heading text-3xl sm:text-4xl tracking-[2px] mb-8 font-semibold text-white">
          What's Included
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 font-nav text-sm tracking-[2px] uppercase text-gray-400">
          <div>
            <p className="text-white mb-2 font-bold">Equipment</p>
            <p className="text-xs text-gray-400">Machines & supplies provided during class</p>
          </div>

          <div>
            <p className="text-white mb-2 font-bold">Certificate</p>
            <p className="text-xs text-gray-400">Official Kaalo Ink completion certificate</p>
          </div>

          <div>
            <p className="text-white mb-2 font-bold">Mentorship</p>
            <p className="text-xs text-gray-400">Direct feedback from resident artists</p>
          </div>
        </div>
      </div>

      {/* ENROLLMENT MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="border border-white/20 bg-zinc-950 max-w-lg w-full p-6 sm:p-8 relative my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 z-20 p-2 text-gray-300 hover:text-white bg-black/60 border border-white/20 hover:border-white transition-all rounded-full"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            {enrollSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto stroke-[1.5]" />
                <h3 className="font-heading text-2xl tracking-[2px] font-bold text-white uppercase">
                  Enrollment Request Sent
                </h3>
                <p className="text-sm text-gray-300 font-body leading-relaxed">
                  Thank you for applying for the <span className="text-white font-semibold">{selectedCourse.title}</span> class. Our studio manager will call you at your phone number to confirm your schedule.
                </p>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="font-nav text-xs tracking-[2px] uppercase border border-white px-6 py-3 hover:bg-white hover:text-black transition duration-300 font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="font-nav text-xs tracking-[3px] uppercase text-gray-400 mb-1">
                    Class Application
                  </p>
                  <h3 className="font-heading text-2xl tracking-[2px] font-bold text-white uppercase">
                    Enroll: {selectedCourse.title}
                  </h3>
                  <p className="font-nav text-xs text-gray-300 mt-1">
                    {selectedCourse.duration} · {selectedCourse.price}
                  </p>
                </div>

                <form onSubmit={handleEnrollSubmit} className="space-y-4 font-nav text-xs">
                  <div>
                    <label className="block tracking-[1px] uppercase text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sujan Shrestha"
                      value={enrollForm.fullName}
                      onChange={(e) => setEnrollForm({ ...enrollForm, fullName: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 px-4 py-3 text-sm text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block tracking-[1px] uppercase text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98xxxxxxx"
                      value={enrollForm.phone}
                      onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 px-4 py-3 text-sm text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block tracking-[1px] uppercase text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@gmail.com"
                      value={enrollForm.email}
                      onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 px-4 py-3 text-sm text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block tracking-[1px] uppercase text-gray-300 mb-1">
                      Prior Sketching / Tattoo Experience (Optional)
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Tell us about your background in art or sketching..."
                      value={enrollForm.message}
                      onChange={(e) => setEnrollForm({ ...enrollForm, message: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 p-3 text-sm text-white outline-none focus:border-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white text-black font-nav text-xs tracking-[3px] uppercase py-3.5 font-semibold hover:bg-gray-200 transition duration-300"
                  >
                    Submit Application
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
