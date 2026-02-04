import '@/styles/App.css'
import { RouterProvider } from 'react-router-dom'
import AppRoutes from './utils/AppRoutes'


function App() {

  return (
  <>
   <RouterProvider router={AppRoutes} />
  </>
  )
}

export default App
