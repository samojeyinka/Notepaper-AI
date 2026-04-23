import React, { useState, useRef, useEffect } from 'react';

function formatLabel(type) {
  return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function UserTypeSelect({ value, onChange, options = [], loading = false, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = options.filter((t) =>
    formatLabel(t).toLowerCase().includes(search.toLowerCase())
  );

  const selected = value ? formatLabel(value) : null;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const handleSelect = (type) => {
    onChange(type);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${open ? 'z-50' : 'z-10'}`} ref={containerRef}>
      <div className="group">
        <label className="block text-[12px] md:text-xs font-medium md:font-bold text-slate-400 uppercase tracking-widest mb-1">
          I am a...
        </label>

        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled || loading}
          className="w-full flex items-center justify-between text-left focus:outline-none group/btn"
          style={{
            border: 'none',
            borderBottom: `1px solid ${open ? '#7c3aed' : '#e2e8f0'}`,
            background: 'transparent',
            padding: '8px 0',
            borderRadius: 0,
            transition: 'border-color 0.2s',
          }}
        >
          <span className={selected ? 'text-slate-800 text-[11px] md:text-sm md:font-medium' : 'text-slate-300 text-sm'}>
            {loading ? 'Loading roles...' : (selected || 'Select your role')}
          </span>
          <span
            className="material-symbols-outlined text-slate-400 text-base transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '18px' }}
          >
            expand_more
          </span>
        </button>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute bottom-full mb-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden"
          style={{
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)',
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>
              search
            </span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder-slate-300"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '220px' }}>
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No roles match "{search}"</p>
            ) : (
              filtered.map((type) => {
                const isSelected = type === value;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelect(type)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors duration-100
                      ${isSelected
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span>{formatLabel(type)}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '16px' }}>
                        check
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
