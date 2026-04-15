import { useMemo } from 'react';
import { useNotifications } from '../context/NotificationsContext';

// ─── Type → display config ────────────────────────────────────────────────────



const TYPE_CONFIG = {
    'App\\Notifications\\NoteReverted': {
        icon: 'history',
        iconBgColor: 'bg-amber-50',
        iconColor: 'text-amber-500',
        buttonClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    'App\\Notifications\\TwoFAEnabled': {
        icon: 'lock',
        iconBgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    'App\\Notifications\\TwoFADisabled': {
        icon: 'lock_open',
        iconBgColor: 'bg-red-50',
        iconColor: 'text-red-500',
        buttonClass: 'bg-red-500 hover:bg-red-600 text-white',
    },
    'App\\Notifications\\TicketCreated': {
        icon: 'confirmation_number',
        iconBgColor: 'bg-blue-50',
        iconColor: 'text-blue-500',
        buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    'App\\Notifications\\TicketNewMessage': {
        icon: 'chat',
        iconBgColor: 'bg-violet-50',
        iconColor: 'text-violet-500',
        buttonClass: 'bg-violet-500 hover:bg-violet-600 text-white',
    },
};

const DEFAULT_CONFIG = {
    icon: 'notifications',
    iconBgColor: 'bg-slate-50',
    iconColor: 'text-slate-400',
    buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white',
};

function resolveConfig(type, data) {
    const cfg = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
    return {
        icon: cfg.icon,
        iconBgColor: cfg.iconBgColor,
        iconColor: cfg.iconColor,
        buttonClass: cfg.buttonClass,
        title: data?.title ?? 'Notification',
        description: data?.description ?? '',
    };
}

function buildActions(data) {
    if (!data?.url || !data?.placeholder) return [];
    return [
        {
            label: data.placeholder,
            variant: 'primary',
            onClick: () => window.open(data.url, '_blank'),
        },
    ];
}

// ─── Header ───────────────────────────────────────────────────────────────────

export const NotificationsHeader = ({ onMarkAllAsRead }) => (
    <header className="flex justify-between md:items-end mb-8 flex-col md:flex-row">
        <div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2 font-display">Notifications</h1>
            <p className="font-handwriting text-[15px] text-slate-500 italic">Stay on top of your digital paper trail...</p>
        </div>
        <div className="relative pb-4 mt-2 md:mt-0">
            <button
                onClick={onMarkAllAsRead}
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium text-[14px] group"
            >
                <span className="material-symbols-outlined">done_all</span>
                <span>Mark all as read</span>
            </button>
            <div className="absolute -left-12 top-10 scribble-arrow-n text-primary pointer-events-none select-none">
                <svg className="rotate-[120deg]" fill="none" height="40" viewBox="0 0 40 40" width="40">
                    <path
                        d="M5 5 C 10 20, 30 20, 35 35 M 35 35 L 25 35 M 35 35 L 35 25"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    />
                </svg>
                <span className="absolute -left-20 top-8 whitespace-nowrap -rotate-6">clean slate!</span>
            </div>
        </div>
    </header>
);

// ─── Notification Card ────────────────────────────────────────────────────────

export const NotificationCard = ({
    icon,
    iconBgColor,
    iconColor,
    buttonClass,
    title,
    description,
    timestamp,
    isUnread = false,
    actions = [],
    rotation = 'rotate-1',
    hasPin = false,
    onMarkAsRead,
    onDelete,
}) => (
    <div
        className={`paper-scrap-n relative p-3 rounded-lg ${rotation} flex items-start space-x-3 ${
            isUnread ? 'unread-blob-n' : ''
        }`}
    >
        {hasPin && <div className="pin-n" />}

        {/* Icon */}
        <div
            className={`w-9 h-9 flex-shrink-0 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden ${iconBgColor}`}
        >
            <span className={`material-symbols-outlined text-3xl ${iconColor}`}>{icon}</span>
            {isUnread && (
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <path d="M10 10 Q 50 20 90 10" fill="none" stroke="black" strokeWidth="2" />
                    </svg>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-[16px] text-slate-800 truncate">{title}</h3>
                {isUnread && (
                    <span className="flex-shrink-0 text-[10px] font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        NEW
                    </span>
                )}
            </div>
            <p className={`mt-1 text-[13px] ${isUnread ? '' : 'text-slate-600 italic'}`}>{description}</p>

            {timestamp && (
                <div className="mt-1 text-[10px] text-slate-400 font-normal uppercase tracking-wider">{timestamp}</div>
            )}

            {actions.length > 0 && (
                <div className="mt-4 flex space-x-3">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`text-xs font-normal px-2 py-1 rounded-md transition-all ${buttonClass}`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Action icons */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
            {isUnread && onMarkAsRead && (
                <button
                    onClick={onMarkAsRead}
                    title="Mark as read"
                    className="text-slate-300 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">done</span>
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    title="Delete"
                    className="text-slate-300 hover:text-red-400 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            )}
        </div>
    </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ROTATIONS = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];

// ─── Notification List ────────────────────────────────────────────────────────

function NotificationList({ items, isUnread, onMarkAsRead, onDelete }) {
    if (!items.length) {
        return <p className="text-sm text-slate-400 italic text-center py-6">Nothing here yet.</p>;
    }

    return (
        <div className="grid gap-4">
            {items.map((n, i) => {
                const cfg = resolveConfig(n.type, n.data);
                return (
                    <NotificationCard
                        key={n.id}
                        icon={cfg.icon}
                        iconBgColor={cfg.iconBgColor}
                        iconColor={cfg.iconColor}
                        buttonClass={cfg.buttonClass}
                        title={cfg.title}
                        description={cfg.description}
                        timestamp={relativeTime(n.created_at)}
                        isUnread={isUnread}
                        actions={buildActions(n.data)}
                        rotation={ROTATIONS[i % ROTATIONS.length]}
                        hasPin={isUnread && i === 0}
                        onMarkAsRead={isUnread ? () => onMarkAsRead(n.id) : undefined}
                        onDelete={() => onDelete(n.id)}
                    />
                );
            })}
        </div>
    );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, children }) {
    return (
        <section>
            <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{label}</h2>
                <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            {children}
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export const NotificationsFooter = () => (
    <div className="mt-20 pt-10 border-t border-slate-200 border-dashed flex justify-between items-center text-slate-400">
        <p className="font-handwriting text-xl rotate-2">End of the roll...</p>
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export const Notifications = () => {
    const { notifications, loading, loadingMore, hasMore, loadMore, markAsRead, markAllAsRead, deleteNotification } =
        useNotifications();

    const unread = useMemo(() => notifications.filter((n) => !n.read_at), [notifications]);
    const read   = useMemo(() => notifications.filter((n) =>  n.read_at), [notifications]);

    return (
        <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8 min-h-screen relative overflow-hidden">
            <div className="absolute top-20 right-20 opacity-10 pointer-events-none rotate-12">
                <span className="material-symbols-outlined text-[120px]">coffee</span>
            </div>
            <div className="absolute bottom-10 left-10 opacity-10 pointer-events-none -rotate-12">
                <span className="material-symbols-outlined text-[80px]">gesture</span>
            </div>

            <div className="max-w-4xl mx-auto">
                <NotificationsHeader onMarkAllAsRead={markAllAsRead} />

                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="material-icons-round text-primary text-[40px] animate-spin">sync</span>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {unread.length > 0 && (
                            <Section label="New">
                                <NotificationList
                                    items={unread}
                                    isUnread={true}
                                    onMarkAsRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            </Section>
                        )}

                        <Section label="Earlier">
                            <NotificationList
                                items={read}
                                isUnread={false}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                            />
                        </Section>
                    </div>
                )}

                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            {loadingMore ? 'Loading...' : 'Load more'}
                        </button>
                    </div>
                )}

                <NotificationsFooter />
            </div>
        </main>
    );
};
