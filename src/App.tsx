import React, { useState } from 'react'
import DailyGuidelines from './components/DailyGuidelines'
import CalendarView from './components/CalendarView'
import { ListChecks, Calendar } from 'lucide-react'

export default function App() {
  const [page, setPage] = useState<'guidelines' | 'calendar'>('guidelines')
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      <nav className="w-full border-b border-white/10 backdrop-blur-sm bg-black/20 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Dopamine Project</h1>
            <p className="text-sm text-gray-400">Discipline is choosing what you want most over what you want now.</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setPage('guidelines')} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${page==='guidelines' ? 'bg-blue-600 shadow-glow-blue' : 'bg-white/5 hover:bg-white/10'}`}>
              <ListChecks className="w-5 h-5" />
              <span>Guidelines</span>
            </button>
            <button onClick={() => setPage('calendar')} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${page==='calendar' ? 'bg-blue-600 shadow-glow-blue' : 'bg-white/5 hover:bg-white/10'}`}>
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </button>
            
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {page === 'guidelines' ? <DailyGuidelines /> : <CalendarView />}
      </main>
    </div>
  )
}
