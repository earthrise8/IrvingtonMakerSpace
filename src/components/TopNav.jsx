import { NavLink } from 'react-router-dom'

const linkBase = 'px-3 py-2 rounded-md text-sm font-semibold transition-colors'

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <NavLink to="/" className="text-white font-bold tracking-wide text-lg">
          Irvington PrinterOps
        </NavLink>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${linkBase} ${isActive ? 'bg-cyan-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`}
          >
            Live Dashboard
          </NavLink>
          <NavLink
            to="/submit"
            className={({ isActive }) => `${linkBase} ${isActive ? 'bg-cyan-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`}
          >
            Submit Job
          </NavLink>
          <NavLink
            to="/status"
            className={({ isActive }) => `${linkBase} ${isActive ? 'bg-cyan-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`}
          >
            Track Status
          </NavLink>
          <NavLink
            to="/admin/login"
            className={({ isActive }) => `${linkBase} ${isActive ? 'bg-rose-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`}
          >
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  )
}