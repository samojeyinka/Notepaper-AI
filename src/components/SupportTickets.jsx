import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Header Component
export const SupportArchiveHeader = () => {
    const handleOpenNewTicket = () => {
        console.log('Opening new ticket');
    };

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

// Tab Component - Reusable
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

// Ticket Card Component - Reusable
export const TicketCard = ({ ticketId, status, title, lastActivity, isResolved = false, onClick }) => {
    const statusColors = {
        'Awaiting Response': 'text-primary-700',
        'Under Review': 'text-primary-700',
        Open: 'text-primary-700',
        Resolved: 'text-slate-400',
    };

    return (
        <div
            onClick={onClick}
            className={`relative group cursor-pointer transition-all hover:-translate-y-1 hover:z-20 ${isResolved ? 'opacity-70' : ''}`}
        >
            <div className={`absolute inset-0 bg-slate-50 translate-x-0.5 translate-y-1 rounded-sm transition-transform group-hover:rotate-0 ${Math.random() > 0.5 ? '-rotate-1' : 'rotate-0.5'
                }`}></div>
            <div className="relative bg-[#FFFDF9] p-3 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-normal tracking-widest text-slate-400 uppercase">{ticketId}</span>
                        {status !== 'Resolved' ? (
                            <div className="relative">
                                <div className="blob-highlight-t absolute -inset-2 z-0"></div>
                                <span className={`relative z-10 text-[10px] font-normal uppercase px-1 ${statusColors[status]}`}>
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

// Ticket List Component
export const TicketList = ({ tickets }) => {
    return (
        <div className="space-y-2 relative">
            {tickets.map((ticket, index) => (
                <TicketCard
                    key={ticket.id}
                    ticketId={ticket.id}
                    status={ticket.status}
                    title={ticket.title}
                    lastActivity={ticket.lastActivity}
                    isResolved={ticket.status === 'Resolved'}
                    onClick={() => console.log('Clicked ticket:', ticket.id)}
                />
            ))}
        </div>
    );
};

// Pagination Component
export const TicketPagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="mt-8 flex flex-col md:flex-row  items-center justify-between border-t border-slate-100 pt-6">
            <p className="font-handwriting text-slate-400 text-[16px]">Showing 4 of 12 archive entries</p>
            <div className="flex space-x-2 mt-2 md:mt-0">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => onPageChange(i + 1)}
                        className={`w-8 h-8 rounded flex items-center justify-center transition-all ${currentPage === i + 1
                            ? 'bg-slate-100 text-slate-600 font-bold'
                            : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Main Support Archive Content
export const SupportArchiveContent = ({ activeTab, onTabChange }) => {
    const allTickets = [
        {
            id: '#NP-8821',
            status: 'Awaiting Response',
            title: 'Markdown formatting issues in dark mode',
            lastActivity: 'Last activity: Today at 2:45 PM',
        },
        {
            id: '#NP-8794',
            status: 'Under Review',
            title: 'Integration request: Notion to Notepaper',
            lastActivity: 'Last activity: Yesterday at 10:15 AM',
        },
        {
            id: '#NP-8412',
            status: 'Resolved',
            title: 'Login issues with Apple ID',
            lastActivity: 'Last activity: Oct 12, 2023',
        },
        {
            id: '#NP-8201',
            status: 'Open',
            title: 'Billing cycle clarification needed',
            lastActivity: 'Last activity: Oct 20, 2023',
        },
    ];

    const activeTickets = allTickets.filter((t) => t.status !== 'Resolved');
    const resolvedTickets = allTickets.filter((t) => t.status === 'Resolved');

    const displayTickets = activeTab === 'active' ? activeTickets : resolvedTickets;

    return (
        <div className="relative w-full max-w-5xl">
            <div className="absolute inset-0 bg-slate-200 translate-x-1 translate-y-2 rounded-lg -rotate-1"></div>
            <div className="relative bg-white min-h-[700px] rounded-lg shadow-md border border-slate-100 p-8">
                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-slate-100">
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
                        isActive={activeTab === 'resolved'}
                        onClick={() => onTabChange('resolved')}
                    />
                </div>

                {/* Ticket List */}
                <TicketList tickets={displayTickets} />

                {/* Pagination */}
                <TicketPagination currentPage={1} totalPages={3} onPageChange={(page) => console.log('Page:', page)} />
            </div>

            {/* Washi Tape Decoration */}
            <div className="absolute -bottom-8 right-0 rotate-1">
                <div className="washi-tape-effect-t w-24 h-8"></div>
            </div>
        </div>
    );
};

// Floating Action Buttons
export const SupportFloatingButtons = () => {
    return (
        <Link
            to={`/lockedin/support-tickets/new`}
            className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 group">
            <span className="material-symbols-outlined text-3xl"><Plus /></span>

        </Link>
    );
};

// Main Support Archive Page
export const SupportTickets = () => {
    const [activeTab, setActiveTab] = useState('active');

    // Handle URL parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'resolved' || tab === 'active') {
            setActiveTab(tab);
        }
    }, []);

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url);
    };

    return (
        <main className=" flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 relative z-10 flex flex-col items-center">
            {/* Decorative background elements */}
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

