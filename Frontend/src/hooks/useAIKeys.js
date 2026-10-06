import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiKeysService } from '../api/aiKeysService';

const STORAGE_KEY = 'np_ai_keys';

// In-memory cache — survives re-mounts within the same session.
let _cache = null;
let _cacheUserId = null;
let _fetching = false;
let _listeners = [];

const notify = (data, userId) => {
    _cache = data;
    _cacheUserId = userId;
    _fetching = false;
    _listeners.forEach((fn) => fn({ userId, data }));
    _listeners = [];
};

const storageKey = (userId) => `${STORAGE_KEY}:${userId}`;

/**
 * Strip the payload down to non-sensitive metadata before persisting it.
 *
 * `masked_key` is deliberately dropped: it exposes the first and last four
 * characters of a real key, and no part of a key should ever reach web storage.
 */
const toStorable = (data) => ({
    default_provider: data?.default_provider ?? null,
    presets: data?.presets ?? {},
    providers: Object.fromEntries(
        Object.entries(data?.providers ?? {}).map(([id, p]) => [
            id,
            {
                provider: p?.provider,
                label: p?.label,
                has_key: !!p?.has_key,
                model: p?.model ?? null,
                is_default: !!p?.is_default,
            },
        ])
    ),
});

const readStored = (userId) => {
    if (!userId) return null;

    try {
        const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) || 'null');

        return parsed?.providers ? parsed : null;
    } catch {
        return null;
    }
};

const writeStored = (userId, data) => {
    if (!userId || !data) return;

    try {
        localStorage.setItem(storageKey(userId), JSON.stringify(toStorable(data)));
    } catch {
        // Quota exceeded or private mode — the in-memory cache still works.
    }
};

const fetchKeys = (userId) =>
    aiKeysService
        .get()
        .then((res) => {
            const payload = res?.data ?? res;

            writeStored(userId, payload);
            notify(payload, userId);
        })
        .catch(() => {
            _fetching = false;
            _listeners = [];
        });

// Tiny event bus so ANY component can open the single AI-key modal.
const _modalListeners = new Set();

export const openAIKeyModal = () => _modalListeners.forEach((fn) => fn());
export const subscribeAIKeyModal = (fn) => {
    _modalListeners.add(fn);

    return () => _modalListeners.delete(fn);
};

/**
 * Read + manage the current user's AI provider keys.
 * `hasKeys` is the frontend gate replacing the old paid-plan gate.
 *
 * Stale-while-revalidate: the last known metadata is restored synchronously from
 * localStorage so the UI renders on first paint, and the network refresh runs in
 * the background to stay accurate.
 */
export const useAIKeys = () => {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [result, setResult] = useState({ userId: null, data: null });

    /**
     * Derived rather than stored: the user id lives in AuthContext, so the value
     * is recomputed whenever the account changes. Reading storage here is what
     * lets the panel paint on first render instead of after a round trip.
     */
    const data = useMemo(() => {
        if (!userId) return null;
        if (result.userId === userId) return result.data;
        if (_cacheUserId === userId) return _cache;

        return readStored(userId);
    }, [userId, result]);

    useEffect(() => {
        // Signing out must not leave the previous account's keys in memory.
        if (!userId) {
            _cache = null;
            _cacheUserId = null;

            return;
        }

        // A different account must never inherit the previous one's cache.
        if (_cacheUserId !== userId) {
            _cache = null;
            _fetching = false;
            _listeners = [];
        }

        // Fresh in-session copy: nothing to revalidate.
        if (_cache) return;

        _fetching = true;
        _listeners.push(setResult);

        fetchKeys(userId);
    }, [userId]);

    // Keep this tab in step when keys change in another one.
    useEffect(() => {
        if (!userId) return undefined;

        const onStorage = (event) => {
            if (event.key !== storageKey(userId)) return;

            const incoming = readStored(userId);

            if (incoming) setResult({ userId, data: incoming });

            _cache = null;

            if (!_fetching) {
                _fetching = true;
                _listeners.push(setResult);
                fetchKeys(userId);
            }
        };

        window.addEventListener('storage', onStorage);

        return () => window.removeEventListener('storage', onStorage);
    }, [userId]);

    const refresh = useCallback(() => {
        fetchKeys(userId);
    }, [userId]);

    const save = useCallback(
        async ({ provider, key, model, is_default = true }) => {
            await aiKeysService.save({ provider, key, model, is_default });

            return fetchKeys(userId);
        },
        [userId]
    );

    const verify = useCallback(({ provider, key, model }) => aiKeysService.verify({ provider, key, model }), []);

    const setDefault = useCallback(
        async (provider) => {
            await aiKeysService.setDefault(provider);

            return fetchKeys(userId);
        },
        [userId]
    );

    const remove = useCallback(
        async (provider) => {
            await aiKeysService.remove(provider);

            return fetchKeys(userId);
        },
        [userId]
    );

    const { providers, presets, hasKeys, defaultProvider, hasProvider } = useMemo(() => {
        const providerMap = data?.providers ?? {};

        return {
            providers: providerMap,
            presets: data?.presets ?? {},
            hasKeys: Object.values(providerMap).some((p) => p?.has_key),
            defaultProvider: data?.default_provider ?? null,
            hasProvider: (id) => !!providerMap[id]?.has_key,
        };
    }, [data]);

    /**
     * The provider that AI calls will use, for display only.
     * Decrypted keys are never exposed to the client.
     */
    const getActiveProvider = useCallback(() => {
        if (!hasKeys) return null;
        if (defaultProvider) return defaultProvider;

        return Object.entries(providers).find(([, p]) => p?.has_key)?.[0] ?? null;
    }, [providers, defaultProvider, hasKeys]);

    return {
        data,
        loaded: !!data,
        hasKeys,
        hasProvider,
        defaultProvider,
        providers,
        presets,
        refresh,
        save,
        verify,
        setDefault,
        remove,
        getActiveProvider,
        openModal: openAIKeyModal,
    };
};
