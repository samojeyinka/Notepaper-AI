import '@/styles/App.css'
import { RouterProvider } from 'react-router-dom'
import AppRoutes from './utils/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { HelmetProvider } from 'react-helmet-async'

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <NotificationsProvider>
          <RouterProvider router={AppRoutes} />
        </NotificationsProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
