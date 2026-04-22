import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { register } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
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
      await register({ name, email, password })
      push({ tone: 'success', title: 'Account created', message: 'Welcome!' })
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed'
      setError(msg)
      push({ tone: 'error', title: 'Registration failed', message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      <div className="card hidden overflow-hidden md:block">
        <div className="p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
            Get started
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Create your space.</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your notes are tied to your account and protected with JWT authentication.
          </p>
          <div className="mt-6 rounded-2xl border bg-white/70 p-4 text-sm text-slate-700">
            <div className="font-semibold">Pro tip</div>
            <div className="mt-1 text-slate-600">
              After registering, open the dashboard and use <span className="font-medium">New note</span> to
              create notes instantly.
            </div>
          </div>
        </div>
        <div className="h-28 bg-gradient-to-r from-indigo-700 via-sky-600 to-emerald-500" />
      </div>

      <div className="card mx-auto w-full max-w-md p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
      <p className="mt-1 text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-medium text-slate-900 underline" to="/login">
          Login
        </Link>
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            autoComplete="name"
            className="input mt-1"
            placeholder="Your name"
            required
          />
        </label>

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
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm outline-none"
              placeholder="At least 6 characters"
              minLength={6}
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
          <div className="mt-1 text-xs text-slate-500">
            Use at least 6 characters. You can change it later.
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>
      </div>
    </div>
  )
}

