import React, { useState, useRef, useEffect } from "react";

export const FontFamilySelect = ({ value, onChange, options = [] }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const filtered = options.filter((font) =>
        font.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(o => o.id === value);

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

    const handleSelect = (id) => {
        onChange(id);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className={`relative ${open ? 'z-[70]' : 'z-20'}`} ref={containerRef}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Typography</p>
            
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border-2 transition-all bg-slate-50 relative 
                    ${open ? "border-primary shadow-lg shadow-primary/10" : "border-slate-100 hover:border-slate-200"}`}
            >
                <span className={`text-slate-700 font-normal text-[12px] ${selectedOption?.class}`}>
                    {selectedOption?.name || "Select Font"}
                </span>
                <span className={`material-icons-round text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                    expand_more
                </span>
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-[80] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Search Bar */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                        <span className="material-icons-round text-slate-400 text-[12px]">search</span>
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search fonts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 text-[12px] bg-transparent outline-none text-slate-700 placeholder-slate-400"
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filtered.length === 0 ? (
                            <p className="p-4 text-center text-[12px] text-slate-400">No fonts found</p>
                        ) : (
                            filtered.map((option) => {
                                const isSelected = option.id === value;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent focus loss from input
                                            handleSelect(option.id);
                                        }}
                                        className={`w-full flex items-center justify-between px-5 py-3 text-left transition-colors
                                            ${isSelected ? "bg-primary/5 text-primary font-bold" : "text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        <span className={`${option.class} text-[12px]`}>{option.name}</span>
                                        {isSelected && (
                                            <span className="material-icons-round text-primary text-sm">check_circle</span>
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
};
