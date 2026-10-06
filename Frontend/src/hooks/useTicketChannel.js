import { useEffect, useRef } from 'react';
import echo from '../lib/echo';

export function useTicketChannel(ticketId, onMessage, onStatusUpdate) {
    // Keep refs so the echo listener always calls the latest callback
    // without needing to re-subscribe when the callback identity changes.
    const onMessageRef = useRef(onMessage);
    const onStatusRef = useRef(onStatusUpdate);
    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
    useEffect(() => { onStatusRef.current = onStatusUpdate; }, [onStatusUpdate]);

    useEffect(() => {
        if (!ticketId) return;

        const channel = echo.private(`tickets.${ticketId}`);

        channel.listen('TicketMessageSent', (e) => {
            onMessageRef.current?.(e.message);
        });

        channel.listen('TicketStatusUpdated', (e) => {
            onStatusRef.current?.(e);
        });

        return () => echo.leave(`tickets.${ticketId}`);
    }, [ticketId]); // only re-subscribe if ticket changes
}

export function useAdminTicketsChannel(onNewTicket) {
    const onNewTicketRef = useRef(onNewTicket);
    useEffect(() => { onNewTicketRef.current = onNewTicket; }, [onNewTicket]);

    useEffect(() => {
        if (!onNewTicket) return; // not an admin — don't subscribe

        const channel = echo.private('admin.tickets');

        channel.listen('TicketCreated', (e) => {
            onNewTicketRef.current?.(e.ticket);
        });

        return () => echo.leave('admin.tickets');
    }, [!!onNewTicket]); // subscribe/unsubscribe based on admin status
}
