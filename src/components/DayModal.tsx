import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Circle, X } from 'lucide-react'
import type { DayData } from '../types'

interface Props {
  day: DayData
  onClose: () => void
  onSave: (d: DayData) => void
}

export default function DayModal({ day, onClose, onSave }: Props) {
  const [local, setLocal] = useState<DayData>(day)

  useEffect(() => {
    setLocal(day)
  }, [day])

  const setStatus = (s: DayData['status']) => setLocal(prev => ({ ...prev, status: s }))

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-indigo-950 border border-white/20 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{new Date(local.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <button type="button" onClick={() => setStatus('success')} className={`p-3 rounded-lg ${local.status==='success' ? 'bg-green-600/30 border border-green-500' : 'bg-white/5 border border-white/10'}`}>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-sm">Success</span>
            </div>
          </button>
          <button type="button" onClick={() => setStatus('failed')} className={`p-3 rounded-lg ${local.status==='failed' ? 'bg-red-600/30 border border-red-500' : 'bg-white/5 border border-white/10'}`}>
            <div className="flex flex-col items-center gap-1">
              <XCircle className="w-6 h-6 text-red-400" />
              <span className="text-sm">Struggled</span>
            </div>
          </button>
          <button type="button" onClick={() => setStatus(null)} className={`p-3 rounded-lg ${local.status===null ? 'bg-gray-600/30 border border-gray-500' : 'bg-white/5 border border-white/10'}`}>
            <div className="flex flex-col items-center gap-1">
              <Circle className="w-6 h-6 text-gray-400" />
              <span className="text-sm">Clear</span>
            </div>
          </button>
        </div>

        <div className="mt-4">
          <label className="text-sm text-gray-300">Notes</label>
          <textarea value={local.note} onChange={(e) => setLocal(prev => ({ ...prev, note: e.target.value }))} className="w-full mt-2 h-32 bg-black/30 border border-white/10 rounded-md p-2 text-white"></textarea>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onSave(local)} className="flex-1 bg-blue-600 px-3 py-2 rounded-md">Save Note</button>
          <button type="button" onClick={onClose} className="flex-1 bg-white/5 px-3 py-2 rounded-md">Close</button>
        </div>
      </div>
    </div>
  )
}
