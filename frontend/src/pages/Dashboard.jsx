import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Dashboard() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const { push } = useToast()
  const navigate = useNavigate()

  const [createOpen, setCreateOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  async function load() {
    setError('')
    setLoading(true)
    try {
      const res = await api.get('/notes')
      setNotes(res.data.notes || [])
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load notes'
      setError(msg)
      push({ tone: 'error', title: 'Could not load notes', message: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function quickCreate() {
    if (!createTitle.trim()) {
      push({ tone: 'error', title: 'Missing title', message: 'Please add a title.' })
      return
    }

    setCreating(true)
    try {
      const res = await api.post('/notes', {
        title: createTitle,
        description: createDescription,
      })
      const note = res.data.note
      setNotes((prev) => [note, ...prev])
      push({ tone: 'success', title: 'Created', message: 'Note added to your dashboard.' })
      setCreateOpen(false)
      setCreateTitle('')
      setCreateDescription('')
      navigate(`/notes/${note._id}`)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create note'
      push({ tone: 'error', title: 'Create failed', message: msg })
    } finally {
      setCreating(false)
    }
  }

  function askDelete(noteId) {
    setPendingDeleteId(noteId)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    const noteId = pendingDeleteId
    if (!noteId) return

    setConfirmOpen(false)
    setPendingDeleteId(null)

    // Optimistic UI: remove immediately
    const prev = notes
    setNotes((cur) => cur.filter((n) => n._id !== noteId))

    try {
      await api.delete(`/notes/${noteId}`)
      push({ tone: 'success', title: 'Deleted', message: 'Note removed.' })
    } catch (err) {
      setNotes(prev)
      const msg = err?.response?.data?.message || 'Delete failed'
      push({ tone: 'error', title: 'Delete failed', message: msg })
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => {
      const t = String(n.title || '').toLowerCase()
      const d = String(n.description || '').toLowerCase()
      return t.includes(q) || d.includes(q)
    })
  }, [notes, query])

  const hasNotes = useMemo(() => filtered.length > 0, [filtered])

  return (
    <div className="space-y-4">
      <Modal
        open={createOpen}
        title="Quick create"
        onClose={() => {
          if (creating) return
          setCreateOpen(false)
        }}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none transition focus:border-slate-400"
              placeholder="New note title"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              className="mt-1 min-h-32 w-full rounded-md border px-3 py-2 outline-none transition focus:border-slate-400"
              placeholder="Optional…"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              className="rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={quickCreate}
              disabled={creating}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete note?"
        message="This cannot be undone."
        confirmText="Delete"
        danger
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Notes</h1>
          <p className="text-sm text-slate-600">Create, edit and manage your notes.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.99]"
          >
            New note
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-full rounded-xl border bg-white px-3 py-2 pr-10 text-sm outline-none transition focus:border-slate-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="text-sm text-slate-600">
          {loading ? '—' : `${filtered.length} note${filtered.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="animate-pulse rounded-xl border bg-white p-4"
            >
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : hasNotes ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((n) => (
            <div
              key={n._id}
              className="group rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/notes/${n._id}`} className="block">
                    <h2 className="truncate text-base font-semibold group-hover:text-slate-900">
                      {n.title}
                    </h2>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                      {n.description || '—'}
                    </p>
                  </Link>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    to={`/notes/${n._id}`}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => askDelete(n._id)}
                    className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-10 text-center">
          <div className="mx-auto max-w-sm text-sm text-slate-600">
            {query ? (
              <>
                No notes match <span className="font-medium text-slate-900">&quot;{query}&quot;</span>.
              </>
            ) : (
              <>No notes yet. Create your first one.</>
            )}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Create a note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

