import React, { useEffect, useMemo, useRef, useState } from 'react'
import Confetti from './Confetti'
import type { Guideline, Note } from '../types'
import { Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { formatISO } from '../utils/dateUtils'

const defaultGuidelines: Guideline[] = [
  { driver: 'Phone Use', category: 'Digital', whatToDo: 'Use phone only for essentials (calls, texts, tasks).', dailyLimit: '≤ 2 hours', whyItHelps: 'Reduces overstimulation and boosts focus.' },
  { driver: 'YouTube / Twitch', category: 'Entertainment', whatToDo: 'Watch only selected videos or shows you planned.', dailyLimit: '≤ 1.5 hrs / 2 episodes', whyItHelps: 'Encourages mindful entertainment and saves time.' },
  { driver: 'Headphones Time', category: 'Audio', whatToDo: 'Use headphones for music/podcasts, not constant media.', dailyLimit: '≤ 3 hours', whyItHelps: 'Relaxation sensory input and improves presence.' },
  { driver: 'Focus / Work Blocks', category: 'Productivity', whatToDo: 'Work deeply without distractions.', dailyLimit: '≥ 1 session (45-90 min)', whyItHelps: 'Builds discipline and productivity.' },
  { driver: 'Movement / Physical Activity', category: 'Health', whatToDo: 'Engage in any physical movement.', dailyLimit: '≥ 30 min', whyItHelps: 'Increases energy, mood, and mental clarity.' },
  { driver: 'Sleep Routine', category: 'Recovery', whatToDo: 'Maintain consistent sleep schedule.', dailyLimit: '11:00 PM bedtime', whyItHelps: 'Supports recovery and mental clarity.' },
  { driver: 'Mindful Breaks', category: 'Wellness', whatToDo: 'Do something fun intentionally (walk, art, music).', dailyLimit: '30-60 min', whyItHelps: 'Builds positive reinforcement and balance.' },
  { driver: 'Reflection', category: 'Mental', whatToDo: 'Journal or think about your day.', dailyLimit: '10 min', whyItHelps: 'Improves self-awareness and mental balance.' }
]

export default function DailyGuidelines() {
  const [completed, setCompleted] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem('guidelineCompleted')
      const savedDate = localStorage.getItem('guidelineCompletedDate')
      const todayKey = formatISO(new Date())
      const len = defaultGuidelines.length
      if (!raw) {
        // no saved state
        try { localStorage.setItem('guidelineCompletedDate', todayKey) } catch {}
        return Array(len).fill(false)
      }
      const arr = JSON.parse(raw)
      // if we have a saved date and it's different from today, reset
      if (savedDate && savedDate !== todayKey) {
        try { localStorage.setItem('guidelineCompletedDate', todayKey) } catch {}
        return Array(len).fill(false)
      }
      // otherwise keep existing array and ensure date is set
      try { localStorage.setItem('guidelineCompletedDate', todayKey) } catch {}
      return Array.isArray(arr) ? arr : Array(len).fill(false)
    } catch {
      return Array(defaultGuidelines.length).fill(false)
    }
  })

  useEffect(() => {
    localStorage.setItem('guidelineCompleted', JSON.stringify(completed))
  }, [completed])

  // Ensure the completed array resets at midnight each day.
  useEffect(() => {
    let timer: number | undefined
    const scheduleReset = () => {
      const now = new Date()
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      const ms = tomorrow.getTime() - now.getTime()
      timer = window.setTimeout(() => {
        setCompleted(Array(defaultGuidelines.length).fill(false))
        try { localStorage.setItem('guidelineCompletedDate', formatISO(new Date())) } catch {}
        // schedule next reset
        scheduleReset()
      }, ms + 50)
    }

    const checkAndResetNow = () => {
      const todayKey = formatISO(new Date())
      const savedDate = localStorage.getItem('guidelineCompletedDate')
      if (savedDate !== todayKey) {
        setCompleted(Array(defaultGuidelines.length).fill(false))
        try { localStorage.setItem('guidelineCompletedDate', todayKey) } catch {}
      }
    }

    scheduleReset()
    document.addEventListener('visibilitychange', checkAndResetNow)
    window.addEventListener('focus', checkAndResetNow)
    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', checkAndResetNow)
      window.removeEventListener('focus', checkAndResetNow)
    }
  }, [])

  const completedCount = useMemo(() => completed.filter(Boolean).length, [completed])
  const percent = Math.round((completedCount / defaultGuidelines.length) * 100)

  const prevPercentRef = useRef<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // play a short cheerful arpeggio using WebAudio API
  function playCheer() {
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as any
      const ctx = new Ctx()
      const now = ctx.currentTime

      const makeTone = (freq: number, start = 0, dur = 0.6) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(freq, now + start)
        g.gain.setValueAtTime(0.0001, now + start)
        g.gain.exponentialRampToValueAtTime(0.18, now + start + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(now + start)
        o.stop(now + start + dur + 0.05)
      }

      makeTone(523.25, 0) // C5
      makeTone(659.25, 0.06) // E5
      makeTone(783.99, 0.12) // G5
      // close context after sounds play
      setTimeout(() => { try { ctx.close() } catch {} }, 1200)
    } catch (e) {
      // ignore autoplay or audio errors
    }
  }

  // trigger celebration when percent reaches 100%
  useEffect(() => {
    const prev = prevPercentRef.current
    if (percent === 100 && prev !== 100) {
      setShowConfetti(true)
      playCheer()
      const t = setTimeout(() => setShowConfetti(false), 4500)
      return () => clearTimeout(t)
    }
    prevPercentRef.current = percent
  }, [percent])

  // progress history for percent change (by date)
  const [history, setHistory] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem('guidelineProgressHistory')
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  })

  // update history for today whenever percent changes
  useEffect(() => {
    const todayKey = formatISO(new Date())
    setHistory(prev => {
      const copy = { ...prev, [todayKey]: percent }
      try { localStorage.setItem('guidelineProgressHistory', JSON.stringify(copy)) } catch {}
      return copy
    })
  }, [percent])

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = formatISO(yesterday)
  const prevPercent = history[yesterdayKey] ?? null
  const delta = prevPercent === null ? null : Math.round(percent - prevPercent)

  // Notes
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem('dg_notes')
      return raw ? JSON.parse(raw) : [
        { id: '1', text: 'Felt good today! Managed to stay off social media during work hours.', timestamp: '2025-11-09T16:45:00', status: 'open' },
        { id: '2', text: 'Struggled with phone usage in the evening. Need better evening routine.', timestamp: '2025-11-08T20:30:00', status: 'open' },
        { id: '3', text: 'Great focus session! 90 min of deep work.', timestamp: '2025-11-08T14:15:00', status: 'open' }
      ]
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('dg_notes', JSON.stringify(notes))
  }, [notes])

  const [draft, setDraft] = useState('')

  function toggle(i: number) {
    setCompleted(prev => {
      const copy = [...prev]
      copy[i] = !copy[i]
      return copy
    })
  }

  function addNote() {
    if (!draft.trim()) return
    const n: Note = { id: Date.now().toString(), text: draft.trim(), timestamp: new Date().toISOString(), status: 'open' }
    setNotes(prev => [n, ...prev])
    setDraft('')
  }

  function delNote(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {showConfetti ? <Confetti burst={true} /> : null}
      <div className="lg:col-span-2">
        <div className="rounded-2xl p-4 mb-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Daily Guideline</h2>
              <div className="text-sm text-gray-300 flex items-center gap-3">
                <div className="font-medium">{completedCount}/8</div>
                <div className="text-sm">{percent}%</div>
                {/* Percent change badge */}
                {delta === null ? (
                  <div className="text-xs text-gray-400">—</div>
                ) : (
                  <div className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full ${delta >= 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{delta >= 0 ? `+${delta}%` : `${delta}%`}</span>
                  </div>
                )}
              </div>
            </div>

          {/* progress bar */}
          <div className="mt-3 h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-400 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/2">
          <table className="w-full">
            <thead className="bg-white/5 text-left text-sm text-gray-300">
              <tr>
                <th className="p-3">Done</th>
                <th className="p-3">Driver</th>
                <th className="p-3">Category</th>
                <th className="p-3">What To Do</th>
                <th className="p-3">Daily Limit</th>
                <th className="p-3">Why It Helps</th>
              </tr>
            </thead>
            <tbody>
              {defaultGuidelines.map((g, i) => (
                <tr key={g.driver} className={`${completed[i] ? 'bg-green-500/10' : ''} hover:bg-white/5 border-t border-white/5`}>
                  <td className="p-3">
                    <button onClick={() => toggle(i)} className={`w-6 h-6 rounded-md flex items-center justify-center ${completed[i] ? 'bg-green-500 text-white' : 'border border-gray-400 text-transparent hover:border-white/30'}`}>
                      {completed[i] ? '✓' : ''}
                    </button>
                  </td>
                  <td className={`p-3 ${completed[i] ? 'line-through text-gray-300' : ''}`}>{g.driver}</td>
                  <td className="p-3"><span className="text-sm bg-blue-500/20 px-2 py-1 rounded-md">{g.category}</span></td>
                  <td className="p-3 text-sm text-gray-300">{g.whatToDo}</td>
                  <td className="p-3 text-purple-300">{g.dailyLimit}</td>
                  <td className="p-3 text-gray-400 text-sm">{g.whyItHelps}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-white/5 text-center text-sm">Built for focus — plan today; think if you pressed 'Skip to laptop & iPhone.'</div>
        </div>
      </div>

      <aside className="rounded-2xl p-4 bg-gradient-to-b from-slate-900/80 to-indigo-950/60 border border-white/10 backdrop-blur-sm">
        <h3 className="text-lg font-semibold">Notes</h3>
        <p className="text-sm text-gray-400 mb-3">Space for daily thoughts or adjustments. Your notes are saved locally in this browser.</p>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-md p-2 h-24 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Write your thoughts..."></textarea>
        <button onClick={addNote} disabled={!draft.trim()} className={`w-full mt-3 px-3 py-2 rounded-md flex items-center justify-center gap-2 ${draft.trim() ? 'bg-blue-600' : 'bg-gray-600/30 cursor-not-allowed'}`}>
          <Save className="w-4 h-4" /> Save
        </button>

        <h4 className="mt-4 text-sm text-gray-300">Saved notes</h4>
        <div className="mt-2 space-y-2">
          {notes.map(n => (
            <div key={n.id} className="p-3 bg-black/30 border border-white/10 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="text-gray-300 text-sm">{n.text}</div>
                <button onClick={() => delNote(n.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="text-xs text-gray-500 mt-2">{new Date(n.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
