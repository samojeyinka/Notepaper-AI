import React, { useState } from 'react';
import Loader from '../globals/Loader';
import { apiClient } from '../../api/apiClient';

const inputCls =
  'w-full  border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-plum-200 focus:border-plum-400 transition-colors';

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
      <div className=" bg-white ring-1 ring-stone-900/5 shadow-[0_24px_50px_-28px_rgba(28,25,23,0.25)] p-10 md:p-14 flex flex-col items-center justify-center text-center min-h-[380px]">
        <div className="w-14 h-14  bg-plum-50 text-plum-700 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[28px]">check</span>
        </div>
        <h3 className="font-display-serif text-2xl font-semibold text-stone-900 mb-2">
          Message sent
        </h3>
        <p className="text-stone-500 text-[15px] max-w-sm">
          Thanks for reaching out — we&rsquo;ll get back to you shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 text-[14px] font-semibold text-plum-700 link-underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className=" bg-white ring-1 ring-stone-900/5 shadow-[0_24px_50px_-28px_rgba(28,25,23,0.25)] p-8 md:p-12 space-y-6"
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
          placeholder="What&rsquo;s on your mind?"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-500 text-[13px]">{error}</p>}

      <button
        className="w-full py-3.5  bg-plum-700 text-white text-[15px] font-semibold hover:bg-plum-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <Loader size="sm" />
        ) : (
          <>
            Send message
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
