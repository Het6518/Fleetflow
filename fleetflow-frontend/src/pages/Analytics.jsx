import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import KPICard from '../components/KPICard'
import { TrendingUp, Fuel, Wrench, Car } from 'lucide-react'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
        <p className="text-white font-medium">{payload[0].name}</p>
        <p className="text-brand-400">₹{Number(payload[0].value).toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [vehicleAnalytics, setVehicleAnalytics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/analytics/dashboard'), api.get('/vehicles')])
      .then(async ([dash, veh]) => {
        setDashboard(dash.data.data)
        const vList = veh.data.data.vehicles.slice(0, 5)
        setVehicles(vList)
        // Fetch per-vehicle analytics
        const analytics = await Promise.all(vList.map(v => api.get(`/analytics/vehicle/${v.id}`).then(r => r.data.data)))
        setVehicleAnalytics(analytics)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading analytics..." />

  const { summary, breakdown } = dashboard || {}

  const barData = vehicleAnalytics.map(a => ({
    name: a.vehicle?.name?.split(' ')[0] || 'N/A',
    Revenue: a.analytics?.totalRevenue || 0,
    'Fuel Cost': a.analytics?.totalFuelCost || 0,
    'Maint. Cost': a.analytics?.totalMaintenanceCost || 0,
  }))

  const pieData = [
    { name: 'Available', value: breakdown?.vehiclesByStatus?.AVAILABLE || 0 },
    { name: 'On Trip', value: breakdown?.vehiclesByStatus?.ON_TRIP || 0 },
    { name: 'In Shop', value: breakdown?.vehiclesByStatus?.IN_SHOP || 0 },
    { name: 'Retired', value: breakdown?.vehiclesByStatus?.RETIRED || 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`₹${(summary?.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="emerald" />
        <KPICard title="Total Fuel Cost" value={`₹${(summary?.totalFuelCost || 0).toLocaleString()}`} icon={Fuel} color="amber" />
        <KPICard title="Maintenance" value={`₹${(summary?.totalMaintenanceCost || 0).toLocaleString()}`} icon={Wrench} color="red" />
        <KPICard title="Net Profit" value={`₹${(summary?.netProfit || 0).toLocaleString()}`} icon={TrendingUp} color={summary?.netProfit >= 0 ? 'emerald' : 'red'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Cost Bar Chart */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Revenue vs Costs (Per Vehicle)</h3>
          {barData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No completed trips yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fuel Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Maint. Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fleet Distribution Pie */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Fleet Status Distribution</h3>
          {pieData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No vehicles registered</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Vehicles']} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per-Vehicle Analytics Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-semibold text-white">Per-Vehicle Performance</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Vehicle', 'Trips', 'KM Covered', 'Fuel Eff. (km/L)', 'Fuel Cost', 'Maint. Cost', 'Revenue', 'ROI %'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {vehicleAnalytics.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">No data yet</td></tr>
            ) : vehicleAnalytics.map((a, i) => (
              <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-4 text-white font-medium">{a.vehicle?.name}</td>
                <td className="p-4 text-gray-400">{a.analytics?.completedTrips}</td>
                <td className="p-4 text-gray-400">{a.analytics?.totalKmCovered?.toLocaleString()} km</td>
                <td className="p-4">
                  <span className={a.analytics?.fuelEfficiencyKmPerLiter ? 'text-emerald-400' : 'text-gray-500'}>
                    {a.analytics?.fuelEfficiencyKmPerLiter ?? '–'}
                  </span>
                </td>
                <td className="p-4 text-amber-400">₹{a.analytics?.totalFuelCost?.toLocaleString()}</td>
                <td className="p-4 text-red-400">₹{a.analytics?.totalMaintenanceCost?.toLocaleString()}</td>
                <td className="p-4 text-emerald-400">₹{a.analytics?.totalRevenue?.toLocaleString()}</td>
                <td className="p-4">
                  {a.analytics?.roiPercent !== null ? (
                    <span className={a.analytics?.roiPercent >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                      {a.analytics?.roiPercent}%
                    </span>
                  ) : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
