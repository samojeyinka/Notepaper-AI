import { useMemo } from 'react';
import Loader from './globals/Loader';
import { useNotifications } from '../context/NotificationsContext';
import NotificationIcon from './user/NotificationIcon';

// ─── Type → display config ────────────────────────────────────────────────────
// Restrained, semantic palette: plum for AI/support, emerald = enabled,
// amber = warning, stone = neutral. Button tints mirror the icon tint.

const PLUM = {
    iconBgColor: 'bg-plum-50',
    iconColor: 'text-plum-700',
    buttonClass: 'bg-plum-600 hover:bg-plum-700 text-white',
};
const EMERALD = {
    iconBgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
};
const AMBER = {
    iconBgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
};
const STONE = {
    iconBgColor: 'bg-stone-100',
    iconColor: 'text-stone-600',
    buttonClass: 'bg-stone-900 hover:bg-stone-800 text-white',
};

const TYPE_CONFIG = {
    'App\\Notifications\\NoteReverted':       { icon: 'history',            ...STONE },
    'App\\Notifications\\TwoFAEnabled':       { icon: 'lock',               ...EMERALD },
    'App\\Notifications\\TwoFADisabled':      { icon: 'lock_open',          ...AMBER },
    'App\\Notifications\\TicketCreated':      { icon: 'confirmation_number',...PLUM },
    'App\\Notifications\\TicketNewMessage':   { icon: 'chat',               ...PLUM },
    'App\\Notifications\\ExpandTopicDone':    { icon: 'lightbulb',          ...PLUM },
    'App\\Notifications\\SimplifyTopicDone':  { icon: 'filter_alt',         ...STONE },
};

const DEFAULT_CONFIG = { icon: 'notifications', ...STONE };

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
            onClick: () => window.open(data.url, '_blank'),
        },
    ];
}

// ─── Header ───────────────────────────────────────────────────────────────────

export const NotificationsHeader = ({ onMarkAllAsRead, hasUnread }) => (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
            <p className="eyebrow text-plum-700 mb-1.5">Activity</p>
            <h1 className="font-display-serif text-[26px] md:text-[32px] font-semibold tracking-tight text-stone-900 leading-tight">
                Notifications
            </h1>
            <p className="text-[13px] text-stone-500 mt-1">Everything your account and Schola have been up to.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
            <button
                onClick={onMarkAllAsRead}
                disabled={!hasUnread}
                className="flex items-center gap-1.5 text-[13px] font-medium text-stone-600 hover:text-plum-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <span className="material-icons-round text-[18px]">done_all</span>
                Mark all as read
            </button>
            <NotificationIcon />
        </div>
    </header>
);

// ─── Row action button ────────────────────────────────────────────────────────

const RowAction = ({ icon, title, onClick, danger }) => (
    <button
        onClick={onClick}
        title={title}
        className={`w-8 h-8 flex items-center justify-center transition-colors ${
            danger
                ? 'text-stone-400 hover:text-red-500 hover:bg-red-50'
                : 'text-stone-400 hover:text-plum-700 hover:bg-plum-50'
        }`}
    >
        <span className="material-icons-round text-[18px]">{icon}</span>
    </button>
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
    onMarkAsRead,
    onDelete,
}) => (
    <div
        className={`group relative flex items-start gap-3.5 p-4 border transition-colors overflow-hidden ${
            isUnread ? 'bg-plum-50/50 border-plum-200' : 'bg-white border-stone-200 hover:border-stone-300'
        }`}
    >
        {/* Unread accent */}
        {isUnread && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-plum-600" />}

        {/* Icon */}
        <div className={`w-10 h-10 shrink-0 border border-stone-200/70 flex items-center justify-center ${iconBgColor}`}>
            <span className={`material-icons-round text-[20px] ${iconColor}`}>{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-[14px] text-stone-900 truncate">{title}</h3>
                {isUnread && (
                    <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-plum-700 bg-plum-100 px-1.5 py-0.5">
                        New
                    </span>
                )}
            </div>
            {description && (
                <p className="mt-0.5 text-[13px] text-stone-500 leading-relaxed">{description}</p>
            )}

            <div className="mt-2 flex items-center gap-3 flex-wrap">
                {timestamp && (
                    <span className="text-[11px] text-stone-400 uppercase tracking-wider">{timestamp}</span>
                )}
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`text-[11px] font-medium px-2.5 py-1 transition-colors ${buttonClass}`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Row actions — always visible on touch, on hover on desktop */}
        <div className="flex items-center gap-0.5 shrink-0 self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {isUnread && onMarkAsRead && (
                <RowAction icon="done" title="Mark as read" onClick={onMarkAsRead} />
            )}
            {onDelete && (
                <RowAction icon="close" title="Delete" onClick={onDelete} danger />
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

// ─── Notification List ────────────────────────────────────────────────────────

function NotificationList({ items, isUnread, onMarkAsRead, onDelete }) {
    if (!items.length) {
        return <p className="text-[13px] text-stone-400 text-center py-6">Nothing here yet.</p>;
    }

    return (
        <div className="grid gap-3">
            {items.map((n) => {
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
                        onMarkAsRead={isUnread ? () => onMarkAsRead(n.id) : undefined}
                        onDelete={() => onDelete(n.id)}
                    />
                );
            })}
        </div>
    );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, count, children }) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-3">
                <h2 className="eyebrow text-stone-400">{label}</h2>
                {count != null && <span className="text-[11px] font-medium text-stone-400">{count}</span>}
                <div className="h-px flex-1 bg-stone-200" />
            </div>
            {children}
        </section>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-plum-50 text-plum-600 flex items-center justify-center mb-4">
            <span className="material-icons-round text-[26px]">notifications_none</span>
        </div>
        <h3 className="font-display-serif text-[20px] font-semibold text-stone-900 mb-1">You're all caught up</h3>
        <p className="text-[13px] text-stone-500">New activity will show up here.</p>
    </div>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

export const NotificationsFooter = () => (
    <div className="mt-16 pt-6 border-t border-stone-200 text-center">
        <p className="text-[12px] text-stone-400">That's everything for now.</p>
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export const Notifications = () => {
    const { notifications, loading, loadingMore, hasMore, loadMore, markAsRead, markAllAsRead, deleteNotification } =
        useNotifications();

    const unread = useMemo(() => notifications.filter((n) => !n.read_at), [notifications]);
    const read   = useMemo(() => notifications.filter((n) =>  n.read_at), [notifications]);

    return (
        <main className="flex-1 lg:ml-64 p-4 lg:p-10 pt-20 lg:pt-10 min-h-screen bg-paper font-display text-stone-900">
            <div className="max-w-3xl mx-auto">
                <NotificationsHeader onMarkAllAsRead={markAllAsRead} hasUnread={unread.length > 0} />

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader size="xl" />
                    </div>
                ) : notifications.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-10">
                        {unread.length > 0 && (
                            <Section label="New" count={unread.length}>
                                <NotificationList
                                    items={unread}
                                    isUnread={true}
                                    onMarkAsRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            </Section>
                        )}

                        {read.length > 0 && (
                            <Section label="Earlier" count={read.length}>
                                <NotificationList
                                    items={read}
                                    isUnread={false}
                                    onMarkAsRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            </Section>
                        )}
                    </div>
                )}

                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-[13px] font-medium text-stone-600 hover:border-plum-400 hover:text-plum-700 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-icons-round text-[18px]">expand_more</span>
                            {loadingMore ? 'Loading…' : 'Load more'}
                        </button>
                    </div>
                )}

                <NotificationsFooter />
            </div>
        </main>
    );
};
