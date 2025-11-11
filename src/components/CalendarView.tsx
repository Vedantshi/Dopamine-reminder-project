import React, { useEffect, useMemo, useState } from 'react'
import { monthGrid, monthYearLabel, weekdayNames, formatISO } from '../utils/dateUtils'
import type { DayData } from '../types'
import DayModal from './DayModal'
import { CheckCircle, XCircle, Circle, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

const sample: DayData[] = [
  { date: '2025-11-05', status: 'success', note: 'Great day! Followed all guidelines.' },
  { date: '2025-11-07', status: 'success', note: 'Productive work session, stayed focused.' },
  { date: '2025-11-08', status: 'failed', note: 'Struggled with phone usage. Need to improve.' },
  { date: '2025-11-09', status: 'success', note: 'Back on track! Good discipline today.' }
]

export default function CalendarView() {
  const today = new Date()
  const [displayDate, setDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const [data, setData] = useState<Record<string, DayData>>(() => {
    try {
      const raw = localStorage.getItem('dayData')
      if (raw) return JSON.parse(raw)
      const map: Record<string, DayData> = {}
      sample.forEach(s => map[s.date] = s)
      return map
    } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem('dayData', JSON.stringify(data))
  }, [data])

  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()
  const grid = monthGrid(year, month)

  const stats = useMemo(() => {
    let success = 0, failed = 0, tracked = 0
    Object.values(data).forEach(d => {
      const dt = new Date(d.date)
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        if (d.status === 'success') success++
        if (d.status === 'failed') failed++
        if (d.status !== null || (d.note && d.note.trim())) tracked++
      }
    })
    return { success, failed, tracked }
  }, [data, year, month])

  const [modalDay, setModalDay] = useState<DayData | null>(null)
  const [hoverNote, setHoverNote] = useState<{ key: string; note: string; rect: DOMRect } | null>(null)

  function openFor(dayNum: number) {
    if (!dayNum) return
    const d = new Date(year, month, dayNum)
    const key = formatISO(d)
    const dd = data[key] ?? { date: key, status: null, note: '' }
    setModalDay(dd)
  }

  function clearDay(dayKey: string) {
    setData(prev => {
      const copy = { ...prev }
      delete copy[dayKey]
      return copy
    })
  }

  function saveDay(updated: DayData) {
    setData(prev => ({ ...prev, [updated.date]: updated }))
    setModalDay(updated)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-green-600/20 to-green-800/20 border border-green-400/20">
          <div className="flex items-center gap-3"><div className="p-2 rounded-full bg-green-500/20"><CheckCircle className="w-6 h-6 text-green-400" /></div><div>
            <div className="text-sm text-gray-300">Success Days</div>
            <div className="text-lg font-semibold">{stats.success}</div>
          </div></div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-b from-red-600/20 to-red-800/20 border border-red-400/20">
          <div className="flex items-center gap-3"><div className="p-2 rounded-full bg-red-500/20"><XCircle className="w-6 h-6 text-red-400" /></div><div>
            <div className="text-sm text-gray-300">Struggled Days</div>
            <div className="text-lg font-semibold">{stats.failed}</div>
          </div></div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-600/20 to-purple-800/20 border border-blue-400/20">
          <div className="flex items-center gap-3"><div className="p-2 rounded-full bg-blue-500/20"><Circle className="w-6 h-6 text-blue-400" /></div><div>
            <div className="text-sm text-gray-300">Days Tracked</div>
            <div className="text-lg font-semibold">{stats.tracked}</div>
          </div></div>
        </div>
      </div>

      <div className="rounded-2xl p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10">
        <div className="flex items-center justify-between">
          <button onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 rounded-md bg-white/5 hover:bg-white/10"><ChevronLeft /></button>
          <div className="font-semibold">{monthYearLabel(displayDate)}</div>
          <button onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 rounded-md bg-white/5 hover:bg-white/10"><ChevronRight /></button>
        </div>
      </div>

      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
        <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-400">
          {weekdayNames.map(w => <div key={w}>{w}</div>)}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {grid.map((d, idx) => {
            const isToday = d && formatISO(new Date(year, month, d)) === formatISO(new Date())
            const key = d ? formatISO(new Date(year, month, d)) : `empty-${idx}`
            const dayData = d ? data[key] : null

            // Compute classes so hover background does NOT override status-colored backgrounds,
            // but still provide a subtle hover animation (scale + shadow) for feedback.
            const baseBg = d ? (dayData?.status ? '' : 'bg-white/5') : 'bg-transparent'
            const hoverClass = d
              ? (dayData?.status
                ? 'cursor-pointer transform hover:scale-105 hover:shadow-md transition-all duration-150'
                : 'cursor-pointer transform hover:scale-105 hover:shadow-sm hover:bg-white/10 transition-all duration-150')
              : ''
            const statusClass = dayData?.status === 'success'
              ? 'bg-green-600/30 border-green-500/50 success'
              : (dayData?.status === 'failed' ? 'bg-red-600/30 border-red-500/50 failed' : '')

            return (
              <div
                key={key}
                onClick={() => d && openFor(d)}
                onMouseEnter={(e) => {
                  if (d && dayData?.note && dayData.note.trim()) {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    setHoverNote({ key, note: dayData.note, rect })
                  }
                }}
                onMouseLeave={() => setHoverNote(null)}
                className={`day-cell aspect-square rounded-lg border border-white/10 p-2 flex flex-col items-start justify-between text-xs ${baseBg} ${hoverClass} ${isToday ? 'today' : ''} ${statusClass}`}>
                <div className="w-full flex justify-between items-start">
                  <div className={`${isToday ? 'ring-2 ring-blue-500 rounded-full px-2' : ''}`}>{d ?? ''}</div>
                  <div className="flex items-center gap-2">
                    {dayData?.note ? <div className="w-2 h-2 rounded-full bg-yellow-400" /> : null}
                    {/* Clear button: stopPropagation so it doesn't open modal */}
                    {d ? (
                      <button onClick={(e) => { e.stopPropagation(); clearDay(key) }} title="Clear day" className="p-1 rounded-md bg-white/5 hover:bg-white/10">
                        <Trash2 className="w-4 h-4 text-gray-300" />
                      </button>
                    ) : null}
                  </div>
                </div>
                {/* small inline preview under the date */}
                {dayData?.note ? (
                  <div className="mt-2 w-full text-[10px] text-yellow-100/90 truncate">{dayData.note}</div>
                ) : null}
              </div>
            )
          })}
        </div>
        {/* Hover tooltip for notes */}
        {hoverNote ? (
          <div style={{ position: 'fixed', left: hoverNote.rect.left + hoverNote.rect.width / 2, top: hoverNote.rect.top - 8, transform: 'translate(-50%, -100%)', zIndex: 80 }}>
            <div className="max-w-xs w-64 p-2 rounded-md bg-black/90 text-white text-sm shadow-lg border border-white/10" style={{ whiteSpace: 'pre-wrap' }}>
              {hoverNote.note}
            </div>
          </div>
        ) : null}
        <div className="mt-3 p-2 bg-white/5 border-t border-white/10 text-center text-sm">Click on any day to mark it as success (green) or struggled (red), and add notes</div>
      </div>

      {modalDay ? <DayModal day={modalDay} onClose={() => setModalDay(null)} onSave={(d) => { saveDay(d); setModalDay(null) }} /> : null}
    </div>
  )
}
