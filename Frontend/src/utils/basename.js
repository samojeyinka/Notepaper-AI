// Must match the `basename` passed to createBrowserRouter in AppRoutes.jsx.
// react-router only prepends this for <Link>/navigate() — anything opened via
// window.open()/window.location has to prepend it manually.
//
// The app is deployed on its own subdomain, so the basename is empty (root).
// Set VITE_APP_BASENAME=/notepaperai only if you ever serve it from a subfolder.
export const APP_BASENAME = import.meta.env.VITE_APP_BASENAME || '';
