import { useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

// Module-level cache — survives re-mounts within the same session
let _cache = null;
let _fetching = false;
let _listeners = [];

const notify = (data) => {
    _cache = data;
    _fetching = false;
    _listeners.forEach((fn) => fn(data));
    _listeners = [];
};

export const usePlan = () => {
    const { user } = useAuth();
    const [usage, setUsage] = useState(_cache);

    useEffect(() => {
        if (!user) return;

        if (_cache) {
            setUsage(_cache);
            return;
        }

        // If a fetch is already in-flight, queue this setter
        if (_fetching) {
            _listeners.push(setUsage);
            return;
        }

        _fetching = true;
        _listeners.push(setUsage);

        apiClient('/users/usage')
            .then((res) => notify(res?.data ?? res))
            .catch(() => {
                _fetching = false;
                _listeners = [];
            });
    }, [user]);

    /** Returns true if the user can still use the feature today */
    const canUseAI = (feature) => {
        if (!usage) return true; // optimistic while loading
        const rem = usage.remaining?.[feature];
        return rem === null || rem === undefined || rem > 0; // null = unlimited
    };

    /** Remaining count for a feature. null = unlimited, undefined = loading */
    const remaining = (feature) => usage?.remaining?.[feature] ?? undefined;

    /** Call after a successful AI generation to refresh the cache */
    const invalidate = () => {
        _cache = null;
        apiClient('/users/usage')
            .then((res) => {
                _cache = res?.data ?? res;
                setUsage(_cache);
            })
            .catch(() => {});
    };

    /** Increment usage for a feature on the backend, then refresh cache */
    const increment = async (feature) => {
        try {
            await apiClient('/users/usage/increment', { method: 'POST', body: { feature } });
            invalidate();
        } catch (_) {}
    };

    return {
        plan: usage?.plan ?? 'free',
        isPaid: usage?.is_paid ?? false,
        canUseAI,
        remaining,
        invalidate,
        increment,
        loaded: !!usage,
    };
};
