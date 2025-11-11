export interface DayData {
  date: string // YYYY-MM-DD
  status: 'success' | 'failed' | null
  note: string
}

export interface Guideline {
  driver: string
  category: string
  whatToDo: string
  dailyLimit: string
  whyItHelps: string
}

export interface Note {
  id: string
  text: string
  timestamp: string
  status: 'open' | 'delete'
}
