import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketService } from '../api/ticketService';
import { workspaceCache } from '../api/workspaceCache';
import { useAdminTicketsChannel } from '../hooks/useTicketChannel';
import { useAuth } from '../context/AuthContext';

// Header Component
export const SupportArchiveHeader = () => {
    return (
        <header className="w-full max-w-5xl flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-slate-900">My Support Tickets</h1>
            </div>
            <div className="flex items-center space-x-3">
                <div className="relative group">
                    <Link
                        to={`/lockedin/support-tickets/new`}
                        className="bg-primary text-white text-[15px] px-3 py-1.5 rounded-full font-medium shadow-md hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span>Open New Ticket</span>
                    </Link>
                    <div className="absolute -left-32 top-10 flex flex-col items-center rotate-[-12deg] pointer-events-none">
                        <svg className="w-12 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M21 3c0 0-5 2-8 0s-3 8 0 10 8 0 8 0m-8-10l-3-3m3 3l3-3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                            ></path>
                        </svg>
                        <p className="font-handwriting text-primary text-lg whitespace-nowrap">Start here!</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export const SupportTab = ({ icon, label, count, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`pb-4 px-2 font-medium transition-all flex items-center space-x-2 border-b-2 ${isActive
                ? 'text-primary border-primary'
                : 'text-slate-400 hover:text-slate-600 border-transparent'
                }`}
        >
            <span className="material-symbols-outlined text-[15px]">{icon}</span>
            <span>{label}</span>
            {count !== undefined && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                    {count}
                </span>
            )}
        </button>
    );
};

const STATUS_LABEL = {
    open: 'Open',
    in_progress: 'Under Review',
    closed: 'Resolved',
};

export const TicketCard = ({ ticketId, status, title, lastActivity, isResolved = false, onClick }) => {
    const statusColors = {
        'Under Review': 'text-primary-700',
        'Open': 'text-primary-700',
        'Resolved': 'text-slate-400',
    };

    return (
        <div
            onClick={onClick}
            className={`relative group cursor-pointer transition-all hover:-translate-y-1 hover:z-20 ${isResolved ? 'opacity-70' : ''}`}
        >
            <div className="absolute inset-0 bg-slate-50 translate-x-0.5 translate-y-1 rounded-sm transition-transform group-hover:rotate-0"></div>
            <div className="relative bg-[#FFFDF9] p-3 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-normal tracking-widest text-slate-400 uppercase">#{ticketId}</span>
                        {!isResolved ? (
                            <div className="relative">
                                <div className="blob-highlight-t absolute -inset-2 z-0"></div>
                                <span className={`relative z-10 text-[10px] font-normal uppercase px-1 ${statusColors[status] || 'text-primary-700'}`}>
                                    {status}
                                </span>
                            </div>
                        ) : (
                            <div className="stamp-resolved-t scale-75 -ml-2">RESOLVED</div>
                        )}
                    </div>
                    <h3
                        className={`text-[15px] font-medium transition-colors ${isResolved
                            ? 'text-slate-400 line-through decoration-slate-300'
                            : 'text-slate-800 group-hover:text-primary'
                            }`}
                    >
                        {title}
                    </h3>
                    <p className="text-xs text-slate-400">{lastActivity}</p>
                </div>
                <span className={`material-symbols-outlined transition-all ${isResolved ? 'text-slate-300' : 'text-slate-300 group-hover:text-primary group-hover:translate-x-1'}`}>
                    chevron_right
                </span>
            </div>
        </div>
    );
};

