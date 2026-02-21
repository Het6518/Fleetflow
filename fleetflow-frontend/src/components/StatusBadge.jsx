const STATUS_CONFIG = {
  // Vehicle
  AVAILABLE: { label: 'Available', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  ON_TRIP: { label: 'On Trip', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  IN_SHOP: { label: 'In Shop', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  RETIRED: { label: 'Retired', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  // Driver
  ON_DUTY: { label: 'On Duty', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  OFF_DUTY: { label: 'Off Duty', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  SUSPENDED: { label: 'Suspended', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  // Trip
  DRAFT: { label: 'Draft', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  DISPATCHED: { label: 'Dispatched', cls: 'bg-brand-500/20 text-brand-400 border-brand-500/30' },
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {config.label}
    </span>
  )
}
