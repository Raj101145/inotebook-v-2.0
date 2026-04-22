import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function cn(...xs) {
  return xs.filter(Boolean).join(' ')
}

function Icon({ children }) {
  return <span className="inline-grid h-5 w-5 place-items-center">{children}</span>
}

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const { push } = useToast()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = useMemo(() => {
    if (!isAuthenticated) return []
    return [
      { to: '/', label: 'Dashboard' },
      { to: '/notes/new', label: 'New note' },
    ]
  }, [isAuthenticated])

  const pageTitle = useMemo(() => {
    if (location.pathname === '/') return 'Dashboard'
    if (location.pathname === '/notes/new') return 'Create note'
    if (location.pathname.startsWith('/notes/')) return 'Edit note'
    if (location.pathname === '/login') return 'Login'
    if (location.pathname === '/register') return 'Register'
    return 'iNotebook'
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(15,23,42,0.10),transparent_50%),radial-gradient(1000px_circle_at_80%_10%,rgba(99,102,241,0.14),transparent_45%),linear-gradient(to_bottom,#f8fafc,white)]">
      <header className="sticky top-0 z-10 border-b bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                iN
              </span>
              <span className="hidden sm:inline">iNotebook</span>
            </Link>

            <span className="hidden text-sm font-medium text-slate-500 md:inline">
              {pageTitle}
            </span>
          </div>

          {isAuthenticated ? (
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-2 text-sm font-semibold transition',
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setMobileOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:hidden"
                >
                  <Icon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </Icon>
                  Menu
                </button>

                <div className="hidden items-center gap-2 sm:flex">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                    {(user?.name || user?.email || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="hidden flex-col leading-tight md:flex">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs text-slate-500">{user?.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout()
                    push({ tone: 'info', title: 'Signed out', message: 'You have been logged out.' })
                    navigate('/login')
                  }}
                  className="btn btn-ghost hidden md:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {isAuthenticated && mobileOpen ? (
          <div className="border-t bg-white/80 backdrop-blur md:hidden">
            <div className="mx-auto max-w-5xl px-4 py-3">
              <div className="grid gap-2">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-xl px-3 py-2 text-sm font-semibold transition',
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    logout()
                    push({ tone: 'info', title: 'Signed out', message: 'You have been logged out.' })
                    navigate('/login')
                  }}
                  className="btn btn-ghost justify-start"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t bg-white/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>iNotebook • Notes that stay with you</span>
          <span className="text-xs">Tip: Create notes quickly from the dashboard.</span>
        </div>
      </footer>
    </div>
  )
}

