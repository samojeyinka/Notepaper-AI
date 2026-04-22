import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
const forceTLS = scheme === 'https';

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS,
    enabledTransports: forceTLS ? ['wss'] : ['ws'],
    // Custom authorizer so the auth request includes cookies (no localStorage token)
    authorizer: (channel) => ({
        authorize: async (socketId, callback) => {
            try {
                const res = await fetch(`${BASE_URL}/broadcasting/auth`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                });
                const data = await res.json();
                callback(null, data);
            } catch (err) {
                callback(err, null);
            }
        },
    }),
});

window.echo = echo; // 👈 add this temporarily

export default echo;
