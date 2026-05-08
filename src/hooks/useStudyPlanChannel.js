import { useEffect, useRef } from 'react';
import echo from '../lib/echo';

export function useStudyPlanChannel(planId, { onProgress, onReady, onFailed } = {}) {
    const refs = useRef({ onProgress, onReady, onFailed });
    useEffect(() => { refs.current = { onProgress, onReady, onFailed }; });

    useEffect(() => {
        if (!planId) return;

        const channel = echo.private(`study-plans.${planId}`);

        channel.listen('StudyPlanGenerationProgress', (e) => {
            if (e.progress === 100 && e.schedule) {
                refs.current.onReady?.(e);
            } else if (e.progress === -1) {
                refs.current.onFailed?.(e);
            } else {
                refs.current.onProgress?.(e);
            }
        });

        return () => echo.leave(`study-plans.${planId}`);
    }, [planId]);
}
