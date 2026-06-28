import { useCallback, useEffect, useRef, useState } from 'react';
import { billingService } from '../api/billingService';
import { useAuth } from '../context/AuthContext';

export const useBilling = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading]       = useState(false);
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

    const txFetched = useRef(false);

    const fetchTransactions = useCallback(async () => {
        if (!user || txFetched.current) return;
        txFetched.current = true;
        setTxLoading(true);
        try {
            const res = await billingService.getTransactions();
            setTransactions(res?.data ?? []);
        } catch {
            txFetched.current = false; // allow retry on error
            setTransactions([]);
        } finally {
            setTxLoading(false);
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

    return {
        subscription,
        transactions,
        txLoading,
        loading,
        error,
        subscribe,
        cancel,
        refetch: fetchSubscription,
        fetchTransactions,
    };
};
