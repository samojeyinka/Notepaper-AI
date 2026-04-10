import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketService } from '../api/ticketService';
import { workspaceCache } from '../api/workspaceCache';

const CATEGORY_OPTIONS = [
    { label: 'Technical Issue',         value: 'technical_issue' },
    { label: 'Billing & Subscription',  value: 'billing_and_subscription' },
    { label: 'Feature Request',         value: 'feature_request' },
    { label: 'AI Performance',          value: 'ai_performance' },
    { label: 'Other',                   value: 'other' },
];

const PRIORITY_OPTIONS = [
    { label: 'Low',    value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High',   value: 'high' },
];

export const SupportTicketHeader = () => {
    return (
        <header className="w-full max-w-4xl flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
                <Link
                    to="/lockedin/support-tickets"
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-xl font-semibold text-slate-900">Help & Support</h1>
            </div>
        </header>
    );
};

export const FormInput = ({ label, placeholder, value, onChange, type = 'text' }) => {
    return (
        <div className="group">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                {label}
            </label>
            <input
                type={type}
                className="w-full text-[15px] font-serif border-b-2 border-slate-100 focus:border-primary bg-transparent py-1 focus:ring-0 transition-all placeholder:text-slate-200"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export const CategorySelect = ({ value, onChange }) => {
    return (
        <div className="relative inline-block group">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Category
            </label>
            <select
                className="appearance-none text-[14px] bg-slate-100 border-none rounded-r-lg rounded-tl-lg px-3 py-1.5 pr-12 font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-primary/20 hover:bg-slate-200 transition-all"
                value={value}
                onChange={onChange}
            >
                {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

export const PrioritySelect = ({ value, onChange }) => {
    return (
        <div className="relative inline-block group ml-4">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Priority
            </label>
            <select
                className="appearance-none text-[14px] bg-slate-100 border-none rounded-r-lg rounded-tl-lg px-3 py-1.5 pr-8 font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-primary/20 hover:bg-slate-200 transition-all"
                value={value}
                onChange={onChange}
            >
                {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

export const TextareaInput = ({ label, placeholder, value, onChange }) => {
    return (
        <div className="relative mt-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                {label}
            </label>
            <div className="ruled-page border-l-2 border-red-200 pl-8">
                <textarea
                    className="w-full bg-transparent border-none focus:ring-0 text-[15px] leading-[32px] p-0 resize-none overflow-y-auto placeholder:text-slate-300"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    rows={8}
                    style={{ maxHeight: '280px' }}
                />
            </div>
        </div>
    );
};

export const SubmitButton = ({ onClick, disabled = false, loading = false }) => {
    return (
        <div className="pt-3 flex flex-col items-center">
            <div className="relative">
                <button
                    type="button"
                    onClick={onClick}
                    disabled={disabled || loading}
                    className="bg-primary text-white px-6 py-2 rounded-full font-semibold text-[15px] shadow-sm hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <>
                            <span>Submit Ticket</span>
                            <span className="material-symbols-outlined">send</span>
                        </>
                    )}
                </button>
                <div className="absolute -right-48 top-0 hidden xl:flex flex-col items-center rotate-6">
                    <svg className="w-16 h-12 text-primary/60 -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 10c0 0 5-2 8 0s3 8 0 10-8 0-8 0m8-10l3-3m-3 3l-3-3"
                            strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                    <p className="font-handwriting text-[15px] text-primary mt-2">We'll get back to you soon!</p>
                </div>
            </div>
        </div>
    );
};

export const SupportTicketForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: '',
        category: 'technical_issue',
        priority: 'normal',
        details: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [createdId, setCreatedId] = useState(null);
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.subject.trim() || !formData.details.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await ticketService.create(formData);
            workspaceCache.invalidateTickets();
            setCreatedId(res.data?.id);
            setSubmitted(true);
            // Navigate to ticket after short delay
            setTimeout(() => navigate(`/lockedin/support-tickets/show/${res.data?.id}`), 1800);
        } catch (err) {
            setError(err?.message ?? 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-3xl">
            <div className="absolute inset-0 bg-slate-200 translate-x-2 translate-y-3 rounded-sm rotate-1"></div>
            <div className="relative bg-white p-8 pt-8 rounded-sm shadow-lg border border-slate-100 min-h-[700px]">
                {/* Label */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="washi-tape-effect w-24 h-6 mb-[-12px] z-20"></div>
                    <div className="bg-amber-100 px-6 py-2 border border-amber-200 shadow-sm rotate-[-1deg]">
                        <span className="font-handwriting text-[15px] text-amber-700">
                            {submitted ? 'Ticket Submitted!' : 'New Support Ticket'}
                        </span>
                    </div>
                </div>

                {!submitted ? (
                    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                        <FormInput
                            label="Subject of Inquiry"
                            placeholder="What's on your mind?"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                        />

                        <div className="flex flex-wrap gap-4">
                            <CategorySelect
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                            />
                            <PrioritySelect
                                value={formData.priority}
                                onChange={(e) => handleInputChange('priority', e.target.value)}
                            />
                        </div>

                        <TextareaInput
                            label="Details & Context"
                            placeholder="Write your message here… The more detail, the better!"
                            value={formData.details}
                            onChange={(e) => handleInputChange('details', e.target.value)}
                        />

                        {error && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">error_outline</span>
                                {error}
                            </p>
                        )}

                        <SubmitButton onClick={handleSubmit} loading={loading} />
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] space-y-6 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Thank you!</h2>
                            <p className="text-slate-500 max-w-sm">
                                Your ticket has been submitted. Redirecting you to the conversation…
                            </p>
                        </div>
                        {createdId && (
                            <p className="text-sm font-medium text-primary">Ticket ID: #{createdId}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const NewSupportTickets = () => {
    return (
        <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 relative z-10 flex flex-col items-center">
            <svg className="absolute top-10 right-20 w-48 h-48 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                <path d="M20,20 Q40,10 60,20 T100,20" fill="none" stroke="currentColor" strokeWidth="1"></path>
                <circle cx="70" cy="70" r="15" fill="none" stroke="currentColor" strokeWidth="0.5"></circle>
            </svg>
            <svg className="absolute bottom-20 left-80 w-64 h-64 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                <rect x="10" y="20" width="30" height="40" rx="2" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(-10)"></rect>
            </svg>

            <SupportTicketHeader />
            <SupportTicketForm />
        </main>
    );
};
