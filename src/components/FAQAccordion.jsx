import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Do I need to book an appointment?",
      a: "Yes, we recommend booking an appointment in advance to secure your preferred date and artist. Walk-ins are welcome when availability permits."
    },
    {
      q: "How much does a tattoo cost?",
      a: "The price depends on the tattoo's size, design, placement, and level of detail. Share your idea with us via the booking form, and we'll provide a personalized quote during the consultation."
    },
    {
      q: "Does getting a tattoo hurt?",
      a: "Everyone experiences pain differently, but most people describe it as a mild to moderate stinging or scratching sensation. Our artists work carefully to make the experience as comfortable as possible."
    },
    {
      q: "How should I take care of my new tattoo?",
      a: "Keep your tattoo clean, moisturized, and protected from direct sunlight. Avoid swimming, excessive sweating, and scratching while it heals. We provide detailed aftercare instructions and ointment after your session."
    },
    {
      q: "Can I bring my own tattoo design?",
      a: "Absolutely! You can bring your own design, reference images, or sketch ideas. Our artists can tattoo your design as is or customize it to create a unique piece."
    },
    {
      q: "How long does a tattoo take?",
      a: "The time varies depending on the tattoo's size and complexity. Small tattoos may take 30–60 minutes, while larger or more detailed pieces can require several hours or multiple sessions."
    },
    {
      q: "How do I prepare for my tattoo appointment?",
      a: "Get a good night's sleep, eat a healthy meal before your appointment, and stay hydrated. Avoid alcohol or blood-thinning medications for at least 24 hours beforehand."
    },
    {
      q: "Can I get a tattoo if I have sensitive skin?",
      a: "Most people with sensitive skin can still get a tattoo, but it's important to let your artist know about any allergies or skin conditions beforehand."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16">
      <div className="text-center mb-12">
        <p className="uppercase tracking-[8px] text-gray-400 text-xs sm:text-sm mb-3">
          Got Questions?
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl tracking-[3px] font-semibold text-white">
          FREQUENTLY ASKED
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-white/15 hover:border-white/40 transition duration-300 bg-black/50 backdrop-blur-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between text-left p-5 sm:p-6 focus:outline-none"
              >
                <span className="font-heading text-base sm:text-lg tracking-[0.5px] pr-4 text-white">
                  {faq.q}
                </span>
                <span className="shrink-0 text-gray-400">
                  {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/10 text-gray-400 text-sm leading-relaxed font-body">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
