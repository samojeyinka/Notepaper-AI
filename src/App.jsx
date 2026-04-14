import '@/styles/App.css'
import { RouterProvider } from 'react-router-dom'
import AppRoutes from './utils/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsContext'

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <RouterProvider router={AppRoutes} />
      </NotificationsProvider>
    </AuthProvider>
  )
}

export default App
