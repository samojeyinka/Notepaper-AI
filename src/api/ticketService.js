import { apiClient } from './apiClient';

export const ticketService = {
    list: () => apiClient('/users/tickets'),
    show: (id) => apiClient(`/users/tickets/${id}`),
    create: (data) => apiClient('/users/tickets', { method: 'POST', body: data }),
    sendMessage: (ticketId, data, socketId = null) =>
        apiClient(`/users/tickets/${ticketId}/messages`, {
            method: 'POST',
            body: data,
            ...(socketId ? { headers: { 'X-Socket-ID': socketId } } : {}),
        }),
    updateStatus: (ticketId, status) =>
        apiClient(`/users/tickets/${ticketId}/status`, { method: 'PATCH', body: { status } }),
};

export async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
    );

    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
}