export const TicketList = ({ tickets, loading }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-sm animate-pulse" />
                ))}
            </div>
        );
    }

    if (!tickets.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">inbox</span>
                <p className="text-slate-400 text-sm">No tickets here yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 relative">
            {tickets.map((ticket) => {
                const statusLabel = STATUS_LABEL[ticket.status] || ticket.status;
                const isResolved = ticket.status === 'closed';
                const updatedAt = ticket.updated_at
                    ? new Date(ticket.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '';
                return (
                    <TicketCard
                        key={ticket.id}
                        ticketId={ticket.id}
                        status={statusLabel}
                        title={ticket.subject}
                        lastActivity={updatedAt ? `Last activity: ${updatedAt}` : ''}
                        isResolved={isResolved}
                        onClick={() => navigate(`/lockedin/support-tickets/show/${ticket.id}`)}
                    />
                );
            })}
        </div>
    );
};

export const SupportArchiveContent = ({ activeTab, onTabChange }) => {
    const { isAdmin } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTickets = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const res = await ticketService.list();
            const data = res.data ?? [];
            setTickets(data);
            workspaceCache.setTickets(data);
        } catch {
            // keep existing
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const cached = workspaceCache.getTickets();
        if (cached) {
            setTickets(cached);
            setLoading(false);
        } else {
            fetchTickets();
        }
    }, [fetchTickets]);

    // Admins: prepend new tickets arriving in real time
    useAdminTicketsChannel(isAdmin ? (ticket) => {
        setTickets(prev => {
            if (prev.some(t => t.id === ticket.id)) return prev;
            const next = [ticket, ...prev];
            workspaceCache.setTickets(next);
            return next;
        });
    } : null);

    const activeTickets = tickets.filter(t => t.status !== 'closed');
    const resolvedTickets = tickets.filter(t => t.status === 'closed');
    const displayTickets = activeTab === 'active' ? activeTickets : resolvedTickets;

    return (
        <div className="relative w-full max-w-5xl">
            <div className="absolute inset-0 bg-slate-200 translate-x-1 translate-y-2 rounded-lg -rotate-1"></div>
            <div className="relative bg-white min-h-[700px] rounded-lg shadow-md border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100">
                    <div className="flex space-x-4">
                        <SupportTab
                            icon="move_to_inbox"
                            label="Active Tickets"
                            count={activeTickets.length}
                            isActive={activeTab === 'active'}
                            onClick={() => onTabChange('active')}
                        />
                        <SupportTab
                            icon="history"
                            label="Resolved"
                            count={resolvedTickets.length}
                            isActive={activeTab === 'resolved'}
                            onClick={() => onTabChange('resolved')}
                        />
                    </div>
                    <button
                        onClick={() => fetchTickets(true)}
                        disabled={refreshing}
                        className="mb-4 p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors"
                        title="Refresh tickets"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>

                <TicketList tickets={displayTickets} loading={loading} />
            </div>

            <div className="absolute -bottom-8 right-0 rotate-1">
                <div className="washi-tape-effect-t w-24 h-8"></div>
            </div>
        </div>
    );
};

export const SupportFloatingButtons = () => {
    return (
        <Link
            to={`/lockedin/support-tickets/new`}
            className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 group">
            <span className="material-symbols-outlined text-3xl"><Plus /></span>
        </Link>
    );
};

export const SupportTickets = () => {
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'resolved' || tab === 'active') setActiveTab(tab);
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url);
    };

    return (
        <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 relative z-10 flex flex-col items-center">
            <svg className="absolute top-20 right-40 w-56 h-56 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                <path d="M10,80 Q30,70 50,80 T90,80" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
                <rect x="20" y="20" width="15" height="40" fill="none" stroke="currentColor" transform="rotate(5)"></rect>
                <path d="M60,40 C70,20 90,30 80,50" fill="none" stroke="currentColor"></path>
            </svg>
            <svg className="absolute bottom-40 left-80 w-48 h-48 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeDasharray="2 2"></circle>
                <path d="M20,20 L30,30 M70,70 L80,80" stroke="currentColor" strokeWidth="0.5"></path>
            </svg>

            <SupportArchiveHeader />
            <SupportArchiveContent activeTab={activeTab} onTabChange={handleTabChange} />
            <SupportFloatingButtons />
        </main>
    );
};
