import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ticketService, uploadToCloudinary } from '../api/ticketService';
import { workspaceCache } from '../api/workspaceCache';
import { useTicketChannel } from '../hooks/useTicketChannel';
import { useAuth } from '../context/AuthContext';

const STATUS_LABEL = { open: 'Open', closed: 'Resolved' };

const CATEGORY_LABEL = {
    technical_issue:          'Technical Issue',
    billing_and_subscription: 'Billing & Subscription',
    feature_request:          'Feature Request',
    ai_performance:           'AI Performance',
    other:                    'Other',
};

const PRIORITY_COLOR = {
    low:    'bg-slate-100 text-slate-500',
    normal: 'bg-blue-50 text-blue-500',
    high:   'bg-red-50 text-red-500',
};

function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).toUpperCase();
}

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Header Component
export const SupportConversationHeader = ({ ticket, isAdmin, onStatusChange }) => {
    const isOpen = ticket?.status === 'open';

    return (
        <header className="flex items-start justify-between mb-10">
            <div>
                <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
                    <Link to="/lockedin/support-tickets" className="hover:text-primary transition-colors">
                        Support tickets
                    </Link>
                    <span>/</span>
                    <span className="text-slate-600">Ticket #{ticket?.id ?? '...'}</span>
                </nav>
                <h1 className="text-xl font-semibold text-slate-900 mb-2">
                    {ticket?.subject ?? 'Loading…'}
                </h1>
                {ticket && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Category */}
                        {ticket.category && (
                            <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                {CATEGORY_LABEL[ticket.category] ?? ticket.category}
                            </span>
                        )}
                        {/* Priority */}
                        {ticket.priority && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[ticket.priority] ?? 'bg-slate-100 text-slate-500'}`}>
                                {ticket.priority} priority
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {/* Status badge */}
                {ticket && (
                    <div className={`${isOpen ? 'bg-green-500' : 'bg-slate-400'} text-white px-2 py-0.5 rounded-full text-[12px] font-normal shadow-sm flex items-center gap-1.5 -rotate-1`}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        <span>{isOpen ? 'Open' : 'Resolved'}</span>
                    </div>
                )}

                {/* Admin: status toggle */}
                {isAdmin && ticket && (
                    <button
                        onClick={() => onStatusChange(isOpen ? 'closed' : 'open')}
                        className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5
                            ${isOpen
                                ? 'border-red-200 text-red-500 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[14px]">
                            {isOpen ? 'lock' : 'lock_open'}
                        </span>
                        {isOpen ? 'Close Ticket' : 'Reopen Ticket'}
                    </button>
                )}
            </div>
        </header>
    );
};

// Message Component
// isOwn = current user sent this message
export const Message = ({ author, role, timestamp, content, image, isOwn = false, profilePicture, initials }) => {
    return (
        <div className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                {profilePicture ? (
                    <img src={profilePicture} alt={author} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center text-[11px] font-bold ${isOwn ? 'bg-slate-800 text-white' : 'bg-primary text-white'}`}>
                        {isOwn ? initials : <span className="material-symbols-outlined text-[14px]">support_agent</span>}
                    </div>
                )}
            </div>

            {/* Bubble */}
            <div className={`relative max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm border text-[14px] leading-relaxed
                    ${isOwn
                        ? 'bg-slate-800 text-white border-slate-700 rounded-br-sm'
                        : 'bg-white text-slate-700 border-slate-100 rounded-bl-sm'
                    }`}>
                    <p className={`text-[10px] font-semibold mb-1 ${isOwn ? 'text-slate-400' : 'text-primary'}`}>
                        {author}
                    </p>
                    <p>{content}</p>
                    {image && (
                        <img src={image} alt="attachment" className="mt-2 max-w-xs rounded-xl border border-white/20 shadow-sm" />
                    )}
                </div>
                <span className="text-[9px] text-slate-400 px-1">{timestamp}</span>
            </div>
        </div>
    );
};

