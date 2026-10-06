import { useEffect, useRef } from 'react';
import echo from '../lib/echo';

export function useSprintChannel(sprintId, onChallengeContentReady) {
    const callbackRef = useRef(onChallengeContentReady);
    useEffect(() => { callbackRef.current = onChallengeContentReady; }, [onChallengeContentReady]);

    useEffect(() => {
        if (!sprintId) return;

        const channel = echo.private(`sprints.${sprintId}`);

        channel.listen('ChallengeContentReady', (e) => {
            callbackRef.current?.(e);
        });

        return () => echo.leave(`sprints.${sprintId}`);
    }, [sprintId]);
}
