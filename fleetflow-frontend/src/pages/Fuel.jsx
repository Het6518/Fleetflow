import { useEffect, useState } from 'react'
import { Plus, Fuel as FuelIcon } from 'lucide-react'
import api from '../api/axios'
import Modal from '../components/Modal'
import InputField from '../components/InputField'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Fuel() {
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', date: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/fuel'), api.get('/vehicles')])
      .then(([f, v]) => { setLogs(f.data.data.logs); setVehicles(v.data.data.vehicles) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handle = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/fuel', { ...form, liters: +form.liters, cost: +form.cost, vehicleId: +form.vehicleId })
      toast.success('Fuel log added!')
      setShowCreate(false)
      setForm({ vehicleId: '', liters: '', cost: '', date: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const totalLiters = logs.reduce((s, l) => s + l.liters, 0)
  const totalCost = logs.reduce((s, l) => s + l.cost, 0)
  const avgCostPerLiter = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : 0

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 mb-1">Total Liters</p>
          <p className="text-2xl font-bold text-white">{totalLiters.toLocaleString()} L</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-white">₹{totalCost.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 mb-1">Avg ₹/Liter</p>
          <p className="text-2xl font-bold text-white">₹{avgCostPerLiter}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{logs.length} fuel entries</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Fuel Log
        </button>
      </div>

      {loading ? <LoadingSpinner text="Loading fuel logs..." /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Vehicle', 'Liters', 'Cost', 'Cost/L', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-10">No fuel logs</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-white font-medium">{l.vehicle?.name}</td>
                  <td className="p-4 text-gray-400">{l.liters} L</td>
                  <td className="p-4 text-gray-400">₹{l.cost.toLocaleString()}</td>
                  <td className="p-4 text-gray-500 text-xs">₹{(l.cost / l.liters).toFixed(2)}</td>
                  <td className="p-4 text-gray-400">{new Date(l.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Fuel Log">
        <form onSubmit={handle} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Vehicle</label>
            <select value={form.vehicleId} onChange={set('vehicleId')} required className="input-field">
              <option value="">Select vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Liters" type="number" step="0.01" value={form.liters} onChange={set('liters')} required placeholder="50" />
            <InputField label="Cost (₹)" type="number" step="0.01" value={form.cost} onChange={set('cost')} required placeholder="4500" />
            <InputField label="Date" type="date" value={form.date} onChange={set('date')} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Adding...' : 'Add Log'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
