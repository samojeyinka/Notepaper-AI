import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketService } from '../api/ticketService';
import { workspaceCache } from '../api/workspaceCache';
import { useAdminTicketsChannel } from '../hooks/useTicketChannel';
import { useAuth } from '../context/AuthContext';
import NotificationIcon from './user/NotificationIcon';

// Header
export const SupportArchiveHeader = () => {
    return (
        <header className="w-full flex items-end justify-between gap-4 mb-8">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-1.5">Need a hand?</p>
                <h1 className="font-display-serif text-[28px] md:text-[34px] font-semibold tracking-tight text-stone-900 leading-tight">
                    Help &amp; support
                </h1>
                <p className="text-stone-500 text-[13px] md:text-sm mt-1.5">
                    We reply to every ticket, usually the same day.
                </p>
            </div>
            <div className="flex items-center gap-3 md:gap-5 shrink-0">
                <Link
                    to="/lockedin/support-tickets/new"
                    className="inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2 text-sm font-semibold hover:bg-stone-700 active:scale-[0.98] transition-all"
                >
                    <span className="material-icons-round text-[17px]">add</span>
                    New ticket
                </Link>
                <NotificationIcon />
            </div>
        </header>
    );
};

// Tab
export const SupportTab = ({ icon, label, count, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`pb-2.5 px-2 flex items-center gap-2 border-b-2 transition-all text-[13px] font-medium ${
                isActive
                    ? 'text-plum-700 border-plum-600'
                    : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
        >
            <span className="material-icons-round text-[17px]">{icon}</span>
            {label}
            {count !== undefined && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${isActive ? 'bg-plum-50 text-plum-700' : 'bg-stone-100 text-stone-400'}`}>
                    {count}
                </span>
            )}
        </button>
    );
};

const STATUS_LABEL = {
    open: 'Open',
    in_progress: 'Under review',
    closed: 'Resolved',
};

const STATUS_META = {
    open:         { dot: 'bg-plum-600',  text: 'text-plum-700' },
    in_progress:  { dot: 'bg-amber-600', text: 'text-amber-700' },
    closed:       { dot: 'bg-stone-400', text: 'text-stone-500' },
};

export const TicketCard = ({ ticketId, status, title, lastActivity, isResolved = false, onClick }) => {
    const meta = isResolved || status === 'Resolved'
        ? STATUS_META.closed
        : status === 'Under review'
            ? STATUS_META.in_progress
            : STATUS_META.open;
    const shortId = String(ticketId ?? '').slice(0, 8);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
            className={`group w-full text-left bg-white ring-1 ring-stone-200/70 px-5 md:px-6 py-4 hover:ring-plum-300 hover:-translate-y-0.5 transition-all cursor-pointer ${isResolved ? 'opacity-75' : ''}`}
        >
            <div className="flex items-start justify-between gap-5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                        <span className={`w-2 h-2 ${meta.dot} shrink-0`} />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                            #{shortId}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${meta.text}`}>
                            {isResolved ? 'Resolved' : status}
                        </span>
                    </div>
                    <h3 className={`text-[14.5px] font-semibold truncate transition-colors ${isResolved ? 'text-stone-400' : 'text-stone-900 group-hover:text-plum-700'}`}>
                        {title}
                    </h3>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[11px] text-stone-400 whitespace-nowrap">{lastActivity}</span>
                    <span className={`material-icons-round text-[18px] transition-all ${isResolved ? 'text-stone-300' : 'text-stone-300 group-hover:text-plum-600 group-hover:translate-x-0.5'}`}>
                        chevron_right
                    </span>
                </div>
            </div>
        </div>
    );
};

export const TicketList = ({ tickets, loading }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-stone-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!tickets.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
                <p className="font-display-serif text-[18px] font-semibold text-stone-800 mb-1.5">Nothing here yet</p>
                <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed">
                    New tickets will show up here as they arrive.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
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
                        lastActivity={updatedAt ? `Last activity · ${updatedAt}` : ''}
                        isResolved={isResolved}
                        onClick={() => navigate(`/lockedin/support-tickets/show/${ticket.id}`)}
                    />
                );
            })}
        </div>
    );
};

const TICKETS_PER_PAGE = 8;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="w-9 h-9 flex items-center justify-center text-stone-500 border border-stone-200 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <span className="material-icons-round text-[18px]">chevron_left</span>
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 text-[13px] font-semibold border transition-all ${
                        page === currentPage
                            ? 'bg-stone-900 border-stone-900 text-white'
                            : 'text-stone-500 border-stone-200 hover:border-stone-400'
                    }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="w-9 h-9 flex items-center justify-center text-stone-500 border border-stone-200 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <span className="material-icons-round text-[18px]">chevron_right</span>
            </button>
        </div>
    );
};

export const SupportArchiveContent = ({ activeTab, onTabChange }) => {
    const { isAdmin } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

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

    // Reset to page 1 when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

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

    const totalPages = Math.max(1, Math.ceil(displayTickets.length / TICKETS_PER_PAGE));
    const paginatedTickets = displayTickets.slice(
        (currentPage - 1) * TICKETS_PER_PAGE,
        currentPage * TICKETS_PER_PAGE
    );

    return (
        <div className="w-full">
            {/* Tabs + refresh */}
            <div className="flex items-center justify-between border-b border-stone-200 mb-6">
                <div className="flex items-center gap-1 md:gap-2">
                    <SupportTab
                        icon="move_to_inbox"
                        label="Active"
                        count={activeTickets.length}
                        isActive={activeTab === 'active'}
                        onClick={() => onTabChange('active')}
                    />
                    <SupportTab
                        icon="check_circle"
                        label="Resolved"
                        count={resolvedTickets.length}
                        isActive={activeTab === 'resolved'}
                        onClick={() => onTabChange('resolved')}
                    />
                </div>
                <button
                    onClick={() => fetchTickets(true)}
                    disabled={refreshing}
                    className="mb-2 p-2 border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-plum-700 transition-colors"
                    title="Refresh tickets"
                >
                    <span className={`material-icons-round text-[18px] ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-stone-100 animate-pulse" />)}
                </div>
            ) : paginatedTickets.length === 0 ? (
                activeTab === 'active' ? (
                    <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
                        <p className="font-display-serif text-[19px] font-semibold text-stone-800 mb-1.5">All clear</p>
                        <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed mb-6">
                            No open tickets right now. If something's off, we're one message away.
                        </p>
                        <Link
                            to="/lockedin/support-tickets/new"
                            className="px-5 py-2.5 bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition-colors"
                        >
                            Open a ticket
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
                        <p className="font-display-serif text-[19px] font-semibold text-stone-800 mb-1.5">No resolved tickets</p>
                        <p className="text-stone-500 text-sm">Anything we close shows up here.</p>
                    </div>
                )
            ) : (
                <>
                    <TicketList tickets={paginatedTickets} loading={false} />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}
        </div>
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
        <main className="flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pt-20 lg:pt-10 pb-32 min-w-0 overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                <SupportArchiveHeader />
                <SupportArchiveContent activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
        </main>
    );
};
