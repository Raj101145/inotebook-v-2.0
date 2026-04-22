import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      push({ tone: 'success', title: 'Welcome back', message: 'Login successful.' })
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed'
      setError(msg)
      push({ tone: 'error', title: 'Login failed', message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      <div className="card hidden overflow-hidden md:block">
        <div className="p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Secure notes
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Welcome back.</h2>
          <p className="mt-2 text-sm text-slate-600">
            Log in to access your notes, create new ones, and edit anywhere.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-white">
                ✓
              </span>
              <div>
                <div className="font-semibold">Fast</div>
                <div className="text-slate-600">Quick create, search, and keyboard save.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white">
                ✓
              </span>
              <div>
                <div className="font-semibold">Private</div>
                <div className="text-slate-600">Each note belongs to your account.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-28 bg-gradient-to-r from-slate-900 via-indigo-700 to-sky-600" />
      </div>

      <div className="card mx-auto w-full max-w-md p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="mt-1 text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link className="font-medium text-slate-900 underline" to="/register">
          Register
        </Link>
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className="input mt-1"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="mt-1 flex overflow-hidden rounded-md border focus-within:border-slate-400">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm outline-none"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="border-l bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
      </div>
    </div>
  )
}

