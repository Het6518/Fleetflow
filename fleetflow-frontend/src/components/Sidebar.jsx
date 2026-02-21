import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart3, LogOut, Zap, ShieldCheck, DollarSign
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const ALL_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE'] },
  { to: '/vehicles', label: 'Vehicles', icon: Truck, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/drivers', label: 'Drivers', icon: Users, roles: ['MANAGER', 'SAFETY'] },
  { to: '/trips', label: 'Trips', icon: Route, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['MANAGER', 'SAFETY'] },
  { to: '/fuel', label: 'Fuel Logs', icon: Fuel, roles: ['MANAGER', 'DISPATCHER', 'FINANCE'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['MANAGER', 'FINANCE'] },
]

const ROLE_COLORS = {
  MANAGER: 'bg-brand-600/20 text-brand-400',
  DISPATCHER: 'bg-amber-600/20 text-amber-400',
  SAFETY: 'bg-emerald-600/20 text-emerald-400',
  FINANCE: 'bg-violet-600/20 text-violet-400',
}

export default function Sidebar() {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const links = ALL_LINKS.filter((l) => l.roles.includes(role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">FleetFlow</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-2">Navigation</p>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${ROLE_COLORS[role]}`}>{role}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
