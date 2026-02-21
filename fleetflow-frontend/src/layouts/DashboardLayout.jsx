import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicle Registry',
  '/drivers': 'Driver Management',
  '/trips': 'Trip Dispatcher',
  '/maintenance': 'Maintenance Logs',
  '/fuel': 'Fuel Logs',
  '/analytics': 'Analytics & Reports',
}

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'FleetFlow'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
