import React, { useState } from 'react';
import Loader from '../globals/Loader';
import { apiClient } from '../../api/apiClient';

const inputCls =
  'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#e6eeea] focus:border-[#78958e] transition-colors';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      <div className="contact-form-panel bg-white border border-stone-200 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[380px]">
        <div className="w-12 h-12 rounded-full bg-[#edf3ef] text-[#45666c] flex items-center justify-center mb-6 text-xl">✓</div>
        <h3 className="text-2xl font-semibold text-stone-900 mb-2">
          Message sent
        </h3>
        <p className="text-stone-500 text-[15px] max-w-sm">
          Thanks for reaching out. We will get back to you shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 text-[14px] font-semibold text-[#45666c] underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="contact-form-panel bg-white border border-stone-200 p-6 sm:p-8 md:p-10 space-y-5"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-[13px] font-semibold text-stone-700 mb-2" htmlFor="name">
          Name
        </label>
        <input
          className={inputCls}
          id="name"
          placeholder="Your name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-[13px] font-semibold text-stone-700 mb-2" htmlFor="email">
          Email address
        </label>
        <input
          className={inputCls}
          id="email"
          placeholder="you@example.com"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-[13px] font-semibold text-stone-700 mb-2" htmlFor="message">
          Message
        </label>
        <textarea
          className={`${inputCls} resize-none min-h-[140px]`}
          id="message"
          placeholder="What is on your mind?"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-500 text-[13px]">{error}</p>}

      <button
        className="w-full rounded-xl py-3.5 bg-[#45666c] text-white text-[15px] font-semibold hover:bg-[#355358] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <Loader size="sm" />
        ) : (
          <>
            Send message
          </>
        )}
      </button>
    </form>
  );
}
