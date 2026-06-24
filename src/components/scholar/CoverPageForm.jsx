import { useState, useRef } from 'react';
import { scholarService } from '../../api/scholarService';

const INPUT = 'w-full text-[13px] text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-primary/60 transition-colors placeholder:text-slate-300';

const LAYOUTS = [
    {
        id: 'classic',
        name: 'Classic',
        desc: 'Centered formal academic style',
        preview: (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 bg-white">
                <div className="w-8 h-8 rounded-sm bg-slate-200" />
                <div className="w-20 h-2.5 bg-slate-800 rounded mt-1" />
                <div className="w-14 h-1.5 bg-slate-400 rounded" />
                <div className="w-16 h-px bg-slate-300 my-1" />
                <div className="w-12 h-1.5 bg-slate-300 rounded" />
                <div className="w-10 h-1.5 bg-slate-200 rounded" />
            </div>
        ),
    },
    {
        id: 'modern',
        name: 'Modern',
        desc: 'Bold left-aligned with dark header bar',
        preview: (
            <div className="w-full h-full flex flex-col bg-white">
                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2">
                    <div className="w-4 h-4 rounded-sm bg-slate-600" />
                    <div className="w-10 h-1.5 bg-slate-400 rounded" />
                </div>
                <div className="p-3 flex flex-col gap-1.5">
                    <div className="w-full h-3 bg-slate-800 rounded" />
                    <div className="w-4/5 h-3 bg-slate-800 rounded" />
                    <div className="w-full h-1.5 bg-slate-200 rounded mt-1" />
                    <div className="w-2/3 h-1.5 bg-slate-200 rounded" />
                    <div className="flex justify-end gap-1 mt-1">
                        <div className="w-10 h-1.5 bg-slate-300 rounded" />
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'minimal',
        name: 'Minimal',
        desc: 'Clean with generous whitespace',
        preview: (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 bg-white">
                <div className="w-24 h-3 bg-slate-800 rounded" />
                <div className="w-20 h-2 bg-slate-600 rounded" />
                <div className="w-full border-t border-slate-200 my-1" />
                <div className="w-14 h-1.5 bg-slate-400 rounded" />
                <div className="w-10 h-1.5 bg-slate-300 rounded" />
            </div>
        ),
    },
];

export default function CoverPageForm({ doc, onSaved, onClose }) {
    const existing = doc.meta?.cover || {};

    const [step, setSte] = useState(1);
    const setStep = setSte;
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState('');

    const [form, setForm] = useState({
        title:            existing.title            ?? doc.title ?? '',
        institution:      existing.institution      ?? '',
        institution_logo: existing.institution_logo ?? '',
        description:      existing.description      ?? '',
        supervisor:       existing.supervisor       ?? '',
        date:             existing.date             ?? '',
        members:          existing.members          ?? [],
        layout:           existing.layout           ?? 'classic',
    });

    const logoRef      = useRef(null);
    const [newMember, setNewMember] = useState('');

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => set('institution_logo', ev.target.result);
        reader.readAsDataURL(file);
    };

    const addMember = () => {
        const name = newMember.trim();
        if (!name) return;
        set('members', [...form.members, name]);
        setNewMember('');
    };

    const removeMember = (i) =>
        set('members', form.members.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await scholarService.updateCover(doc.id, form);
            onSaved(res.data?.meta?.cover ?? form);
        } catch {
            setError('Failed to save. Please try again.');
            setSaving(false);
        }
    };

    const STEP_LABELS = ['Document Details', 'People & Date', 'Choose Layout'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            Step {step} of 3
                        </p>
                        <h2 className="text-[17px] font-bold text-slate-800">{STEP_LABELS[step - 1]}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors mt-0.5"
                    >
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>

                {/* Step bar */}
                <div className="flex gap-1 px-6 mb-5">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-primary' : 'bg-slate-100'}`}
                        />
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-2">

                    {/* ── Step 1: Document details ─────────────────────────── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <Field label="Title">
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    className={INPUT}
                                    placeholder="Document title"
                                />
                            </Field>

                            <Field label="Institution">
                                <input
                                    type="text"
                                    value={form.institution}
                                    onChange={e => set('institution', e.target.value)}
                                    className={INPUT}
                                    placeholder="University or organization name"
                                />
                            </Field>

                            <Field label="Institution Logo">
                                <div className="flex items-center gap-3">
                                    {form.institution_logo ? (
                                        <img
                                            src={form.institution_logo}
                                            alt="logo"
                                            className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                            <span className="material-icons-round text-[24px]">image</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => logoRef.current?.click()}
                                            className="text-[12px] font-semibold text-primary hover:underline"
                                        >
                                            {form.institution_logo ? 'Change logo' : 'Upload logo'}
                                        </button>
                                        {form.institution_logo && (
                                            <button
                                                onClick={() => set('institution_logo', '')}
                                                className="text-[12px] text-slate-400 hover:text-red-400 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                        <p className="text-[10px] text-slate-300">PNG, JPG, SVG</p>
                                    </div>
                                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                                </div>
                            </Field>

                            <Field label="Description / Abstract">
                                <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    rows={4}
                                    className={INPUT + ' resize-none'}
                                    placeholder="Brief overview of the document..."
                                />
                            </Field>
                        </div>
                    )}

                    {/* ── Step 2: People & Date ────────────────────────────── */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <Field label="Supervisor" optional>
                                <input
                                    type="text"
                                    value={form.supervisor}
                                    onChange={e => set('supervisor', e.target.value)}
                                    className={INPUT}
                                    placeholder="e.g. Dr. Jane Smith"
                                />
                            </Field>

                            <Field label="Date" optional>
                                <input
                                    type="text"
                                    value={form.date}
                                    onChange={e => set('date', e.target.value)}
                                    className={INPUT}
                                    placeholder="e.g. June 2025"
                                />
                            </Field>

                            <Field label="Team / Members" optional>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMember}
                                            onChange={e => setNewMember(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMember(); } }}
                                            className={INPUT + ' flex-1'}
                                            placeholder="Member name, press Enter to add"
                                        />
                                        <button
                                            onClick={addMember}
                                            className="px-3 py-2 rounded-lg bg-slate-100 text-[12px] font-semibold text-slate-600 hover:bg-slate-200 transition-colors whitespace-nowrap"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {form.members.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {form.members.map((m, i) => (
                                                <span key={i} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-slate-100 rounded-full text-[12px] text-slate-700 font-medium">
                                                    {m}
                                                    <button onClick={() => removeMember(i)} className="text-slate-400 hover:text-red-400 transition-colors">
                                                        <span className="material-icons-round text-[13px]">close</span>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Field>
                        </div>
                    )}

                    {/* ── Step 3: Layout picker ────────────────────────────── */}
                    {step === 3 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-[12px] text-slate-500">
                                Choose how your cover page will look in the document and exports.
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {LAYOUTS.map(layout => (
                                    <button
                                        key={layout.id}
                                        onClick={() => set('layout', layout.id)}
                                        className={`flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all ${
                                            form.layout === layout.id
                                                ? 'border-primary shadow-md shadow-primary/10 ring-2 ring-primary/10'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="h-28 w-full bg-slate-50 overflow-hidden">
                                            {layout.preview}
                                        </div>
                                        <div className="px-2.5 py-2">
                                            <p className="text-[12px] font-semibold text-slate-700">{layout.name}</p>
                                            <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{layout.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 mt-2">
                    <button
                        onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Next
                            <span className="material-icons-round text-[16px]">arrow_forward</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <span className="material-icons-round animate-spin text-[16px]">refresh</span>
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-round text-[16px]">check</span>
                                    Save Cover
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, optional, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1.5">
                {label}
                {optional && <span className="text-[10px] font-normal text-slate-400">(optional)</span>}
            </label>
            {children}
        </div>
    );
}
