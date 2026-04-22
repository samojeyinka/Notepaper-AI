import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import echo from '../lib/echo';
import { notificationService } from '../api/notificationService';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchPage = useCallback(async (page) => {
        const res = await notificationService.list(page);
        return res.data;
    }, []);

    // Load on first mount (once per session — persists across route changes)
    useEffect(() => {
        if (!user?.id) return;
        fetchPage(1)
            .then((paginator) => {
                setNotifications(paginator.data ?? []);
                setCurrentPage(paginator.current_page);
                setLastPage(paginator.last_page);
            })
            .finally(() => setLoading(false));
    }, [user?.id, fetchPage]);

    // Real-time: push incoming notification to the top, skip duplicates
    useEffect(() => {
        if (!user?.id) return;

        const channel = echo.private(`App.Models.User.${user.id}`);

        channel.notification((notification) => {
            setNotifications((prev) => {
                if (prev.some((n) => n.id === notification.id)) return prev;
                return [
                    {
                        id: notification.id,
                        type: notification.type,
                        data: Object.fromEntries(
                            Object.entries(notification).filter(([k]) => k !== 'id' && k !== 'type')
                        ),
                        read_at: null,
                        created_at: new Date().toISOString(),
                    },
                    ...prev,
                ];
            });
        });

        return () => echo.leave(`App.Models.User.${user.id}`);
    }, [user?.id]);

    const loadMore = useCallback(async () => {
        if (loadingMore || currentPage >= lastPage) return;
        setLoadingMore(true);
        try {
            const paginator = await fetchPage(currentPage + 1);
            setNotifications((prev) => [...prev, ...(paginator.data ?? [])]);
            setCurrentPage(paginator.current_page);
            setLastPage(paginator.last_page);
        } finally {
            setLoadingMore(false);
        }
    }, [fetchPage, loadingMore, currentPage, lastPage]);

    const markAsRead = useCallback(async (id) => {
        await notificationService.markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
    }, []);

    const markAllAsRead = useCallback(async () => {
        await notificationService.markAllAsRead();
        const now = new Date().toISOString();
        setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    }, []);

    const deleteNotification = useCallback(async (id) => {
        await notificationService.delete(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const unreadCount = notifications.filter((n) => !n.read_at).length;
    const hasMore = currentPage < lastPage;

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                loading,
                loadingMore,
                hasMore,
                unreadCount,
                loadMore,
                markAsRead,
                markAllAsRead,
                deleteNotification,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
    return ctx;
}
