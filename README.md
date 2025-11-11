# FocusFlow — Daily focus & habit tracker

This workspace contains a Vite + React + TypeScript scaffold and core components for FocusFlow, a lightweight daily focus and habit tracker.

Quick start (Windows PowerShell):

```powershell
npm install
npm run dev
```

Notes:
- Tailwind v4 is declared in package.json; adjust versions if needed.
- Icons come from `lucide-react`.
- Data persists to `localStorage` under keys `dayData`, `dg_notes`, and `guidelineCompleted`.

Files of interest:
- `src/App.tsx` - navigation and page switch
- `src/components/DailyGuidelines.tsx` - guidelines view and notes
- `src/components/CalendarView.tsx` - calendar, dashboard, and modal hook-up
- `src/components/DayModal.tsx` - modal UI for day details

If you want me to run `npm install` and start the dev server here, say so and I'll run the commands in a terminal.
