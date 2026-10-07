# NotepaperAI

AI-powered note-taking app with Laravel backend and React + Vite frontend.

## Quick Start

### Backend
```bash
cd Backend
composer install
cp .env.example .env   # set DB_*, mail, frontend origins, API keys
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan queue:work --queue=default,ai
php artisan reverb:start   # realtime progress events
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

See deployment_guide.md / deployment-guide.html for production deployment.
