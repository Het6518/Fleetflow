import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import Fuel from './pages/Fuel'
import Analytics from './pages/Analytics'

export default function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected – Dashboard Layout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['MANAGER', 'DISPATCHER']}><Vehicles /></ProtectedRoute>} />
          <Route path="/drivers" element={<ProtectedRoute allowedRoles={['MANAGER', 'SAFETY']}><Drivers /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute allowedRoles={['MANAGER', 'DISPATCHER']}><Trips /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['MANAGER', 'SAFETY']}><Maintenance /></ProtectedRoute>} />
          <Route path="/fuel" element={<ProtectedRoute allowedRoles={['MANAGER', 'DISPATCHER', 'FINANCE']}><Fuel /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRoles={['MANAGER', 'FINANCE']}><Analytics /></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}
