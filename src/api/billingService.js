import { apiClient } from './apiClient';

export const billingService = {
    getPlans: () => apiClient('/billing/plans'),

    getSubscription: () => apiClient('/billing/subscription'),

    subscribe: (plan, interval, currency = 'ngn') =>
        apiClient('/billing/subscribe', {
            method: 'POST',
            body: { plan, interval, currency },
        }),

    cancel: () => apiClient('/billing/cancel', { method: 'POST' }),

    verify: (reference) =>
        apiClient(`/billing/verify?reference=${encodeURIComponent(reference)}`),
};
