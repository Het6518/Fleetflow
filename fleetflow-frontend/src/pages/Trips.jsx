import { useEffect, useState } from 'react'
import { Plus, Send, CheckCircle, XCircle } from 'lucide-react'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import InputField, { SelectField } from '../components/InputField'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [completeModal, setCompleteModal] = useState({ open: false, trip: null })

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/trips'), api.get('/vehicles'), api.get('/drivers')
    ]).then(([t, v, d]) => {
      setTrips(t.data.data.trips)
      setVehicles(v.data.data.vehicles.filter(v => v.status === 'AVAILABLE'))
      setDrivers(d.data.data.drivers.filter(d => d.status === 'ON_DUTY'))
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDispatch = async (id) => {
    try { await api.patch(`/trips/${id}/dispatch`); toast.success('Trip dispatched!'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Dispatch failed') }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this trip?')) return
    try { await api.patch(`/trips/${id}/cancel`); toast.success('Trip cancelled'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Cancel failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{trips.length} trips total</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Create Trip
        </button>
      </div>

      {loading ? <LoadingSpinner text="Loading trips..." /> : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['#', 'Vehicle', 'Driver', 'Cargo (kg)', 'Revenue', 'Odometer', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {trips.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-500 py-10">No trips found</td></tr>
              ) : trips.map(t => (
                <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-gray-500 text-xs">#{t.id}</td>
                  <td className="p-4 text-white font-medium">{t.vehicle?.name}</td>
                  <td className="p-4 text-gray-400">{t.driver?.name}</td>
                  <td className="p-4 text-gray-400">{t.cargoWeight?.toLocaleString()}</td>
                  <td className="p-4 text-gray-400">{t.revenue ? `₹${t.revenue.toLocaleString()}` : '–'}</td>
                  <td className="p-4 text-gray-400 text-xs">
                    {t.startOdometer ?? '–'} → {t.endOdometer ?? '–'}
                  </td>
                  <td className="p-4"><StatusBadge status={t.status} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {t.status === 'DRAFT' && (
                        <button onClick={() => handleDispatch(t.id)} title="Dispatch"
                          className="p-1.5 rounded-lg hover:bg-brand-600/20 text-gray-400 hover:text-brand-400 transition-colors">
                          <Send size={13} />
                        </button>
                      )}
                      {t.status === 'DISPATCHED' && (
                        <button onClick={() => setCompleteModal({ open: true, trip: t })} title="Complete"
                          className="p-1.5 rounded-lg hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400 transition-colors">
                          <CheckCircle size={13} />
                        </button>
                      )}
                      {['DRAFT', 'DISPATCHED'].includes(t.status) && (
                        <button onClick={() => handleCancel(t.id)} title="Cancel"
                          className="p-1.5 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors">
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateTripModal isOpen={showCreate} onClose={() => setShowCreate(false)} vehicles={vehicles} drivers={drivers} onSave={() => { setShowCreate(false); load() }} />
      <CompleteModal isOpen={completeModal.open} trip={completeModal.trip} onClose={() => setCompleteModal({ open: false, trip: null })} onSave={() => { setCompleteModal({ open: false, trip: null }); load() }} />
    </div>
  )
}

function CreateTripModal({ isOpen, onClose, vehicles, drivers, onSave }) {
  const [form, setForm] = useState({ cargoWeight: '', vehicleId: '', driverId: '', revenue: '', startOdometer: '' })
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handle = async (e) => {
    e.preventDefault(); setLoading(true)
    const payload = { cargoWeight: +form.cargoWeight, vehicleId: +form.vehicleId, driverId: +form.driverId, revenue: form.revenue ? +form.revenue : undefined, startOdometer: form.startOdometer ? +form.startOdometer : undefined }
    try { await api.post('/trips', payload); toast.success('Trip created!'); onSave() }
    catch (err) { toast.error(err.response?.data?.message || 'Create failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Trip">
      <form onSubmit={handle} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Vehicle (Available)" value={form.vehicleId} onChange={set('vehicleId')} required>
            <option value="">Select vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate}</option>)}
          </SelectField>
          <SelectField label="Driver (On Duty)" value={form.driverId} onChange={set('driverId')} required>
            <option value="">Select driver</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </SelectField>
          <InputField label="Cargo Weight (kg)" type="number" value={form.cargoWeight} onChange={set('cargoWeight')} required placeholder="2000" />
          <InputField label="Revenue (₹)" type="number" value={form.revenue} onChange={set('revenue')} placeholder="Optional" />
          <InputField label="Start Odometer" type="number" value={form.startOdometer} onChange={set('startOdometer')} placeholder="Optional" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create Trip'}</button>
        </div>
      </form>
    </Modal>
  )
}

function CompleteModal({ isOpen, trip, onClose, onSave }) {
  const [form, setForm] = useState({ endOdometer: '', revenue: '' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.patch(`/trips/${trip.id}/complete`, { endOdometer: +form.endOdometer, revenue: form.revenue ? +form.revenue : undefined })
      toast.success('Trip completed!')
      onSave()
    } catch (err) { toast.error(err.response?.data?.message || 'Complete failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Trip">
      <form onSubmit={handle} className="space-y-4">
        <InputField label="End Odometer (km)" type="number" value={form.endOdometer} onChange={e => setForm(p => ({ ...p, endOdometer: e.target.value }))} required />
        <InputField label="Final Revenue (₹)" type="number" value={form.revenue} onChange={e => setForm(p => ({ ...p, revenue: e.target.value }))} placeholder="Optional" />
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Completing...' : 'Complete Trip'}</button>
        </div>
      </form>
    </Modal>
  )
}
