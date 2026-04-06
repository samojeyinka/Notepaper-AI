import '@/styles/App.css'
import { RouterProvider } from 'react-router-dom'
import AppRoutes from './utils/AppRoutes'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={AppRoutes} />
    </AuthProvider>
  )
}

export default App
