import { Bell, Search } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

export default function Navbar({ title }) {
  const { user } = useAuthStore()

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Search..."
            className="bg-gray-800 border border-gray-700 text-gray-300 placeholder-gray-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 w-52"
          />
        </div>
        <button className="relative p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
