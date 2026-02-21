export default function KPICard({ title, value, subtitle, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand: 'from-brand-600/20 to-brand-500/5 border-brand-600/20 text-brand-400',
    emerald: 'from-emerald-600/20 to-emerald-500/5 border-emerald-600/20 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-500/5 border-amber-600/20 text-amber-400',
    red: 'from-red-600/20 to-red-500/5 border-red-600/20 text-red-400',
    violet: 'from-violet-600/20 to-violet-500/5 border-violet-600/20 text-violet-400',
  }

  return (
    <div className={`glass-card bg-gradient-to-br ${colors[color]} p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg bg-gray-800/60`}>
            <Icon size={18} className={colors[color].split(' ')[3]} />
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value ?? '–'}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {trend !== undefined && (
        <p className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </p>
      )}
    </div>
  )
}
