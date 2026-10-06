import { useEffect, useRef } from 'react';
import echo from '../lib/echo';

export function useSimplifyTopicChannel(id, onReady) {
    const callbackRef = useRef(onReady);
    useEffect(() => { callbackRef.current = onReady; }, [onReady]);

    useEffect(() => {
        if (!id) return;

        const channel = echo.private(`simplify-topic.${id}`);

        channel.listen('SimplifyTopicReady', (e) => {
            callbackRef.current?.(e);
        });

        return () => echo.leave(`simplify-topic.${id}`);
    }, [id]);
}
