import { useEffect, useState } from 'react'
import { Truck, Users, Route, Wrench, TrendingUp, Activity } from 'lucide-react'
import api from '../api/axios'
import KPICard from '../components/KPICard'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />

  const { summary, breakdown } = data || {}

  const vehicleStats = [
    { label: 'Available', val: breakdown?.vehiclesByStatus?.AVAILABLE, color: 'bg-emerald-500' },
    { label: 'On Trip', val: breakdown?.vehiclesByStatus?.ON_TRIP, color: 'bg-amber-500' },
    { label: 'In Shop', val: breakdown?.vehiclesByStatus?.IN_SHOP, color: 'bg-red-500' },
    { label: 'Retired', val: breakdown?.vehiclesByStatus?.RETIRED, color: 'bg-gray-500' },
  ]

  const tripStats = [
    { label: 'Draft', val: breakdown?.tripsByStatus?.DRAFT, color: 'bg-gray-500' },
    { label: 'Dispatched', val: breakdown?.tripsByStatus?.DISPATCHED, color: 'bg-brand-500' },
    { label: 'Completed', val: breakdown?.tripsByStatus?.COMPLETED, color: 'bg-emerald-500' },
    { label: 'Cancelled', val: breakdown?.tripsByStatus?.CANCELLED, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Overview</h2>
        <p className="text-gray-500 text-sm">Real-time fleet status and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Vehicles" value={summary?.totalVehicles} icon={Truck} color="brand" subtitle="In fleet" />
        <KPICard title="Active Drivers" value={breakdown?.driversByStatus?.ON_DUTY} icon={Users} color="emerald" subtitle="On duty" />
        <KPICard title="Active Trips" value={breakdown?.tripsByStatus?.DISPATCHED} icon={Route} color="amber" subtitle="Dispatched" />
        <KPICard title="In Maintenance" value={breakdown?.vehiclesByStatus?.IN_SHOP} icon={Wrench} color="red" subtitle="In shop" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`₹${(summary?.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="emerald" subtitle="From completed trips" />
        <KPICard title="Fuel Cost" value={`₹${(summary?.totalFuelCost || 0).toLocaleString()}`} icon={Activity} color="amber" subtitle="Total spent" />
        <KPICard title="Maintenance Cost" value={`₹${(summary?.totalMaintenanceCost || 0).toLocaleString()}`} icon={Wrench} color="red" subtitle="Total spent" />
        <KPICard title="Net Profit" value={`₹${(summary?.netProfit || 0).toLocaleString()}`} icon={TrendingUp} color={summary?.netProfit >= 0 ? 'emerald' : 'red'} subtitle="Revenue minus costs" />
      </div>

      {/* Vehicle & Trip Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Truck size={16} className="text-brand-400" /> Fleet Status
          </h3>
          <div className="space-y-3">
            {vehicleStats.map(({ label, val, color }) => {
              const pct = summary?.totalVehicles ? Math.round((val || 0) / summary.totalVehicles * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{val || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trip Status */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Route size={16} className="text-amber-400" /> Trip Status
          </h3>
          <div className="space-y-3">
            {tripStats.map(({ label, val, color }) => {
              const total = summary?.totalTrips || 1
              const pct = Math.round((val || 0) / total * 100)
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{val || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