// Reply Textarea Component
export const ReplyTextarea = ({ value, onChange, onSend, isSending }) => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        if (!value.trim() && !imageFile) return;
        setUploading(true);
        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            }
            await onSend(value, imageUrl);
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setUploading(false);
        }
    };

    const busy = isSending || uploading;

    return (
        <div className="relative pt-4">
            <div className="absolute inset-0 bg-slate-200/30 rounded-t-xl translate-y-2 translate-x-1"></div>
            <div className="relative bg-white rounded-t-xl border-t border-x border-slate-200 p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-3">
                    <span className="font-semibold text-[18px]">New Correspondence</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                {/* Image preview */}
                {imagePreview && (
                    <div className="relative inline-block mb-3">
                        <img src={imagePreview} alt="preview" className="h-20 rounded-xl border border-slate-200 shadow-sm object-cover" />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                    </div>
                )}

                <div className="ruled-lines relative">
                    <textarea
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-700 resize-none font-handwriting text-[15px] leading-[28px] py-0 placeholder:text-slate-300 overflow-y-auto"
                        placeholder="Type your reply here..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={5}
                        style={{ maxHeight: '180px' }}
                    />
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center space-x-4">
                        {/* Image upload */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                            title="Attach image"
                            disabled={busy}
                        >
                            <span className="material-symbols-outlined">image</span>
                        </button>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={(!value.trim() && !imageFile) || busy}
                        className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-medium hover:shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {busy ? (
                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">send</span>
                        )}
                        <span>{busy ? 'Sending…' : 'Send Message'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Conversation Container
export const SupportConversationContent = ({ ticket, messages, onSendMessage, isClosed, currentUserId }) => {
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text, imageUrl) => {
        setIsSending(true);
        try {
            await onSendMessage(text, imageUrl);
            setReplyText('');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="relative bg-amber-100 p-1 lg:p-2 rounded-lg shadow-2xl border-2 border-slate-900/10">
            <div className="bg-amber-50 min-h-[70vh] rounded shadow-inner relative overflow-hidden flex">
                {/* Binder Rings */}
                <div className="w-12 binder-rings border-r border-slate-300/30"></div>

                {/* Main Content */}
                <div className="flex-1 p-6 lg:p-10 overflow-y-auto flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg) => {
                            const isOwn = msg.user?.id === currentUserId;
                            return (
                                <Message
                                    key={msg.id}
                                    author={msg.user?.full_name ?? 'Unknown'}
                                    timestamp={formatTime(msg.created_at)}
                                    content={msg.body}
                                    image={msg.image}
                                    isOwn={isOwn}
                                    profilePicture={msg.user?.profile_picture}
                                    initials={getInitials(msg.user?.full_name)}
                                />
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {!isClosed && (
                        <ReplyTextarea
                            value={replyText}
                            onChange={setReplyText}
                            onSend={handleSend}
                            isSending={isSending}
                        />
                    )}

                    {isClosed && (
                        <p className="text-center text-sm text-slate-400 py-6">
                            This ticket is closed. Open a new ticket if you need further help.
                        </p>
                    )}
                </div>
            </div>

            {/* Folder Tab */}
            <div className="absolute -top-10 left-12 h-10 w-32 bg-amber-100 folder-tab flex items-center justify-center border-t border-x border-slate-900/10">
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                    Case: {ticket ? STATUS_LABEL[ticket.status]?.toUpperCase() ?? ticket.status.toUpperCase() : '…'}
                </span>
            </div>
        </div>
    );
};

export const SupportConversationFooter = () => null;

// Main Support Conversation Page
export const SupportTicket = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        ticketService.show(id)
            .then(res => {
                setTicket(res.data);
                setMessages(res.data.messages ?? []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    // Real-time: new message from other side
    useTicketChannel(
        id,
        (msg) => {
            // Avoid duplicates from our own optimistic inserts
            setMessages(prev =>
                prev.some(m => m.id === msg.id) ? prev : [...prev, msg]
            );
        },
        (e) => setTicket(t => ({ ...t, status: e.status }))
    );

    const handleSendMessage = async (text, imageUrl) => {
        const socketId = window.echo?.socketId();
        const res = await ticketService.sendMessage(
            id,
            { body: text.trim() || 'Attachment', ...(imageUrl ? { image: imageUrl } : {}) },
            socketId
        );
        // Add own message from HTTP response; dedup in case WebSocket also delivered it
        setMessages(prev => prev.some(m => m.id === res.data.id) ? prev : [...prev, res.data]);
    };

    const { user, isAdmin } = useAuth();

    const handleStatusChange = async (newStatus) => {
        try {
            await ticketService.updateStatus(id, newStatus);
            setTicket(t => ({ ...t, status: newStatus }));
            workspaceCache.invalidateTickets();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 relative z-10 max-w-5xl mx-auto w-full flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </main>
        );
    }

    const isClosed = ticket?.status === 'closed';

    return (
        <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 relative z-10 max-w-5xl mx-auto w-full">
            <svg className="absolute top-20 right-20 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                <path d="M10,10 C30,40 70,10 90,40" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
            </svg>

            <SupportConversationHeader ticket={ticket} isAdmin={isAdmin} onStatusChange={handleStatusChange} />
            <SupportConversationContent
                ticket={ticket}
                messages={messages}
                onSendMessage={handleSendMessage}
                isClosed={isClosed}
                currentUserId={user?.id}
            />
            <SupportConversationFooter />
        </main>
    );
};
