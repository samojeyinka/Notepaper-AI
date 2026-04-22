import React, { useState } from 'react';
import { apiClient } from '../../api/apiClient';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient('/public/contact', { method: 'POST', body: formData });
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-primary/20 opacity-80 shadow-sm rotate-1 flex items-center justify-center overflow-hidden">
          <div className="w-full h-px bg-white/20"></div>
        </div>
        <div className="bg-white paper-shadow p-12 md:p-16 rounded-sm lined-paper relative flex flex-col items-center justify-center gap-6 min-h-[320px] text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-500 text-[32px]">check_circle</span>
          </div>
          <div>
            <h3 className="font-serif-elegant text-2xl text-slate-800 mb-2">Message Sent!</h3>
            <p className="text-slate-400 text-[15px]">Thanks for reaching out. We'll get back to you shortly.</p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-primary text-[13px] font-medium underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Tape decoration at top */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-primary/20 opacity-80 shadow-sm rotate-1 flex items-center justify-center overflow-hidden">
        <div className="w-full h-px bg-white/20"></div>
      </div>

      {/* Form Card */}
      <div className="bg-white paper-shadow p-12 md:p-16 rounded-sm lined-paper relative">
        <form className="space-y-12 relative z-10" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="relative">
            <label className="block text-slate-400 font-serif-elegant font-semibold md:font-bold text-[15px] md:text-lg mb-1" htmlFor="name">
              Name
            </label>
            <input
              className="w-full bg-transparent border-0 border-b border-transparent focus:ring-0 focus:border-primary font-handwritten md:text-2xl text-slate-800 p-0 placeholder-slate-200 transition-colors"
              id="name"
              placeholder="Your name here..."
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              style={{ outline: 'none' }}
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <label className="block text-slate-400 font-serif-elegant font-semibold md:font-bold text-[15px] md:text-lg mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full bg-transparent border-0 border-b border-transparent focus:ring-0 focus:border-primary font-handwritten md:text-2xl text-slate-800 p-0 placeholder-slate-200 transition-colors"
              id="email"
              placeholder="email@example.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              style={{ outline: 'none' }}
            />
          </div>

          {/* Message Field */}
          <div className="relative">
            <label className="block text-slate-400 font-serif-elegant font-semibold md:font-bold text-[15px] md:text-lg mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              className="w-full bg-transparent border-0 border-b border-transparent focus:ring-0 focus:border-primary font-handwritten md:text-2xl text-slate-800 p-0 placeholder-slate-200 resize-none transition-colors"
              id="message"
              placeholder="What's on your mind?"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={loading}
              style={{ outline: 'none' }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-[13px] -mt-6">{error}</p>
          )}

          {/* Submit Button with Arrow */}
          <div className="pt-8 flex items-center gap-8">
            <button
              className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-medium md:font-bold py-2.5 px-6 md:py-5 md:px-12 rounded-md md:rounded-lg text-[15px] md:text-xl paper-shadow transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-icons-round text-[18px] animate-spin">sync</span>
                  Sending…
                </>
              ) : (
                <>
                  Send Message
                  <span className="material-symbols-outlined">send</span>
                </>
              )}
            </button>

            {/* Arrow annotation */}
            <div className="hidden md:flex flex-col items-start relative">
              <svg
                className="sketchy-arrow text-slate-400 w-16 h-12 -scale-x-100 rotate-[120deg] absolute -top-8 -left-4"
                fill="none"
                viewBox="0 0 100 60"
              >
                <path
                  d="M10,10 Q50,50 90,40"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                ></path>
                <path
                  d="M80,35 L90,40 L85,52"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span className="font-sketch text-accent-green text-xl mt-4">We reply fast!</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}