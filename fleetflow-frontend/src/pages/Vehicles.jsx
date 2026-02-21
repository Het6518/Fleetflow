import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Filter } from 'lucide-react'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import InputField, { SelectField } from '../components/InputField'
import LoadingSpinner from '../components/LoadingSpinner'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const STATUSES = ['ALL', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']
const EMPTY = { name: '', licensePlate: '', maxCapacity: '', acquisitionCost: '', odometer: '' }

export default function Vehicles() {
  const { role } = useAuthStore()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [modal, setModal] = useState({ open: false, mode: 'add', vehicle: null })

  const canMutate = ['MANAGER'].includes(role)

  const load = () => {
    setLoading(true)
    api.get('/vehicles').then(r => setVehicles(r.data.data.vehicles)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'ALL' ? vehicles : vehicles.filter(v => v.status === filter)

  const openAdd = () => setModal({ open: true, mode: 'add', vehicle: null })
  const openEdit = (v) => setModal({ open: true, mode: 'edit', vehicle: v })
  const closeModal = () => setModal({ open: false, mode: 'add', vehicle: null })

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return
    try {
      await api.delete(`/vehicles/${id}`)
      toast.success('Vehicle deleted')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-gray-500" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${filter === s ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        {canMutate && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Vehicle
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner text="Loading vehicles..." /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Name', 'License Plate', 'Capacity (kg)', 'Odometer', 'Acq. Cost', 'Status', canMutate ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-10">No vehicles found</td></tr>
              ) : filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 font-medium text-white">{v.name}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{v.licensePlate}</td>
                  <td className="p-4 text-gray-400">{v.maxCapacity.toLocaleString()}</td>
                  <td className="p-4 text-gray-400">{v.odometer.toLocaleString()} km</td>
                  <td className="p-4 text-gray-400">₹{v.acquisitionCost.toLocaleString()}</td>
                  <td className="p-4"><StatusBadge status={v.status} /></td>
                  {canMutate && (
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <VehicleModal
        isOpen={modal.open}
        onClose={closeModal}
        mode={modal.mode}
        vehicle={modal.vehicle}
        onSave={() => { closeModal(); load() }}
      />
    </div>
  )
}

function VehicleModal({ isOpen, onClose, mode, vehicle, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vehicle && mode === 'edit') {
      setForm({ name: vehicle.name, licensePlate: vehicle.licensePlate, maxCapacity: vehicle.maxCapacity, acquisitionCost: vehicle.acquisitionCost, odometer: vehicle.odometer })
    } else {
      setForm(EMPTY)
    }
  }, [vehicle, mode, isOpen])

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, maxCapacity: +form.maxCapacity, acquisitionCost: +form.acquisitionCost, odometer: +form.odometer }
    try {
      if (mode === 'add') { await api.post('/vehicles', payload); toast.success('Vehicle added!') }
      else { await api.patch(`/vehicles/${vehicle.id}`, payload); toast.success('Vehicle updated!') }
      onSave()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}>
      <form onSubmit={handle} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Vehicle Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Truck Alpha" />
          <InputField label="License Plate" value={form.licensePlate} onChange={e => setForm(p => ({ ...p, licensePlate: e.target.value }))} required placeholder="TRK-001" />
          <InputField label="Max Capacity (kg)" type="number" value={form.maxCapacity} onChange={e => setForm(p => ({ ...p, maxCapacity: e.target.value }))} required placeholder="5000" />
          <InputField label="Acquisition Cost (₹)" type="number" value={form.acquisitionCost} onChange={e => setForm(p => ({ ...p, acquisitionCost: e.target.value }))} required placeholder="750000" />
          <InputField label="Odometer (km)" type="number" value={form.odometer} onChange={e => setForm(p => ({ ...p, odometer: e.target.value }))} placeholder="0" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Vehicle'}</button>
        </div>
      </form>
    </Modal>
  )
}
