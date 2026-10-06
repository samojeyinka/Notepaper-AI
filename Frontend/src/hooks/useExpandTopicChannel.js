import { useEffect, useRef } from 'react';
import echo from '../lib/echo';

export function useExpandTopicChannel(id, onReady) {
    const callbackRef = useRef(onReady);
    useEffect(() => { callbackRef.current = onReady; }, [onReady]);

    useEffect(() => {
        if (!id) return;

        const channel = echo.private(`expand-topic.${id}`);

        channel.listen('ExpandTopicReady', (e) => {
            callbackRef.current?.(e);
        });

        return () => echo.leave(`expand-topic.${id}`);
    }, [id]);
}
