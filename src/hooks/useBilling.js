import { useCallback, useEffect, useState } from 'react';
import { billingService } from '../api/billingService';
import { useAuth } from '../context/AuthContext';

export const useBilling = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState(null);

    const fetchSubscription = useCallback(async () => {
        if (!user) return;
        try {
            const res = await billingService.getSubscription();
            setSubscription(res?.data ?? null);
        } catch {
            setSubscription(null);
        }
    }, [user]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    const subscribe = async (plan, interval, currency = 'ngn') => {
        setLoading(true);
        setError(null);
        try {
            const res = await billingService.subscribe(plan, interval, currency);
            const url = res?.data?.authorization_url;
            if (url) window.location.href = url;
        } catch (err) {
            setError(err?.message ?? 'Payment initialization failed.');
        } finally {
            setLoading(false);
        }
    };

    const cancel = async () => {
        setLoading(true);
        setError(null);
        try {
            await billingService.cancel();
            await fetchSubscription();
        } catch (err) {
            setError(err?.message ?? 'Could not cancel subscription.');
        } finally {
            setLoading(false);
        }
    };

    return { subscription, loading, error, subscribe, cancel, refetch: fetchSubscription };
};
