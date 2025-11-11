export const formatISO = (d: Date) => d.toISOString().slice(0, 10)

export const monthYearLabel = (date: Date) => {
  return date.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export const weekdayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export function monthGrid(year: number, month: number) {
  // month: 0-based
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const daysInMonth = last.getDate()
  const startWeekday = first.getDay()
  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
